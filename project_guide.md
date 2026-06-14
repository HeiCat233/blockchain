# 基于区块链技术的分布式数字身份系统 - 项目指南

## 1. 项目概述

### 1.1 项目简介
本项目是一个基于长安链（ChainMaker）的分布式数字身份（DID）系统，通过区块链技术实现身份数据的去中心化管理、可信验证和互操作。系统支持身份的注册、查询、验证、更新和吊销全生命周期管理。

### 1.2 核心特性
- **数据主权**：用户完全控制自己的身份数据
- **可信验证**：区块链提供不可篡改的身份记录
- **跨域互认**：支持不同系统间的身份互操作
- **隐私保护**：最小化信息披露原则
- **完整生命周期**：支持身份从创建到吊销的全流程管理

### 1.3 项目结构
```
blockchain/
├── BlockchainNode/          # 长安链节点配置
│   └── config/
│       └── node1/
│           ├── certs/
│           ├── chainmaker.yml
│           └── bc1.yml
├── SmartContract/       # 智能合约
│   ├── did-contract.go      # DID身份管理合约
│   └── go.mod
├── backend/             # 后端服务
│   ├── app.js               # Express服务入口
│   ├── chainmaker-client.js # 长安链客户端封装
│   ├── test-demo.js         # 测试脚本
│   └── package.json
├── Scripts/              # 部署脚本
│   ├── docker-compose.yml
│   └── docker-compose-chainmaker.yml
└── README.md
```

## 2. 背景与价值

### 2.1 项目背景起源

#### 2.1.1 传统身份管理的痛点
传统的中心化身份管理系统存在以下问题：
- **单点故障**：身份数据集中存储，一旦服务器故障，服务全面瘫痪
- **数据泄露风险**：中心化数据库成为黑客攻击的主要目标
- **用户无主权**：用户无法控制自己的身份数据，平台掌握绝对控制权
- **互操作性差**：不同平台之间身份数据孤立，用户需要重复注册
- **合规成本高**：各平台需要单独进行身份认证，增加合规成本

#### 2.1.2 区块链技术的契机
区块链技术为身份管理带来了新的解决方案：
- **去中心化存储**：身份数据分布式存储，消除单点故障
- **不可篡改记录**：区块链上的身份记录无法被篡改或删除
- **用户自主控制**：用户持有私钥，完全控制身份数据
- **跨域互信**：基于区块链共识，不同系统间可以互认身份
- **可追溯审计**：所有身份操作均可追溯审计

### 2.2 核心目标定位

#### 2.2.1 技术目标
- **高可用性**：系统可用性达到 99.9% 以上
- **高性能**：支持并发处理能力，身份验证响应时间 < 2秒
- **安全性**：遵循等保2.0标准，提供完整的安全防护机制
- **可扩展性**：模块化设计，支持功能扩展和性能水平扩展

#### 2.2.2 业务目标
- 构建完整的数字身份基础设施
- 提供简洁易用的身份管理API
- 支持多场景身份验证应用
- 建立可信的身份生态系统

### 2.3 行业应用价值

#### 2.3.1 金融行业
- **KYC认证**：一次身份认证，多金融机构复用，降低合规成本
- **数字签名**：基于DID的合同签署，具有法律效力
- **风险防控**：可追溯的身份操作记录，便于反洗钱和风控

#### 2.3.2 政务服务
- **一网通办**：跨部门身份互认，减少重复提交材料
- **电子证照**：将各类证件以DID形式链上存证，防伪造防篡改
- **可信身份**：为政务服务提供可信的身份基础

#### 2.3.3 社交与互联网应用
- **用户自主管理**：用户自主控制个人信息，选择性授权
- **跨平台登录**：一次DID身份，登录多个应用
- **数据安全**：避免个人数据被平台滥用或泄露

#### 2.3.4 供应链管理
- **企业身份**：供应链各参与方的可信身份认证
- **资质验证**：企业资质证书链上存证，实时验证有效性
- **交易溯源**：结合身份和交易记录，实现全链路溯源

## 3. 整体架构设计

### 3.1 系统分层架构

```
┌─────────────────────────────────────────────────────────────┐
│                    用户层（Client）                        │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐          │
│  │  Web应用  │ │ 移动应用   │ │ 第三方应用 │          │
│  └────────────┘ └────────────┘ └────────────┘          │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  应用服务层（Backend）                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Express.js Server                        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 客户端封装
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                区块链适配层（SDK Wrapper）                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          SimpleChainmakerClient                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ gRPC / TCP
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                长安链网络层（ChainMaker）                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              DID 智能合约（Go + WASM）               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 链上存储
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  数据存储层（Ledger）                        │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 核心业务流程

#### 3.2.1 身份注册流程
```
用户请求
    │
    ▼
