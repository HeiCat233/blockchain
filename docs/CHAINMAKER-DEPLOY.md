# 长安链 Docker 部署指南

## 一、部署概述

本文档提供在 Windows 系统上使用 Docker 快速部署长安链的完整步骤。

### 系统要求

| 组件 | 最低要求 | 推荐配置 |
|------|---------|----------|
| 操作系统 | Windows 10/11 | Windows 11 |
| 内存 | 8GB | 16GB |
| 磁盘空间 | 20GB | 50GB |
| Docker Desktop | 最新版 | 最新版 |

---

## 二、快速启动（推荐）

### 步骤 1：确保 Docker 运行

打开 PowerShell，检查 Docker 状态：

```powershell
docker --version
docker ps
```

### 步骤 2：运行启动脚本

```powershell
# 进入项目目录
cd D:\develop\homework\blockchain

# 运行启动脚本
.\start-chainmaker.ps1
```

脚本会自动完成：
- ✓ 检查 Docker 状态
- ✓ 创建配置目录
- ✓ 拉取 Docker 镜像
- ✓ 启动长安链服务
- ✓ 验证服务状态

### 步骤 3：验证部署

```powershell
# 查看运行中的容器
docker ps

# 测试 Redis 连接
docker exec chainmaker-redis redis-cli -a chainmaker123 ping
```

---

## 三、手动部署步骤

### 3.1 创建目录结构

```powershell
# 创建长安链配置目录
New-Item -ItemType Directory -Path chainmaker/config/node1 -Force
New-Item -ItemType Directory -Path chainmaker/config/node2 -Force
New-Item -ItemType Directory -Path chainmaker/data/node1 -Force
New-Item -ItemType Directory -Path chainmaker/data/node2 -Force
New-Item -ItemType Directory -Path chainmaker/log/node1 -Force
New-Item -ItemType Directory -Path chainmaker/log/node2 -Force
New-Item -ItemType Directory -Path chainmaker/keys -Force
New-Item -ItemType Directory -Path chainmaker/contracts -Force
```

### 3.2 拉取 Docker 镜像

```powershell
# 拉取长安链核心镜像
docker pull chainmakerofficial/chainmaker:v2.3.3

# 拉取合约执行引擎
docker pull chainmakerofficial/chainmaker-vm-engine:v2.3.3

# 拉取 Redis
docker pull redis:7-alpine
```

### 3.3 启动服务

```powershell
# 启动所有服务
docker-compose -f docker-compose-chainmaker.yml up -d

# 查看服务状态
docker-compose -f docker-compose-chainmaker.yml ps
```

### 3.4 查看日志

```powershell
# 查看所有服务日志
docker-compose -f docker-compose-chainmaker.yml logs -f

# 查看特定服务日志
docker logs chainmaker-node1 -f
```

---

## 四、服务配置说明

### 4.1 端口映射

| 服务 | 容器端口 | 主机端口 | 说明 |
|------|---------|---------|------|
| chainmaker-node1 | 11301 | 11301 | P2P通信端口 |
| chainmaker-node1 | 12301 | 12301 | RPC API端口 |
| chainmaker-node2 | 11301 | 11302 | P2P通信端口 |
| chainmaker-node2 | 12301 | 12302 | RPC API端口 |
| redis | 6379 | 6379 | Redis服务 |
| chainmaker-browser | 8080 | 8080 | 区块链浏览器 |

### 4.2 数据持久化

数据存储在以下目录：

```
chainmaker/
├── config/          # 节点配置文件
├── data/            # 区块链数据
├── log/             # 日志文件
├── keys/            # 证书和密钥
└── contracts/       # 智能合约
```

### 4.3 环境变量

在 `docker-compose-chainmaker.yml` 中可配置：

```yaml
environment:
  - CHAIN_ID=chain1          # 链ID
  - NODE_ID=node1            # 节点ID
  - LOG_LEVEL=INFO           # 日志级别
```

---

## 五、常用操作命令

### 5.1 服务管理

```powershell
# 启动服务
docker-compose -f docker-compose-chainmaker.yml up -d

# 停止服务
docker-compose -f docker-compose-chainmaker.yml down

# 重启服务
docker-compose -f docker-compose-chainmaker.yml restart

# 停止并删除所有数据
docker-compose -f docker-compose-chainmaker.yml down -v
```

### 5.2 日志查看

```powershell
# 实时查看日志
docker-compose -f docker-compose-chainmaker.yml logs -f

# 查看最近100行日志
docker logs chainmaker-node1 --tail 100

# 查看错误日志
docker logs chainmaker-node1 2>&1 | Select-String "ERROR"
```

### 5.3 进入容器

```powershell
# 进入长安链节点容器
docker exec -it chainmaker-node1 bash

# 进入 Redis 容器
docker exec -it chainmaker-redis sh
```

### 5.4 数据备份

```powershell
# 备份区块链数据
Copy-Item -Path chainmaker/data -Destination chainmaker/backup/data-$(Get-Date -Format 'yyyyMMdd') -Recurse

# 备份配置文件
Copy-Item -Path chainmaker/config -Destination chainmaker/backup/config-$(Get-Date -Format 'yyyyMMdd') -Recurse
```

---

## 六、测试验证

### 6.1 测试 Redis 连接

```powershell
docker exec chainmaker-redis redis-cli -a chainmaker123 ping
```

预期输出：`PONG`

### 6.2 测试长安链 RPC

```powershell
# 使用 curl 测试（需要安装 curl）
curl -X POST http://localhost:12301 -H "Content-Type: application/json" -d '{"method":"getChainConfig"}'
```

### 6.3 查看区块高度

```powershell
# 进入容器后执行
docker exec -it chainmaker-node1 chainmaker height
```

---

## 七、故障排查

### 问题 1：镜像拉取失败

**原因：** 国内访问 Docker Hub 较慢

**解决方案：**

```powershell
# 配置 Docker 镜像加速
# 打开 Docker Desktop -> Settings -> Docker Engine
# 添加以下配置：
{
  "registry-mirrors": [
    "https://hub-dev.cnbn.org.cn",
    "https://mirror.ccs.tencentyun.com"
  ]
}
```

### 问题 2：端口被占用

**检查端口占用：**

```powershell
netstat -ano | findstr "12301"
netstat -ano | findstr "6379"
```

**解决方案：**

修改 `docker-compose-chainmaker.yml` 中的端口映射。

### 问题 3：容器无法启动

**查看详细日志：**

```powershell
docker logs chainmaker-node1
docker inspect chainmaker-node1
```

### 问题 4：Redis 连接失败

**检查 Redis 状态：**

```powershell
docker ps | findstr redis
docker logs chainmaker-redis
```

**重启 Redis：**

```powershell
docker restart chainmaker-redis
```

---

## 八、下一步操作

部署完成后，您可以：

1. **安装 Node.js** - 开发后端服务
2. **安装 Go** - 开发智能合约
3. **编写智能合约** - 参考《大作业实施规划.md》第六章
4. **开发后端 API** - 参考《大作业实施规划.md》第七章

---

## 九、参考资源

- [长安链官方文档](https://docs.chainmaker.org.cn/)
- [长安链 GitHub](https://github.com/chinamobile/ChainMaker)
- [长安链在线 IDE](https://ide.chainmaker.org.cn/)
- [长安链技术社区](https://bbs.chainmaker.org.cn/)

---

**文档版本：** v1.0  
**更新日期：** 2026-06-13  
**适用系统：** Windows 10/11 + Docker Desktop
