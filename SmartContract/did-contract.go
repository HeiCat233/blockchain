/*
 * 文件名：did-contract.go
 * 功能：基于长安链的分布式数字身份（DID）智能合约
 * 作者：项目开发团队
 * 日期：2024-06-14
 * 描述：实现身份的注册、查询、验证、更新和吊销全生命周期管理
 */

package main

import (
	"encoding/json"
	"fmt"

	// 引入长安链加密工具包，用于时间戳等功能
	"chainmaker.org/chainmaker/common/v2/crypto/util"
	// 引入长安链合约SDK协议定义
	"chainmaker.org/chainmaker/contract-sdk-go/v2/pb/protogo"
	// 引入长安链沙箱环境，用于启动合约
	"chainmaker.org/chainmaker/contract-sdk-go/v2/sandbox"
	// 引入长安链SDK核心包
	"chainmaker.org/chainmaker/contract-sdk-go/v2/sdk"
)

// ======================================================================
// 合约结构体定义
// ======================================================================

// DIDContract 是长安链智能合约的主结构体
// 所有合约方法都绑定到这个结构体上
type DIDContract struct{}

// ======================================================================
// 合约生命周期方法
// ======================================================================

// InitContract 合约初始化方法
// 当合约第一次部署到链上时自动调用
// 参数：stub - 区块链操作存根，用于与链交互
func (d *DIDContract) InitContract(stub sdk.ChainStub) {
	// 记录初始化成功日志
	sdk.Instance().Infof("DIDContract init success")
}

// UpgradeContract 合约升级方法
// 当合约代码更新时调用
func (d *DIDContract) UpgradeContract(stub sdk.ChainStub) {
	// 记录升级成功日志
	sdk.Instance().Infof("DIDContract upgrade success")
}

// ======================================================================
// 核心业务方法
// ======================================================================

// RegisterIdentity 注册新的数字身份
// 功能：在区块链上创建一个新的DID身份记录
// 参数：
//   - stub: 区块链操作存根
// 返回值：
//   - *protogo.Response: 合约执行结果
//   - error: 错误信息
func (d *DIDContract) RegisterIdentity(stub sdk.ChainStub) (*protogo.Response, error) {
	// 步骤1：从调用参数中获取数据
	args := stub.GetArgs()
	did := string(args["did"])              // 获取DID标识符
	controller := string(args["controller"])    // 获取身份控制器（谁控制这个身份）
	publicKey := string(args["publicKey"]) // 获取身份公钥

	// 步骤2：参数完整性校验
	if did == "" || controller == "" || publicKey == "" {
		// 如果参数不完整，返回错误
		return sdk.Error("参数不完整: did/controller/publicKey"), nil
	}

	// 步骤3：构建存储键名
	// 格式：did_doc_ + DID标识符
	docKey := "did_doc_" + did

	// 步骤4：检查DID是否已存在
	exist, err := stub.GetStateByte(docKey)
	if err != nil {
		// 查询链上状态查询失败
		return sdk.Error("查询状态失败"), err
	}
	if exist != nil && len(exist) > 0 {
		// DID已存在，不能重复注册
		return sdk.Error("DID已存在: " + did), nil
	}

	// 步骤5：构建DID文档对象
	doc := map[string]interface{}{
		"id":          did,                    // DID唯一标识符
		"controller":  controller,          // 身份控制器（有权限操作该身份）
		"publicKey":   publicKey,        // 身份公钥（用于签名验证）
		"status":      "active",            // 身份状态，初始为活跃状态
		"created":     util.CurrentTimeMillis(), // 创建时间戳
		"updated":     util.CurrentTimeMillis(), // 更新时间戳
	}

	// 步骤6：将文档对象序列化为JSON字节数组
	docBytes, err := json.Marshal(doc)
	if err != nil {
		// JSON序列化失败
		return sdk.Error("序列化失败"), err
	}

	// 步骤7：将序列化后的数据存储到区块链状态数据库
	err = stub.PutStateByte(docKey, docBytes)
	if err != nil {
		// 链上状态写入失败
		return sdk.Error("状态写入失败"), err
	}

	// 步骤8：记录操作日志
	sdk.Instance().Infof("DID 注册成功: %s", did)

	// 步骤9：返回成功响应
	return sdk.Success([]byte(fmt.Sprintf("DID registered: %s", did))), nil
}

// QueryIdentity 查询身份信息
// 功能：根据DID标识符从区块链上查询完整的身份文档
// 参数：
//   - stub: 区块链操作存根
// 返回值：
//   - *protogo.Response: 包含DID文档数据
//   - error: 错误信息
func (d *DIDContract) QueryIdentity(stub sdk.ChainStub) (*protogo.Response, error) {
	// 步骤1：获取参数
	args := stub.GetArgs()
	did := string(args["did"])

	// 步骤2：参数校验
	if did == "" {
		return sdk.Error("参数缺失: did"), nil
	}

	// 步骤3：构建存储键
	docKey := "did_doc_" + did

	// 步骤4：从链上查询状态
	docBytes, err := stub.GetStateByte(docKey)
	if err != nil {
		return sdk.Error("查询失败"), err
	}

	// 步骤5：检查是否存在
	if docBytes == nil || len(docBytes) == 0 {
		return sdk.Error("DID不存在"), nil
	}

	// 步骤6：返回查询到的数据（JSON格式）
	return sdk.Success(docBytes), nil
}

