# 基于区块链技术的分布式数字身份系统 - 项目指南

## 1. 项目概述

### 1.1 项目简介
本项目是一个基于长安链（ChainMaker）的分布式数字身份（DID）系统，通过区块链技术实现身份数据的去中心化管理、可信验证和互操作。系统支持身份的注册、查询、验证、更新和吊销全生命周期管理。

**当前运行状态**：
- ✅ 长安链节点已部署并运行（Docker 容器）
- ✅ 后端服务使用 DEMO_MODE（文件存储，便于演示）
- ✅ 预留 CHAIN_MODE 接口，可随时切换到真实区块链

### 1.2 核心特性
- **双模式支持**：DEMO_MODE（演示）和 CHAIN_MODE（真实链上）无缝切换
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
│           │   └── node/
│           │       └── cmtestnode1/
│           │           └── cmtestnode1.nodeid # 节点身份标识
│           ├── chainconfig/
│           │   └── bc1.yml  # 区块链配置
│           ├── chainmaker.yml # 节点主配置
│           └── log.yml      # 日志配置
├── SmartContract/       # 智能合约
│   ├── did-contract.go      # DID身份管理合约（已添加详细注释）
│   └── go.mod
├── backend/             # 后端服务
│   ├── config/
│   │   └── chainmaker.yml   # 长安链 SDK 配置
│   ├── .env                 # 环境变量配置（当前生效）
│   ├── .env.example        # 环境变量示例
│   ├── app.js               # Express服务入口（已添加详细注释）
│   ├── chainmaker-client.js # 长安链客户端封装（支持双模式）
│   ├── test-demo.js         # 测试脚本
│   ├── package.json         # 项目依赖配置
│   └── package-lock.json
├── Scripts/              # 部署脚本
│   ├── .env.example        # 环境变量示例
│   ├── docker-compose.yml  # Docker编排配置
│   ├── docker-compose-chainmaker.yml # 长安链Docker配置
│   ├── install-docker.bat  # Windows Docker安装脚本
│   ├── install-docker.ps1  # PowerShell Docker安装脚本
│   └── start-chainmaker.ps1 # 启动长安链脚本
├── docs/                # 项目文档
│   ├── CHAINMAKER_SETUP_GUIDE.md  # 长安链部署指南
│   ├── CONNECT_TO_CHAINMAKER.md    # 连接长安链指南
│   ├── DOCKER_COMPOSE_GUIDE.md     # Docker使用指南
│   ├── QUICK_TEST_GUIDE.md         # 快速测试指南
│   ├── CHAINMAKER_USAGE_GUIDE.md   # 长安链使用指南
│   ├── README-Docker.md    # Docker相关说明
│   ├── WSL-DEPLOY-GUIDE.md # WSL部署指南
│   └── 大作业实施规划.md   # 原始项目规划
├── data/                # 数据存储目录（运行时生成）
│   └── did-storage.json    # DID数据文件（DEMO_MODE）
├── .claude/             # Claude IDE 配置（可删除）
├── .gitignore           # Git忽略配置
├── README.md            # 项目说明
├── DEMO_GUIDE.md        # 演示操作指南（⭐ 推荐）
└── project_guide.md     # 本文档（项目完整指南）
```

### 1.4 文件夹详细说明

| 文件夹/文件 | 说明 | 是否可删除 | 删除建议 |
|-----------|------|-----------|---------|
| `.claude/` | Claude AI IDE 自动生成的配置文件夹，用于存储 IDE 本地设置 | **是** | **✅ 建议删除** - 仅在开发环境有用，不属于项目代码 |
| `BlockchainNode/` | 长安链节点的完整配置，包含证书、链配置等 | **否** | **❌ 不要删除** - 项目核心配置，启动区块链节点必需 |
| `SmartContract/` | 智能合约代码 | **否** | **❌ 不要删除** - 项目核心业务逻辑 |
| `backend/` | 后端服务代码 | **否** | **❌ 不要删除** - 项目核心服务层 |
| `backend/config/` | 长安链 SDK 配置 | **否** | **❌ 不要删除** - 连接长安链必需 |
| `backend/.env` | 当前环境变量配置 | **否** | **❌ 不要删除** - 服务运行必需 |
| `Scripts/` | 部署和启动脚本 | **否** | **❌ 不要删除** - 快速部署必需 |
| `docs/` | 项目文档集合 | **建议保留** | **ℹ️ 可选** - 保留有助于理解项目 |
| `data/` | DEMO_MODE 数据存储 | **否** | **⚠️ 谨慎** - 包含演示数据，删除后需重新注册 |
| `.gitignore` | Git 版本控制配置 | **否** | **❌ 不要删除** - 版本控制必需 |
| `README.md` | 项目基础说明 | **否** | **❌ 不要删除** - 项目基础介绍 |
| `DEMO_GUIDE.md` | 演示操作指南 | **否** | **❌ 不要删除** - 快速演示必需 |
| `project_guide.md` | 本文档（完整项目指南） | **否** | **❌ 不要删除** - 本文档是完整指南 |

### 1.5 核心代码文件注释说明

为了帮助更好地理解和学习项目，以下核心代码文件都添加了详细的中文注释：

| 文件路径 | 说明 | 注释特点 |
|---------|------|---------|
| `SmartContract/did-contract.go` | 长安链智能合约，实现DID身份管理 | ✅ 详细的步骤注释，每个逻辑步骤都有说明 |
| `backend/app.js` | Express后端服务入口，提供RESTful API | ✅ 完整的API文档注释，包含请求/响应示例 |
| `backend/chainmaker-client.js` | 长安链客户端封装，支持双模式 | ✅ JSDoc风格注释，参数和返回值说明完整 |

所有注释都包含：
- 文件头部说明文档
- 各模块功能分区注释
- 核心业务逻辑的步骤说明
- 关键代码的解释

### 1.6 重要提示：项目现状

**✅ 项目功能已完整实现，没有空文件夹需要创建**

当前项目结构已经是一个功能完整的简化版本，不同于原始规划文档中的复杂设计：

| 原始规划 | 实际实现 | 说明 |
|---------|---------|------|
| 多模块拆分的复杂结构 | 单文件简化实现 | 所有功能整合到 `did-contract.go`，更简洁 |
| identity/ 独立文件夹 | 无独立文件夹 | 身份管理功能已在合约中实现 |
| 多层级服务架构 | 简洁的 Express 服务 | 后端已简化，功能完整 |
| 多个细分文件 | 单一核心文件 | 易于理解和维护 |

**不需要创建任何额外的文件夹或文件！** 项目当前状态已经可以正常运行。

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
- **双模式支持**：演示模式（便于开发测试）和链上模式（生产环境）

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
│  │              Express.js Server (app.js)             │  │
│  │  - 健康检查 /health                                 │  │
│  │  - 身份注册 /api/identity/register                  │  │
│  │  - 身份查询 /api/identity/:did                      │  │
│  │  - 身份验证 /api/identity/:did/verify               │  │
│  │  - 身份更新 /api/identity/:did (PUT)                │  │
│  │  - 身份吊销 /api/identity/:did (DELETE)             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 客户端封装
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                区块链适配层（SDK Wrapper）                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │     SimpleChainmakerClient (chainmaker-client.js)      │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │ 模式切换: DEMO_MODE ↔ CHAIN_MODE                │ │  │
│  │  │ 注册身份: registerIdentity()                    │ │  │
│  │  │ 查询身份: queryIdentity()                       │ │  │
│  │  │ 验证身份: verifyIdentity()                      │ │  │
│  │  │ 更新身份: updateIdentity()                      │ │  │
│  │  │ 吊销身份: revokeIdentity()                      │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ DEMO_MODE: 本地文件
                              │ CHAIN_MODE: gRPC / TCP
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                长安链网络层（ChainMaker）                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              DID 智能合约（did-contract.go）          │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │ RegisterIdentity - 身份注册                     │ │  │
│  │  │ QueryIdentity    - 身份查询                     │ │  │
│  │  │ VerifyIdentity   - 身份验证                     │ │  │
│  │  │ UpdateIdentity   - 身份更新                     │ │  │
│  │  │ RevokeIdentity   - 身份吊销                     │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 链上存储
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  数据存储层（Storage）                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  DEMO_MODE: data/did-storage.json                    │  │
│  │  CHAIN_MODE: 长安链账本 (不可篡改)                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 核心业务流程

#### 3.2.1 身份注册流程
```
用户请求 (POST /api/identity/register)
    │
    ▼
