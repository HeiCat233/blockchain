# Docker Compose 使用指南

## 📋 前置条件检查

✅ Docker 已安装：Docker version 29.5.3  
✅ Docker Compose 已安装：Docker Compose version v5.1.4

---

## 📦 项目中有两个 Docker Compose 配置文件

| 文件 | 说明 |
|------|------|
| `docker-compose.yml` | 通用区块链配置模板（示例：Ganache、IPFS、PostgreSQL、Redis）|
| `docker-compose-chainmaker.yml` | 长安链配置（推荐用于本项目） |

---

## 🚀 快速开始：启动长安链

### 1️⃣ 进入 Scripts 目录

```powershell
cd Scripts
```

### 2️⃣ 启动长安链服务

```powershell
docker-compose -f docker-compose-chainmaker.yml up -d
```

### 3️⃣ 查看服务状态

```powershell
docker-compose -f docker-compose-chainmaker.yml ps
```

### 4️⃣ 查看服务日志

```powershell
# 查看所有服务日志
docker-compose -f docker-compose-chainmaker.yml logs -f

# 查看特定服务日志
docker-compose -f docker-compose-chainmaker.yml logs -f chainmaker-node1
```

---

## ⚙️ 长安链服务说明

### 服务列表

| 服务名称 | 端口映射 | 说明 |
|---------|---------|------|
| `chainmaker-node1` | `11301:11301` (P2P) | 长安链节点 1 |
| | `12301:12301` (RPC) | |
| `chainmaker-vm` | 无 | WASM 合约执行引擎 |
| `redis` | `6379:6379` | 缓存服务 |

### 访问地址

- **长安链 RPC 地址**：`http://localhost:12301`
- **Redis 连接地址**：`redis://localhost:6379`（密码：`chainmaker123`）

---

## 🛠️ 常用 Docker Compose 命令

### 启动服务
```powershell
# 后台启动
docker-compose -f [配置文件.yml] up -d

# 前台启动（用于调试）
docker-compose -f [配置文件.yml] up
```

### 停止服务
```powershell
# 停止服务（保留数据）
docker-compose -f [配置文件.yml] down

# 停止并删除数据卷
docker-compose -f [配置文件.yml] down -v
```

### 查看状态
```powershell
# 查看服务状态
docker-compose -f [配置文件.yml] ps

# 查看服务日志
docker-compose -f [配置文件.yml] logs
docker-compose -f [配置文件.yml] logs -f  # 实时日志
```

### 重启服务
```powershell
# 重启所有服务
docker-compose -f [配置文件.yml] restart

# 重启单个服务
docker-compose -f [配置文件.yml] restart [服务名]
```

---

## 📊 使用完整示例（docker-compose.yml）

如果您想尝试其他区块链组件，可以使用通用配置文件：

### 启动所有服务
```powershell
docker-compose -f docker-compose.yml up -d
```

### 包含的服务

| 服务 | 说明 | 端口 |
|------|------|------|
| `ganache` | 以太坊本地测试链 | 8545 |
| `ipfs` | IPFS 分布式存储 | 5001 |
| `postgres` | PostgreSQL 数据库 | 5432 |
| `redis` | Redis 缓存 | 6379 |

---

## ⚠️ 重要提示

### 1️⃣ 长安链镜像大小
长安链镜像较大（约 1-2GB），首次下载需要时间，请耐心等待。

### 2️⃣ 首次启动
首次启动时，长安链需要初始化配置，可能需要几分钟时间。

### 3️⃣ 端口占用
如果端口被占用，请修改 `docker-compose-chainmaker.yml` 中的端口映射。

### 4️⃣ 数据持久化
所有数据会持久化到 Docker Volume 中，即使停止容器数据也不会丢失。

---

## 📝 Windows 下的注意事项

### 使用 PowerShell
本项目推荐使用 PowerShell 而不是 CMD。

### 路径问题
在 Windows 下，Docker 会自动处理路径映射，无需担心斜杠问题。

### 防火墙提示
首次启动时，Windows 防火墙可能会提示允许网络访问，请选择"允许"。

---

## 🔍 故障排查

### 问题：容器无法启动
```powershell
# 查看详细日志
docker-compose -f docker-compose-chainmaker.yml logs

# 查看特定容器日志
docker logs chainmaker-node1
```

### 问题：端口被占用
```powershell
# 查看端口占用情况
netstat -ano | findstr :12301

# 结束占用端口的进程
taskkill /PID <进程ID> /F
```

### 问题：镜像下载失败
```powershell
# 清理未使用的镜像
docker system prune -a

# 重新拉取镜像
docker pull chainmakerofficial/chainmaker:v2.3.3
```

---

## 🎯 推荐工作流程

```powershell
# 1️⃣ 进入 Scripts 目录
cd Scripts

# 2️⃣ 启动长安链（后台运行）
docker-compose -f docker-compose-chainmaker.yml up -d

# 3️⃣ 等待服务启动完成（约1-2分钟）
docker-compose -f docker-compose-chainmaker.yml ps

# 4️⃣ 查看日志确认正常
docker-compose -f docker-compose-chainmaker.yml logs -f

# 5️⃣ 您的后端服务现在可以连接长安链了！

# 6️⃣ 完成后停止服务
docker-compose -f docker-compose-chainmaker.yml down
```

---

## 📚 更多参考

- [长安链官方文档](https://docs.chainmaker.org.cn/)
- [项目长安链部署指南](./CHAINMAKER_SETUP_GUIDE.md)
- [Docker 官方文档](https://docs.docker.com/)