后端接收注册请求
    │
    ▼
参数校验（did/controller/publicKey）
    │
    ▼
调用智能合约 RegisterIdentity
    │
    ▼
合约检查DID是否存在
    │
    ├─ 存在 → 返回错误
    │
    └─ 不存在 → 存储DID文档
                 │
                 ▼
            记录创建时间
                 │
                 ▼
            状态设为 active
                 │
                 ▼
            返回注册成功
```

#### 3.2.2 身份验证流程
```
验证请求（含DID）
    │
    ▼
后端接收验证请求
    │
    ▼
调用智能合约 VerifyIdentity
    │
    ▼
合约查询DID文档
    │
    ▼
检查状态字段
    │
    ├─ status == "active" → 返回 valid: true
    │
    └─ 其他状态 → 返回 valid: false
```

#### 3.2.3 身份更新流程
```
更新请求（did/controller/newPublicKey）
    │
    ▼
后端接收更新请求
    │
    ▼
调用智能合约 UpdateIdentity
    │
    ▼
查询DID文档
    │
    ▼
验证controller权限
    │
    ├─ 不匹配 → 返回权限错误
    │
    └─ 匹配 → 更新publicKey
                │
                ▼
            更新时间戳
                │
                ▼
            存储更新后的文档
                │
                ▼
            返回更新成功
```

#### 3.2.4 身份吊销流程
```
吊销请求（did/controller）
    │
    ▼
后端接收吊销请求
    │
    ▼
调用智能合约 RevokeIdentity
    │
    ▼
查询DID文档
    │
    ▼
验证controller权限
    │
    ├─ 不匹配 → 返回权限错误
    │
    └─ 匹配 → 状态设为 "revoked"
                │
                ▼
            更新时间戳
                │
                ▼
            返回吊销成功
```

### 3.3 数据模型设计

#### 3.3.1 DID文档结构
```javascript
{
    "id": "did:chainmaker:abc123xyz",
    "controller": "did:chainmaker:controller123",
    "publicKey": "-----BEGIN PUBLIC KEY-----\n...",
    "status": "active",
    "created": 1687500000000,
    "updated": 1687500000000
}
```

#### 3.3.2 状态定义
| 状态值 | 说明 |
|--------|------|
| active | 身份有效，可以正常使用 |
| revoked | 身份已吊销，不可使用 |

## 4. 技术栈选型说明

### 4.1 区块链平台选型

#### 4.1.1 为什么选择长安链
| 特性 | Hyperledger Fabric | 长安链 | 说明 |
|------|-------------------|--------|------|
| 开发语言 | Go/Java/Node.js | Go | 本项目使用Go开发智能合约 |
| 国密支持 | 需额外配置 | 原生支持 | 符合国内合规要求 |
| 中文文档 | 英文为主 | 中文完善 | 降低学习和开发成本 |
| 学习曲线 | 陡峭 | 平缓 | 适合快速上手 |
| 部署复杂度 | 较高 | 简化 | Docker一键部署 |
| 社区生态 | 国际社区 | 国内生态 | 本地化支持更好 |
| 性能 | 中等 | 优秀 | 10万+ TPS吞吐能力 |

#### 4.1.2 长安链核心优势
- **高性能共识**：支持TBFT、Raft等多种共识算法，单链TPS可达10万+
- **国密算法**：内置SM2/SM3/SM4国密算法，符合等保2.0要求
- **模块化架构**：可灵活配置共识、存储、权限等模块
- **多级隐私保护**：支持零知识证明、同态加密、数据隔离等隐私方案
- **合约引擎**：支持WASM、EVM等多种合约运行环境

### 4.2 后端技术栈

#### 4.2.1 Node.js + Express.js
- **选型理由**
  - 轻量级、高性能，适合API服务
  - JavaScript语言，开发效率高
  - 丰富的中间件生态
  - 异步非阻塞I/O，适合高并发场景

#### 4.2.2 核心依赖
```json
{
  "express": "^4.18.2",      // Web框架
  "cors": "^2.8.5",           // 跨域支持
  "body-parser": "^1.20.2"    // 请求体解析
}
```

### 4.3 智能合约技术栈

#### 4.3.1 Go + WASM
- **选型理由**
  - Go语言语法简洁，学习曲线平缓
  - 编译为WASM字节码，执行效率高
  - 长安链官方对Go语言合约支持最好
  - 丰富的标准库和工具链

#### 4.3.2 合约SDK
```go
import (
    "chainmaker.org/chainmaker/contract-sdk-go/v2/sdk"
)
```

### 4.4 部署与容器化

#### 4.4.1 Docker + Docker Compose
- **选型理由**
  - 环境一致性，简化部署
  - 容器隔离，安全性高
  - 编排管理，便于扩容
  - 社区成熟，文档丰富

## 5. 核心模块实现细节

### 5.1 智能合约模块

#### 5.1.1 合约结构
```go
// did-contract.go
type DIDContract struct{}