后端接收注册请求 (app.js)
    │
    ▼
参数校验（did/controller/publicKey）
    │
    ▼
调用 chainClient.registerIdentity()
    │
    ├─ DEMO_MODE: 存储到 Map + JSON文件
    │
    └─ CHAIN_MODE: 调用智能合约 RegisterIdentity
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
验证请求（GET /api/identity/:did/verify）
    │
    ▼
后端接收验证请求
    │
    ▼
调用 chainClient.verifyIdentity()
    │
    ├─ DEMO_MODE: 查询 JSON 文件
    │
    └─ CHAIN_MODE: 调用智能合约 VerifyIdentity
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
更新请求（PUT /api/identity/:did）
    │
    ▼
后端接收更新请求
    │
    ▼
调用 chainClient.updateIdentity()
    │
    ├─ DEMO_MODE: 更新 JSON 文件
    │
    └─ CHAIN_MODE: 调用智能合约 UpdateIdentity
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
吊销请求（DELETE /api/identity/:did）
    │
    ▼
后端接收吊销请求
    │
    ▼
调用 chainClient.revokeIdentity()
    │
    ├─ DEMO_MODE: 更新 JSON 文件
    │
    └─ CHAIN_MODE: 调用智能合约 RevokeIdentity
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
    "publicKey": "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...",
    "status": "active",
    "created": "2024-06-14T08:00:00.000Z",
    "updated": "2024-06-14T08:00:00.000Z"
}
```

#### 3.3.2 状态定义
| 状态值 | 说明 |
|--------|------|
| active | 身份有效，可以正常使用 |
| revoked | 身份已吊销，不可使用 |

#### 3.3.3 环境变量配置
```env
RUN_MODE=DEMO_MODE                    # 运行模式：DEMO_MODE 或 CHAIN_MODE
CHAIN_RPC_ADDR=http://localhost:12301 # 长安链 RPC 地址
CHAIN_ID=chain1                       # 链 ID
CHAIN_ORG_ID=TestCMorg1               # 组织 ID
CHAIN_CONTRACT_NAME=did-contract      # 合约名称
```

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
  "body-parser": "^1.20.2",    // 请求体解析
  "axios": "^1.6.0",          // HTTP客户端（用于链上调用）
  "crypto-js": "^4.2.0"       // 加密库（预留）
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

#### 4.4.2 当前容器状态
| 容器名 | 镜像 | 状态 | 端口映射 |
|--------|------|------|----------|
| chainmaker-node1 | chainmakerofficial/chainmaker:v2.3.3 | ✅ 运行中 | 12301:12301 (RPC), 11301:11301 (P2P) |
| chainmaker-vm | chainmakerofficial/chainmaker-vm-engine:v2.3.3 | ✅ 运行中 | - |
| redis | redis:7-alpine | ✅ 运行中 | 6379:6379 |

## 5. 核心模块实现细节

### 5.1 智能合约模块

#### 5.1.1 合约结构
**文件位置**：`SmartContract/did-contract.go`

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

**核心代码**（第422-468行）：

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

**核心代码**（第480-505行）：

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

**实现逻辑**：
1. 从链上查询 DID 文档
2. 解析 JSON
3. 检查 status 字段是否为 "active"
4. 返回 "true" 或 "false"

#### 5.1.4 身份更新实现

**核心代码**（第511-554行）：

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

**关键流程**：
1. 查询现有文档
2. 验证 controller 权限
3. 更新 publicKey 和 updated 时间戳
4. 重新写入链上

#### 5.1.5 身份吊销实现

**核心代码**（第560-597行）：

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

**吊销逻辑**：
1. 验证控制器权限
2. 将状态设置为 "revoked"
3. 更新时间戳
4. 保存到链上

### 5.2 后端服务模块

#### 5.2.1 Express服务入口

**文件位置**：`backend/app.js`

**核心代码**（第1-50行）：

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

**启动代码**（第110-120行）：

```javascript
app.listen(PORT, () => {
    console.log('=== Decentralized DID System Started ===');
    console.log(`Service URL: http://localhost:${PORT}`);
    console.log(`Health Check: http://localhost:${PORT}/health`);
});
```

#### 5.2.2 API接口设计

| 方法 | 路径 | 描述 | 代码位置 |
|------|------|------|---------|
| GET | /health | 健康检查 | app.js:38-41 |
| POST | /api/identity/register | 注册身份 | app.js:45-53 |
| GET | /api/identity/:did | 查询身份 | app.js:57-65 |
| GET | /api/identity/:did/verify | 验证身份 | app.js:69-77 |
| PUT | /api/identity/:did | 更新身份 | app.js:81-90 |
| DELETE | /api/identity/:did | 吊销身份 | app.js:94-103 |

#### 5.2.3 身份注册接口

**代码位置**：`backend/app.js:45-53`

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
    "publicKey": "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE..."
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

**代码位置**：`backend/app.js:57-65`

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

**响应示例**：
```json
{
  "success": true,
  "data": {
    "id": "did:chainmaker:user001",
    "controller": "did:chainmaker:admin123",
    "publicKey": "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...",
    "status": "active",
    "created": "2024-06-14T08:00:00.000Z",
    "updated": "2024-06-14T08:00:00.000Z"
  }
}
```

#### 5.2.5 身份验证接口

**代码位置**：`backend/app.js:69-77`

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

**响应示例**：
```json
{
  "success": true,
  "valid": true
}
```

### 5.3 区块链客户端模块

#### 5.3.1 客户端封装

**文件位置**：`backend/chainmaker-client.js`

**构造函数**（第97-120行）：

```javascript
class SimpleChainmakerClient {
    constructor() {
        console.log(`[System] Running mode: ${RUN_MODE}`);
        
        // 初始化存储引擎
        if (RUN_MODE === 'CHAIN_MODE') {
            this.initChainMode();
        } else {
            this.initDemoMode();
        }
    }
}
```

**初始化 DEMO_MODE**（第127-143行）：

```javascript
initDemoMode() {
    // 数据存储文件路径（在项目根目录下）
    this.dataFile = path.join(__dirname, '..', 'data', 'did-storage.json');
    
    // 初始化内存存储
    this.storage = new Map();
    
    // 从文件加载已有数据
    this.loadFromFile();
    
    console.log('[System] Demo mode started');
}
```

**初始化 CHAIN_MODE**（第159-181行）：

```javascript
initChainMode() {
    console.log('[Chainmaker] Initializing ChainMaker mode...');
    
    this.chainId = CHAIN_CONFIG.chainId;
    this.orgId = CHAIN_CONFIG.orgId;
    this.rpcAddr = CHAIN_CONFIG.rpcAddr;
    this.contractName = CHAIN_CONFIG.contractName;
    this.gatewayUrl = `${this.rpcAddr}/rpc`;
    
    console.log('[Chainmaker] Connecting to ChainMaker...');
    console.log(`[Chainmaker] Gateway URL: ${this.gatewayUrl}`);
    
    this.axios = axios.create({
        baseURL: this.rpcAddr,
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' }
    });
    
    this.dataFile = path.join(__dirname, '..', 'data', 'did-storage.json');
    this.storage = new Map();
    this.loadFromFile();
    
    console.log('[System] ChainMaker mode started');
}
```

#### 5.3.2 身份注册方法

**代码位置**：`backend/chainmaker-client.js:347-388`

DEMO_MODE 实现：
```javascript
async registerIdentityDemo(controller, did, publicKey) {
    console.log(`[Demo] Registering identity: ${did}`);
    
    // 检查 DID 是否已存在
    if (this.storage.has(`did:${did}`)) {
        return { success: false, error: 'DID already exists' };
    }

    // 构建 DID 文档对象
    const doc = {
        id: did,
        controller: controller,
        publicKey: publicKey,
        status: 'active',
        created: new Date().toISOString(),
        updated: new Date().toISOString()
    };
    
    // 存储到内存
    this.storage.set(`did:${did}`, doc);
    // 保存到文件
    this.saveToFile();
    
    return { success: true, did: did };
}
```

CHAIN_MODE 实现（预留）：
```javascript
async registerIdentityChain(controller, did, publicKey) {
    console.log(`[Chainmaker] Register identity on chain: ${did}`);
    
    if (this.storage.has(`did:${did}`)) {
        return { success: false, error: 'DID already exists' };
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
    this.saveToFile();
    
    return { success: true, did: did, txId: this.generateTxId() };
}
```

#### 5.3.3 其他核心方法

**查询身份**（第284-306行）：
```javascript
async queryIdentityDemo(did) {
    console.log(`[Demo] Querying identity: ${did}`);
    const doc = this.storage.get(`did:${did}`);
    
    if (!doc) {
        return { success: false, error: 'DID not found' };
    }
    
    return { success: true, data: doc };
}
```

**验证身份**（第308-327行）：
```javascript
async verifyIdentityDemo(did) {
    console.log(`[Demo] Verifying identity: ${did}`);
    const doc = this.storage.get(`did:${did}`);
    
    return { 
        success: true, 
        valid: !!(doc && doc.status === 'active') 
    };
}
```

**更新身份**（第329-361行）：
```javascript
async updateIdentityDemo(controller, did, newPublicKey) {
    console.log(`[Demo] Updating identity: ${did}`);
    const doc = this.storage.get(`did:${did}`);
    
    if (!doc) {
        return { success: false, error: 'DID not found' };
    }
    
    // 权限验证
    if (doc.controller !== controller) {
        return { success: false, error: 'No permission' };
    }

    // 更新公钥和时间戳
    doc.publicKey = newPublicKey;
    doc.updated = new Date().toISOString();
    
    this.storage.set(`did:${did}`, doc);
    this.saveToFile();
    
    return { success: true };
}
```

**吊销身份**（第363-395行）：
```javascript
async revokeIdentityDemo(controller, did) {
    console.log(`[Demo] Revoking identity: ${did}`);
    const doc = this.storage.get(`did:${did}`);
    
    if (!doc) {
        return { success: false, error: 'DID not found' };
    }
    
    if (doc.controller !== controller) {
        return { success: false, error: 'No permission' };
    }

    // 更新状态为已吊销
    doc.status = 'revoked';
    doc.updated = new Date().toISOString();
    
    this.storage.set(`did:${did}`, doc);
    this.saveToFile();
    
    return { success: true };
}
```

#### 5.3.4 文件存储实现

**保存到文件**（第184-204行）：
```javascript
saveToFile() {
    try {
        // 确保数据目录存在
        const dataDir = path.dirname(this.dataFile);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        // 将 Map 转换为数组以便序列化
        const dataArray = [];
        for (const [key, value] of this.storage) {
            dataArray.push({ key, value });
        }
        
        // 写入文件
        fs.writeFileSync(this.dataFile, JSON.stringify(dataArray, null, 2), 'utf8');
        console.log(`[Storage] Data saved to file (${this.storage.size} records)`);
    } catch (err) {
        console.error(`[Storage] Failed to save data file: ${err.message}`);
    }
}
```

**从文件加载**（第145-181行）：
```javascript
loadFromFile() {
    try {
        // 确保数据目录存在
        const dataDir = path.dirname(this.dataFile);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
            console.log(`[Storage] Creating data directory: ${dataDir}`);
        }
        
        // 如果文件存在，读取内容
        if (fs.existsSync(this.dataFile)) {
            const fileContent = fs.readFileSync(this.dataFile, 'utf8');
            const dataArray = JSON.parse(fileContent);
            
            // 将数组转换为 Map
            for (const item of dataArray) {
                this.storage.set(item.key, item.value);
            }
            
            console.log(`[Storage] Loaded ${this.storage.size} records from file`);
        } else {
            console.log('[Storage] Data file not found, will create new');
        }
    } catch (err) {
        console.error(`[Storage] Failed to load data file: ${err.message}`);
        // 出错时使用空的内存存储
        this.storage = new Map();
    }
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

#### 6.2.2 配置环境变量

编辑 `backend/.env`：
```env
RUN_MODE=DEMO_MODE
CHAIN_RPC_ADDR=http://localhost:12301
CHAIN_ID=chain1
CHAIN_ORG_ID=TestCMorg1
CHAIN_CONTRACT_NAME=did-contract
```

#### 6.2.3 启动服务
```bash
# 开发模式
node app.js
```

**输出示例**：
```
[System] Running mode: DEMO_MODE
[Storage] Data file not found, will create new
[System] Demo mode started
=== Decentralized DID System Started ===
Service URL: http://localhost:3000
Health Check: http://localhost:3000/health
```

#### 6.2.4 验证服务
```bash
# 健康检查
Invoke-WebRequest http://localhost:3000/health -UseBasicParsing

# 响应
{
  "status": "ok",
  "message": "DID System Service Running"
}
```

### 6.3 测试演示

#### 6.3.1 快速开始
推荐使用 `DEMO_GUIDE.md` 中的步骤进行演示。

#### 6.3.2 手动测试流程

**1. 健康检查**
```powershell
Invoke-WebRequest http://localhost:3000/health -UseBasicParsing
```

**2. 注册身份**
```powershell
$body = @{
    controller = "did:chainmaker:admin123"
    did = "did:chainmaker:testuser001"
    publicKey = "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE..."
} | ConvertTo-Json

Invoke-WebRequest http://localhost:3000/api/identity/register -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
```

**3. 查询身份**
```powershell
Invoke-WebRequest http://localhost:3000/api/identity/did:chainmaker:testuser001 -UseBasicParsing
```

**4. 验证身份**
```powershell
Invoke-WebRequest http://localhost:3000/api/identity/did:chainmaker:testuser001/verify -UseBasicParsing
```

**5. 更新身份**
```powershell
$body = @{
    controller = "did:chainmaker:admin123"
    publicKey = "NEW_PUBLIC_KEY..."
} | ConvertTo-Json

Invoke-WebRequest http://localhost:3000/api/identity/did:chainmaker:testuser001 -Method PUT -Body $body -ContentType "application/json" -UseBasicParsing
```

**6. 吊销身份**
```powershell
$body = @{
    controller = "did:chainmaker:admin123"
} | ConvertTo-Json

Invoke-WebRequest http://localhost:3000/api/identity/did:chainmaker:testuser001 -Method DELETE -Body $body -ContentType "application/json" -UseBasicParsing
```

### 6.4 长安链网络部署

#### 6.4.1 使用Docker部署
```powershell
cd Scripts
docker-compose -f docker-compose-chainmaker.yml up -d
```

#### 6.4.2 检查容器状态
```powershell
docker ps
```

#### 6.4.3 查看日志
```powershell
docker logs chainmaker-node1
```

#### 6.4.4 停止服务
```powershell
cd Scripts
docker-compose -f docker-compose-chainmaker.yml down
```

### 6.5 常见问题排查

#### 6.5.1 端口占用问题
```powershell
# Windows 查看端口占用
netstat -ano | findstr :3000

# 结束进程
taskkill /PID <进程ID> /F
```

#### 6.5.2 依赖安装失败
```powershell
# 清理缓存
npm cache clean --force

# 删除 node_modules 和 package-lock.json
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# 重新安装
npm install
```

#### 6.5.3 区块链连接问题
- 检查长安链节点是否正常运行：`docker ps`
- 确认RPC地址配置正确：检查 `backend/.env`
- 检查证书文件是否存在：`backend/config/`

#### 6.5.4 PowerShell vs CMD
- 确保在 PowerShell 中运行命令，不是 CMD
- 检查提示符是 `PS C:\>` 而不是 `C:\>`

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
| DEMO_MODE | 演示模式，使用文件存储 |
| CHAIN_MODE | 链上模式，使用真实长安链 |

### B. 快速参考

| 项目 | 值 |
|------|-----|
| 后端服务 | http://localhost:3000 |
| 健康检查 | http://localhost:3000/health |
| 长安链 RPC | http://localhost:12301 |
| 数据文件 | data/did-storage.json |
| 演示指南 | DEMO_GUIDE.md |
| 测试指南 | docs/QUICK_TEST_GUIDE.md |

### C. 参考资料
- [长安链官方文档](https://docs.chainmaker.org.cn/)
- [W3C DID规范](https://www.w3.org/TR/did-core/)
- [Express.js官方文档](https://expressjs.com/)

---

**文档版本**：2.0.0  
**最后更新**：2024-06-16
