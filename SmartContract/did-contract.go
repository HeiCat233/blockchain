package main

import (
	"encoding/json"
	"fmt"

	"chainmaker.org/chainmaker/common/v2/crypto/util"
	"chainmaker.org/chainmaker/contract-sdk-go/v2/pb/protogo"
	"chainmaker.org/chainmaker/contract-sdk-go/v2/sandbox"
	"chainmaker.org/chainmaker/contract-sdk-go/v2/sdk"
)

// DIDContract DID智能合约
type DIDContract struct{}

func (d *DIDContract) InitContract(stub sdk.ChainStub) {
	sdk.Instance().Infof("DIDContract init success")
}

func (d *DIDContract) UpgradeContract(stub sdk.ChainStub) {
	sdk.Instance().Infof("DIDContract upgrade success")
}

// RegisterIdentity 注册身份
func (d *DIDContract) RegisterIdentity(stub sdk.ChainStub) (*protogo.Response, error) {
	args := stub.GetArgs()
	did := string(args["did"])
	controller := string(args["controller"])
	publicKey := string(args["publicKey"])

	if did == "" || controller == "" || publicKey == "" {
		return sdk.Error("参数不完整: did/controller/publicKey"), nil
	}

	docKey := "did_doc_" + did
	exist, err := stub.GetStateByte(docKey)
	if err != nil {
		return sdk.Error("查询状态失败"), err
	}
	if exist != nil && len(exist) > 0 {
		return sdk.Error("DID已存在: " + did), nil
	}

	doc := map[string]interface{}{
		"id":          did,
		"controller":  controller,
		"publicKey":   publicKey,
		"status":      "active",
		"created":     util.CurrentTimeMillis(),
		"updated":     util.CurrentTimeMillis(),
	}

	docBytes, err := json.Marshal(doc)
	if err != nil {
		return sdk.Error("序列化失败"), err
	}

	err = stub.PutStateByte(docKey, docBytes)
	if err != nil {
		return sdk.Error("状态写入失败"), err
	}

	sdk.Instance().Infof("DID 注册成功: %s", did)
	return sdk.Success([]byte(fmt.Sprintf("DID registered: %s", did))), nil
}

// QueryIdentity 查询身份
func (d *DIDContract) QueryIdentity(stub sdk.ChainStub) (*protogo.Response, error) {
	args := stub.GetArgs()
	did := string(args["did"])

	if did == "" {
		return sdk.Error("参数缺失: did"), nil
	}

	docKey := "did_doc_" + did
	docBytes, err := stub.GetStateByte(docKey)
	if err != nil {
		return sdk.Error("查询失败"), err
	}
	if docBytes == nil || len(docBytes) == 0 {
		return sdk.Error("DID不存在"), nil
	}

	return sdk.Success(docBytes), nil
}

// VerifyIdentity 验证身份
func (d *DIDContract) VerifyIdentity(stub sdk.ChainStub) (*protogo.Response, error) {
	args := stub.GetArgs()
	did := string(args["did"])

	if did == "" {
		return sdk.Error("参数缺失: did"), nil
	}

	docKey := "did_doc_" + did
	docBytes, err := stub.GetStateByte(docKey)
	if err != nil {
		return sdk.Error("查询失败"), err
	}

	var doc map[string]interface{}
	if err = json.Unmarshal(docBytes, &doc); err != nil {
		return sdk.Error("解析失败"), err
	}

	if doc["status"] == "active" {
		return sdk.Success([]byte("true")), nil
	}
	return sdk.Success([]byte("false")), nil
}

// UpdateIdentity 更新身份
func (d *DIDContract) UpdateIdentity(stub sdk.ChainStub) (*protogo.Response, error) {
	args := stub.GetArgs()
	did := string(args["did"])
	controller := string(args["controller"])
	publicKey := string(args["publicKey"])

	if did == "" || controller == "" || publicKey == "" {
		return sdk.Error("参数不完整: did/controller/publicKey"), nil
	}

	docKey := "did_doc_" + did
	docBytes, err := stub.GetStateByte(docKey)
	if err != nil {
		return sdk.Error("查询失败"), err
	}
	if docBytes == nil || len(docBytes) == 0 {
		return sdk.Error("DID不存在"), nil
	}

	var doc map[string]interface{}
	if err = json.Unmarshal(docBytes, &doc); err != nil {
		return sdk.Error("解析失败"), err
	}

	if doc["controller"] != controller {
		return sdk.Error("无权限修改该身份"), nil
	}

	doc["publicKey"] = publicKey
	doc["updated"] = util.CurrentTimeMillis()

	newDocBytes, err := json.Marshal(doc)
	if err != nil {
		return sdk.Error("序列化失败"), err
	}

	err = stub.PutStateByte(docKey, newDocBytes)
	if err != nil {
		return sdk.Error("状态写入失败"), err
	}

	sdk.Instance().Infof("DID 更新成功: %s", did)
	return sdk.Success([]byte(fmt.Sprintf("DID updated: %s", did))), nil
}

// RevokeIdentity 吊销身份
func (d *DIDContract) RevokeIdentity(stub sdk.ChainStub) (*protogo.Response, error) {
	args := stub.GetArgs()
	did := string(args["did"])
	controller := string(args["controller"])

	if did == "" || controller == "" {
		return sdk.Error("参数不完整: did/controller"), nil
	}

	docKey := "did_doc_" + did
	docBytes, err := stub.GetStateByte(docKey)
	if err != nil {
		return sdk.Error("查询失败"), err
	}
	if docBytes == nil || len(docBytes) == 0 {
		return sdk.Error("DID不存在"), nil
	}

	var doc map[string]interface{}
	if err = json.Unmarshal(docBytes, &doc); err != nil {
		return sdk.Error("解析失败"), err
	}

	if doc["controller"] != controller {
		return sdk.Error("无权限吊销该身份"), nil
	}

	doc["status"] = "revoked"
	doc["updated"] = util.CurrentTimeMillis()

	newDocBytes, err := json.Marshal(doc)
	if err != nil {
		return sdk.Error("序列化失败"), err
	}

	err = stub.PutStateByte(docKey, newDocBytes)
	if err != nil {
		return sdk.Error("状态写入失败"), err
	}

	sdk.Instance().Infof("DID 吊销成功: %s", did)
	return sdk.Success([]byte(fmt.Sprintf("DID revoked: %s", did))), nil
}

func main() {
	sandbox.Start(&DIDContract{})
}