// 合约方法
func (d *DIDContract) RegisterIdentity(stub sdk.ChainStub)
func (d *DIDContract) QueryIdentity(stub sdk.ChainStub)
func (d *DIDContract) VerifyIdentity(stub sdk.ChainStub)
func (d *DIDContract) UpdateIdentity(stub sdk.ChainStub)
func (d *DIDContract) RevokeIdentity(stub sdk.ChainStub)
```

#### 5.1.2 身份注册实现

**代码位置**：`SmartContract/did-contract.go`

```go
// RegisterIdentity 注册身份
func (d *DIDContract) RegisterIdentity(stub sdk.ChainStub) (*protogo.Response, error) {
    // 1. 获取参数
    args := stub.GetArgs()
    did := string(args["did"])
    controller := string(args["controller"])
    publicKey := string(args["publicKey"])

    // 2. 参数校验
    if did == "" || controller == "" || publicKey == "" {
        return sdk.Error("参数不完整: did/controller/publicKey"), nil
    }

    // 3. 检查DID是否已存在
    docKey := "did_doc_" + did
    exist, err := stub.GetStateByte(docKey)
    if err != nil {
        return sdk.Error("查询状态失败"), err
    }
    if exist != nil && len(exist) > 0 {
        return sdk.Error("DID已存在: " + did), nil
    }

    // 4. 创建DID文档
    doc := map[string]interface{}{
        "id":          did,
        "controller":  controller,
        "publicKey":   publicKey,
        "status":      "active",
        "created":     util.CurrentTimeMillis(),
        "updated":     util.CurrentTimeMillis(),
    }

    // 5. 序列化并存储
    docBytes, err := json.Marshal(doc)
    if err != nil {
        return sdk.Error("序列化失败"), err
    }

    err = stub.PutStateByte(docKey, docBytes)
    if err != nil {
        return sdk.Error("状态写入失败"), err
    }

    // 6. 记录日志并返回
    sdk.Instance().Infof("DID 注册成功: %s", did)
    return sdk.Success([]byte(fmt.Sprintf("DID registered: %s", did))), nil
}
```

**关键实现细节**：
- 使用`stub.GetArgs()`获取调用参数
- 使用`stub.GetStateByte()`查询链上状态
- 使用`stub.PutStateByte()`写入链上状态
- 存储键格式：`did_doc_{did}`

#### 5.1.3 身份验证实现

```go
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

    // 验证状态字段
    if doc["status"] == "active" {
        return sdk.Success([]byte("true")), nil
    }
    return sdk.Success([]byte("false")), nil
}
```

#### 5.1.4 身份更新实现

```go
// UpdateIdentity 更新身份
func (d *DIDContract) UpdateIdentity(stub sdk.ChainStub) (*protogo.Response, error) {
    args := stub.GetArgs()
    did := string(args["did"])
    controller := string(args["controller"])
    publicKey := string(args["publicKey"])

    // 查询文档
    docKey := "did_doc_" + did
    docBytes, err := stub.GetStateByte(docKey)
    if err != nil {
        return sdk.Error("查询失败"), err
    }
    if docBytes == nil || len(docBytes) == 0 {
        return sdk.Error("DID不存在"), nil
    }

    // 解析并验证权限
    var doc map[string]interface{}
    if err = json.Unmarshal(docBytes, &doc); err != nil {
        return sdk.Error("解析失败"), err
    }

    if doc["controller"] != controller {
        return sdk.Error("无权限修改该身份"), nil
    }

    // 更新字段
    doc["publicKey"] = publicKey
    doc["updated"] = util.CurrentTimeMillis()

    // 重新序列化并存储
    newDocBytes, err := json.Marshal(doc)
    if err != nil {
        return sdk.Error("序列化失败"), err
    }

    err = stub.PutStateByte(docKey, newDocBytes)
    if err != nil {
        return sdk.Error("状态写入失败"), err
    }

    return sdk.Success([]byte(fmt.Sprintf("DID updated: %s", did))), nil
}
```

#### 5.1.5 身份吊销实现

```go
// RevokeIdentity 吊销身份
func (d *DIDContract) RevokeIdentity(stub sdk.ChainStub) (*protogo.Response, error) {
    args := stub.GetArgs()
    did := string(args["did"])
    controller := string(args["controller"])

    docKey := "did_doc_" + did
    docBytes, err := stub.GetStateByte(docKey)
    if err != nil {
        return sdk.Error("查询失败"), err
    }

    var doc map[string]interface{}
    if err = json.Unmarshal(docBytes, &doc); err != nil {
        return sdk.Error("解析失败"), err
    }

    // 权限验证
    if doc["controller"] != controller {
        return sdk.Error("无权限吊销该身份"), nil
    }

    // 更新状态为吊销
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

    return sdk.Success([]byte(fmt.Sprintf("DID revoked: %s", did))), nil
}
```

### 5.2 后端服务模块

#### 5.2.1 Express服务入口

**代码位置**：`backend/app.js`

```javascript
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const SimpleChainmakerClient = require('./chainmaker-client');

