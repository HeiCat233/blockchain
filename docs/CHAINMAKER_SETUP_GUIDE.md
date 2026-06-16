# 长安链部署与使用指南

## 📋 目录
- [项目现状](#项目现状)
- [快速启动](#快速启动)
- [双模式说明](#双模式说明)
- [部署长安链](#部署长安链)
- [常见问题](#常见问题)

---

## 项目现状

✅ **当前已支持双模式**
- **DEMO_MODE（默认）**：文件存储，无需长安链
- **CHAIN_MODE**：真实长安链（预留接口）

---

## 快速启动

### 1. 演示模式（推荐，无需长安链）

```bash
cd backend
npm install
node app.js
```

**输出示例**：
```
[System] 运行模式: DEMO_MODE
[Storage] 数据文件不存在，将创建新文件
[System] 演示模式已启动
=== 分布式DID系统启动成功 ===
服务地址: http://localhost:3000
健康检查: http://localhost:3000/health
```

---

### 2. 长安链模式（需要长安链节点）

#### 2.1 环境准备
确保已安装：
- Docker
- Docker Compose

#### 2.2 启动长安链节点

```bash
cd Scripts/

# Windows (PowerShell)
.\start-chainmaker.ps1

# 或者直接使用 Docker Compose
docker-compose -f docker-compose-chainmaker.yml up -d
```

#### 2.3 配置并启动后端

```bash
cd backend/

# 1. 复制环境变量示例
cp .env.example .env

# 2. 编辑 .env，设置
RUN_MODE=CHAIN_MODE

# 3. 安装依赖
npm install

# 4. 启动后端
node app.js
```

---

## 双模式说明

| 对比项 | 演示模式 (DEMO_MODE) | 长安链模式 (CHAIN_MODE) |
|-------|---------------------|------------------------|
| **需要长安链吗** | ❌ 不需要 | ✅ 需要 |
| **数据存储** | JSON 文件 | 链上账本 |
| **启动速度** | 🚀 秒启动 | 🐢 需要等待节点 |
| **数据不可篡改** | ❌ 可手动编辑 | ✅ 真正不可篡改 |
| **适用场景** | 开发测试、学习 | 生产环境 |
| **当前状态** | ✅ 完整可用 | ⚠️ 预留接口 |

### 如何切换模式

#### 方法 1：环境变量（推荐）

```bash
# Windows (PowerShell)
$env:RUN_MODE="DEMO_MODE"
node app.js

$env:RUN_MODE="CHAIN_MODE"
node app.js

# Windows (CMD)
set RUN_MODE=DEMO_MODE
node app.js

# Linux/Mac
RUN_MODE=DEMO_MODE node app.js
```

#### 方法 2：.env 文件

```bash
cd backend/
cp .env.example .env
# 编辑 .env 文件中的 RUN_MODE
```

---

## 部署长安链

### 完整步骤（Windows）

#### 1. 检查 Docker

```powershell
# 检查 Docker 是否安装
docker --version
docker-compose --version

# 如果未安装，运行提供的脚本
cd Scripts/
.\install-docker.ps1
```

#### 2. 启动长安链

```powershell
cd Scripts/

# 方法 A：使用提供的脚本
.\start-chainmaker.ps1

# 方法 B：直接使用 docker-compose
docker-compose -f docker-compose-chainmaker.yml up -d
```

#### 3. 检查节点状态

```bash
# 查看容器状态
docker ps

# 查看节点日志
docker logs -f chainmaker-node1
```

#### 4. 停止长安链

```bash
cd Scripts/
docker-compose -f docker-compose-chainmaker.yml down
```

---

## 长安链节点信息

| 项目 | 值 |
|-----|---|
| **节点 RPC 地址** | `localhost:12301` |
| **节点 P2P 地址** | `localhost:11301` |
| **链 ID** | `chain1` |
| **组织 ID** | `TestCMorg1` |
| **合约名称** | `did-contract` |

---

## 验证部署

### 1. 测试后端服务

```bash
# 健康检查
curl http://localhost:3000/health

# 预期输出
# {"status":"ok","message":"DID 系统服务正常"}
```

### 2. 测试身份管理

```bash
# 注册身份
curl -X POST http://localhost:3000/api/identity/register \
  -H "Content-Type: application/json" \
  -d '{
    "controller": "did:chainmaker:admin123",
    "did": "did:chainmaker:user001",
    "publicKey": "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE..."
  }'

# 查询身份
curl http://localhost:3000/api/identity/did:chainmaker:user001

# 验证身份
curl http://localhost:3000/api/identity/did:chainmaker:user001/verify
```

---

## 常见问题

### Q: 演示模式数据存在哪里？
A: `data/did-storage.json`

### Q: 如何清空演示模式数据？
A: 删除 `data/did-storage.json` 文件即可

### Q: 长安链模式什么时候完全实现？
A: 预留接口已准备好，只需要：
1. 安装长安链 SDK
2. 配置用户证书
3. 部署智能合约

### Q: Docker 无法启动怎么办？
A: 
1. 检查 Docker Desktop 是否运行
2. 检查端口占用：`netstat -ano | findstr ":12301"`
3. 查看日志：`docker logs chainmaker-node1`

### Q: 可以同时运行演示模式和长安链模式吗？
A: 可以，但需要修改端口避免冲突

---

## 文件结构说明

```
blockchain/
├── backend/
│   ├── app.js                 # 后端入口
│   ├── chainmaker-client.js   # 双模式客户端
│   ├── .env.example          # 环境变量示例
│   └── package.json
├── BlockchainNode/           # 长安链节点配置
│   └── config/
├── Scripts/                  # 部署脚本
│   ├── docker-compose-chainmaker.yml
│   └── start-chainmaker.ps1
├── SmartContract/            # 智能合约
└── docs/                     # 文档
```

---

## 下一步

- ✅ 当前：双模式已实现，演示模式可用
- 📝 计划：完善长安链 SDK 集成
- 🚀 目标：完整的链上 DID 系统

---

## 参考链接

- [长安链官方文档](https://docs.chainmaker.org.cn/)
- [项目完整指南](../project_guide.md)