// VerifyIdentity 验证身份有效性
// 功能：检查身份是否存在且处于活跃状态
// 参数：
//   - stub: 区块链操作存根
// 返回值：
//   - *protogo.Response: "true" 或 "false"
//   - error: 错误信息
func (d *DIDContract) VerifyIdentity(stub sdk.ChainStub) (*protogo.Response, error) {
	// 步骤1：获取参数
	args := stub.GetArgs()
	did := string(args["did"])

	// 步骤2：参数校验
	if did == "" {
		return sdk.Error("参数缺失: did"), nil
	}

	// 步骤3：从链上查询DID文档
	docKey := "did_doc_" + did
	docBytes, err := stub.GetStateByte(docKey)
	if err != nil {
		return sdk.Error("查询失败"), err
	}

	// 步骤4：解析JSON文档
	var doc map[string]interface{}
	if err = json.Unmarshal(docBytes, &doc); err != nil {
		return sdk.Error("解析失败"), err
	}

	// 步骤5：检查身份状态
	if doc["status"] == "active" {
		// 状态为active，返回验证通过
		return sdk.Success([]byte("true")), nil
	}

	// 状态不为active，返回验证失败
	return sdk.Success([]byte("false")), nil
}

// UpdateIdentity 更新身份信息
// 功能：更新身份的公钥，需要身份控制器权限
// 参数：
//   - stub: 区块链操作存根
// 返回值：
//   - *protogo.Response: 执行结果
//   - error: 错误信息
func (d *DIDContract) UpdateIdentity(stub sdk.ChainStub) (*protogo.Response, error) {
	// 步骤1：获取所有参数
	args := stub.GetArgs()
	did := string(args["did"])
	controller := string(args["controller"])
	publicKey := string(args["publicKey"])

	// 步骤2：参数校验
	if did == "" || controller == "" || publicKey == "" {
		return sdk.Error("参数不完整: did/controller/publicKey"), nil
	}

	// 步骤3：查询链上状态
	docKey := "did_doc_" + did
	docBytes, err := stub.GetStateByte(docKey)
	if err != nil {
		return sdk.Error("查询失败"), err
	}
	if docBytes == nil || len(docBytes) == 0 {
		return sdk.Error("DID不存在"), nil
	}

	// 步骤4：解析现有的DID文档
	var doc map[string]interface{}
	if err = json.Unmarshal(docBytes, &doc); err != nil {
		return sdk.Error("解析失败"), err
	}

	// 步骤5：权限校验：只有身份控制器才能更新
	if doc["controller"] != controller {
		return sdk.Error("无权限修改该身份"), nil
	}

	// 步骤6：更新公钥和时间戳
	doc["publicKey"] = publicKey
	doc["updated"] = util.CurrentTimeMillis()

	// 步骤7：序列化更新后的文档
	newDocBytes, err := json.Marshal(doc)
	if err != nil {
		return sdk.Error("序列化失败"), err
	}

	// 步骤8：更新链上状态
	err = stub.PutStateByte(docKey, newDocBytes)
	if err != nil {
		return sdk.Error("状态写入失败"), err
	}

	// 步骤9：记录日志
	sdk.Instance().Infof("DID 更新成功: %s", did)

	// 步骤10：返回成功
	return sdk.Success([]byte(fmt.Sprintf("DID updated: %s", did))), nil
}

// RevokeIdentity 吊销身份
// 功能：将身份状态改为 revoked，使身份失效
// 参数：
//   - stub: 区块链操作存根
// 返回值：
//   - *protogo.Response: 执行结果
//   - error: 错误信息
func (d *DIDContract) RevokeIdentity(stub sdk.ChainStub) (*protogo.Response, error) {
	// 步骤1：获取参数
	args := stub.GetArgs()
	did := string(args["did"])
	controller := string(args["controller"])

	// 步骤2：参数校验
	if did == "" || controller == "" {
		return sdk.Error("参数不完整: did/controller"), nil
	}

	// 步骤3：查询链上状态
	docKey := "did_doc_" + did
	docBytes, err := stub.GetStateByte(docKey)
	if err != nil {
		return sdk.Error("查询失败"), err
	}
	if docBytes == nil || len(docBytes) == 0 {
		return sdk.Error("DID不存在"), nil
	}

	// 步骤4：解析现有文档
	var doc map[string]interface{}
	if err = json.Unmarshal(docBytes, &doc); err != nil {
		return sdk.Error("解析失败"), err
	}

	// 步骤5：权限校验
	if doc["controller"] != controller {
		return sdk.Error("无权限吊销该身份"), nil
	}

	// 步骤6：更新状态为已吊销
	doc["status"] = "revoked"
	doc["updated"] = util.CurrentTimeMillis()

	// 步骤7：序列化并保存
	newDocBytes, err := json.Marshal(doc)
	if err != nil {
		return sdk.Error("序列化失败"), err
	}

	err = stub.PutStateByte(docKey, newDocBytes)
	if err != nil {
		return sdk.Error("状态写入失败"), err
	}

	// 步骤8：记录日志
	sdk.Instance().Infof("DID 吊销成功: %s", did)

	// 步骤9：返回成功
	return sdk.Success([]byte(fmt.Sprintf("DID revoked: %s", did))), nil
}

// ======================================================================
// 合约入口
// ======================================================================

// main 合约启动入口
// 启动长安链智能合约沙箱环境
func main() {
	// 启动合约实例
	sandbox.Start(&DIDContract{})
}