const app = express();
const PORT = 3000;

// 中间件配置
app.use(cors());
app.use(bodyParser.json());

// 初始化区块链客户端
const chainClient = new SimpleChainmakerClient();
```

#### 5.2.2 API接口设计

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /health | 健康检查 |
| POST | /api/identity/register | 注册身份 |
| GET | /api/identity/:did | 查询身份 |
| GET | /api/identity/:did/verify | 验证身份 |
| PUT | /api/identity/:did | 更新身份 |
| DELETE | /api/identity/:did | 吊销身份 |

#### 5.2.3 身份注册接口

```javascript
app.post('/api/identity/register', async (req, res) => {
    try {
        const { controller, did, publicKey } = req.body;
        const result = await chainClient.registerIdentity(controller, did, publicKey);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
```

**请求示例**：
```bash
curl -X POST http://localhost:3000/api/identity/register \
  -H "Content-Type: application/json" \
  -d '{
    "controller": "did:chainmaker:admin123",
    "did": "did:chainmaker:user001",
    "publicKey": "-----BEGIN PUBLIC KEY-----\n..."
  }'
```

**响应示例**：
```json
{
  "success": true,
  "did": "did:chainmaker:user001"
}
```

#### 5.2.4 身份查询接口

```javascript
app.get('/api/identity/:did', async (req, res) => {
    try {
        const did = req.params.did;
        const result = await chainClient.queryIdentity(did);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
```

#### 5.2.5 身份验证接口

```javascript
app.get('/api/identity/:did/verify', async (req, res) => {
    try {
        const did = req.params.did;
        const result = await chainClient.verifyIdentity(did);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
```

### 5.3 区块链客户端模块

#### 5.3.1 客户端封装

**代码位置**：`backend/chainmaker-client.js`

```javascript
class SimpleChainmakerClient {
    constructor() {
        this.chainId = 'chain1';
        this.orgId = 'TestCMorg1';
        this.rpcAddr = 'localhost:12301';
        
        // 内存存储（演示版本）
        this.storage = new Map();
        
        this.loadCerts();
    }
}
```

#### 5.3.2 身份注册方法

```javascript
async registerIdentity(controller, did, publicKey) {
    console.log(`[Chainmaker] 注册身份: ${did}`);
    if (this.storage.has(`did:${did}`)) {
        return { success: false, error: 'DID 已存在' };
    }

    const doc = {
        id: did,
        controller: controller,
        publicKey: publicKey,
        status: 'active',
        created: new Date().toISOString(),
        updated: new Date().toISOString()
    };
    this.storage.set(`did:${did}`, doc);
    return { success: true, did: did };
}
```

#### 5.3.3 其他核心方法

```javascript
// 查询身份
async queryIdentity(did) {
    const doc = this.storage.get(`did:${did}`);
    if (!doc) {
        return { success: false, error: 'DID 不存在' };
    }
    return { success: true, data: doc };
}

// 验证身份
async verifyIdentity(did) {
    const doc = this.storage.get(`did:${did}`);
    if (doc && doc.status === 'active') {
        return { success: true, valid: true };
    }
    return { success: true, valid: false };
}

// 更新身份
async updateIdentity(controller, did, newPublicKey) {
    const doc = this.storage.get(`did:${did}`);
    if (!doc) {
        return { success: false, error: 'DID 不存在' };
    }
    if (doc.controller !== controller) {
        return { success: false, error: '无权限操作' };
    }

    doc.publicKey = newPublicKey;
    doc.updated = new Date().toISOString();
    this.storage.set(`did:${did}`, doc);
    return { success: true };
}

// 吊销身份
async revokeIdentity(controller, did) {
    const doc = this.storage.get(`did:${did}`);
    if (!doc) {
        return { success: false, error: 'DID 不存在' };
    }
    if (doc.controller !== controller) {
        return { success: false, error: '无权限操作' };
    }

    doc.status = 'revoked';
    doc.updated = new Date().toISOString();
    this.storage.set(`did:${did}`, doc);
    return { success: true };
}
```

## 6. 部署运维指南

### 6.1 环境准备

#### 6.1.1 系统要求
- 操作系统：Windows 10/11、macOS 10.14+、Ubuntu 20.04+
- Node.js：16 LTS / 18 LTS / 20+
- Docker：20.10+（如需部署长安链）

#### 6.1.2 安装Node.js
```bash
# Windows
# 从 https://nodejs.org/ 下载安装包

# 验证安装
node --version
npm --version
```

### 6.2 后端服务部署

#### 6.2.1 安装依赖
```bash
cd backend
npm install
```

#### 6.2.2 启动服务
```bash
# 开发模式
node app.js

# 或使用 npm script（如果配置了）
npm start
```

**输出示例**：
```
[Chainmaker] 证书目录存在
=== 分布式DID系统启动成功 ===
服务地址: http://localhost:3000
健康检查: http://localhost:3000/health
```

#### 6.2.3 验证服务
```bash
# 健康检查
curl http://localhost:3000/health

# 响应
{
  "status": "ok",
  "message": "DID 系统服务正常"
}
```

### 6.3 测试演示

#### 6.3.1 运行测试脚本
项目提供了测试演示脚本（如`backend/test-demo.js`。

#### 6.3.2 手动测试流程

**1. 注册身份**
```bash
curl -X POST http://localhost:3000/api/identity/register \
  -H "Content-Type: application/json" \
  -d '{
    "controller": "did:chainmaker:admin001",
    "did": "did:chainmaker:testuser001",
    "publicKey": "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE..."
  }'
```

**2. 查询身份**
```bash
curl http://localhost:3000/api/identity/did:chainmaker:testuser001
```

**3. 验证身份**
```bash
curl http://localhost:3000/api/identity/did:chainmaker:testuser001/verify
```

**4. 更新身份**
```bash
curl -X PUT http://localhost:3000/api/identity/did:chainmaker:testuser001 \
  -H "Content-Type: application/json" \
  -d '{
    "controller": "did:chainmaker:admin001",
    "publicKey": "NEW_PUBLIC_KEY..."
  }'
```

**5. 吊销身份**
```bash
curl -X DELETE http://localhost:3000/api/identity/did:chainmaker:testuser001 \
  -H "Content-Type: application/json" \
  -d '{
    "controller": "did:chainmaker:admin001"
  }'
```

### 6.4 长安链网络部署

#### 6.4.1 使用Docker部署
参考项目中的 `Scripts/docker-compose-chainmaker.yml` 配置文件。

### 6.5 常见问题排查

#### 6.5.1 端口占用问题
```bash
# Windows 查看端口占用
netstat -ano | findstr :3000

# 结束进程
taskkill /PID <进程ID> /F
```

#### 6.5.2 依赖安装失败
```bash
# 清理缓存
npm cache clean --force

# 删除 node_modules 和 package-lock.json
rmdir /s /q node_modules
del package-lock.json

# 重新安装
npm install
```

#### 6.5.3 区块链连接问题
- 检查长安链节点是否正常运行
- 确认RPC地址配置正确
- 检查证书文件是否存在

### 6.6 生产环境建议

#### 6.6.1 安全加固
- 使用HTTPS协议
- 配置防火墙规则
- 定期轮换密钥
- 启用API限流
- 添加身份认证中间件

#### 6.6.2 高可用部署
- 使用PM2管理Node.js进程
- 配置负载均衡
- 数据库主从复制
- 区块链多节点部署

#### 6.6.3 监控运维
- 记录访问日志
- 监控系统资源
- 设置告警机制
- 定期备份数据

## 附录

### A. 术语表
| 术语 | 说明 |
|------|------|
| DID | Decentralized Identifier，去中心化标识符 |
| 长安链 | ChainMaker，国内自主研发的联盟链底层平台 |
| 智能合约 | 部署在区块链上的可执行代码 |
| WASM | WebAssembly，智能合约运行环境 |

### B. 参考资料
- [长安链官方文档](https://docs.chainmaker.org.cn/)
- [W3C DID规范](https://www.w3.org/TR/did-core/)
- [Express.js官方文档](https://expressjs.com/)

---

**文档版本**：1.0.0  
**最后更新**：2024-06-14

---

**文档版本**：1.0.0  
**最后更新**：2024-06-14
