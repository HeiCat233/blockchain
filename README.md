# 基于长安链的分布式数字身份系统 (DID) - 整理版

## 1. 项目简介
本项目是一个基于长安链 (ChainMaker) 实现的分布式数字身份系统。经过结构重组，项目现在更加清晰易懂，适合初学者学习和开发。

---

## 2. 整理后的项目结构说明

| 目录/文件 | 作用说明 |
| :--- | :--- |
| **`SmartContract/`** | **智能合约模块**。包含合约源码 (`did-contract.go`) 和依赖管理 (`go.mod`)。 |
| **`Backend/`** | **后端服务模块**。基于 Node.js 实现的 RESTful API，用于与长安链交互。 |
| &nbsp;&nbsp;└── `app.js` | 后端服务入口，定义了 API 路由。 |
| &nbsp;&nbsp;└── `chainmaker-client.js` | 长安链 SDK 封装，负责与链节点通信。 |
| &nbsp;&nbsp;└── `test-demo.js` | 自动化测试脚本，用于验证系统核心流程。 |
| **`BlockchainNode/`** | **区块链节点模块**。存放当前运行的长安链节点的配置 (`config`)、数据 (`data`) 和日志 (`log`)。 |
| **`Scripts/`** | **部署与启动工具**。包含 Docker 编排文件 (`docker-compose-chainmaker.yml`) 和安装脚本。 |
| **`Docs/`** | **项目文档库**。存放详细的部署指南、接口文档和原始规划。 |
| **`Archive/`** | **归档目录**。存放原始安装包 (`didchain`) 等不常用但需保留的冗余文件。 |
| **`README.md`** | 项目主入口说明文档（本文件）。 |

---

## 3. 核心功能实现逻辑
1. **合约层**：在 `SmartContract/` 中定义了 DID 的属性及增删改查逻辑。
2. **后端层**：在 `Backend/` 中封装了对合约的调用。
   - 注册身份：`POST /api/identity/register`
   - 查询身份：`GET /api/identity/:did`
   - 验证有效性：`GET /api/identity/:did/verify`
3. **基础设施层**：通过 `Scripts/` 中的 Docker 配置一键拉起区块链环境。

---

## 4. 快速启动指南

### 第一步：启动区块链节点
```powershell
cd Scripts
docker-compose -f docker-compose-chainmaker.yml -p blockchain up -d
```

### 第二步：启动后端 API
```powershell
cd Backend
npm install
node app.js
```

### 第三步：运行核心功能测试
```powershell
cd Backend
node test-demo.js
```

---

## 5. 冗余清理记录
- **归档**：将原始庞大的 `didchain` 目录移入 `Archive/`，保持根目录整洁。
- **分类**：将散落在根目录的 5 份文档移入 `Docs/`，将 6 份脚本移入 `Scripts/`。
- **去重**：统一了 `BlockchainNode/` 作为唯一节点数据源，修复了路径引用。
