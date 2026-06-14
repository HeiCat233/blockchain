# 区块链分布式数字身份系统 - Docker 环境部署指南

## 📋 部署状态

| 组件 | 状态 | 说明 |
|------|------|------|
| WSL (Windows Subsystem for Linux) | ✅ 已启用 | 系统功能已激活 |
| VirtualMachinePlatform | ✅ 已启用 | 虚拟机平台已激活 |
| Docker Desktop | ⏳ 待安装 | 请按下方步骤完成 |
| Docker Compose | ⏳ 待安装 | 随 Docker Desktop 一起安装 |

---

## 🚀 安装 Docker Desktop

### 方法一：使用自动脚本（推荐）

1. **打开 PowerShell 或 CMD（管理员权限）**
   - 按 `Win + X`，选择 **终端(管理员)** 或 **PowerShell(管理员)**

2. **运行安装脚本**
   ```powershell
   # PowerShell 版本
   cd D:\develop\homework\blockchain
   .\install-docker.ps1
   ```
   或
   ```cmd
   :: CMD / Bat 版本
   cd D:\develop\homework\blockchain
   install-docker.bat
   ```

### 方法二：手动安装

如果自动脚本下载失败，请按以下步骤操作：

1. **下载安装程序**
   - 访问：https://www.docker.com/products/docker-desktop/
   - 点击 **Download for Windows - AMD64**
   - 或直接使用链接：https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe

2. **运行安装程序**
   - 双击下载的 `Docker Desktop Installer.exe`
   - 勾选 **Use WSL 2 instead of Hyper-V**（推荐）
   - 点击 **OK** 开始安装

3. **完成安装向导**
   - 安装完成后，点击 **Close and restart** 重启电脑

---

## ⚙️ 安装后配置

1. **启动 Docker Desktop**
   - 从开始菜单搜索并打开 **Docker Desktop**
   - 接受服务协议
   - 登录 Docker 账号（可选，可跳过）

2. **验证安装**
   打开新的终端，运行以下命令：
   ```bash
   docker --version
   docker compose version
   ```
   如果显示版本号，说明安装成功！

3. **配置国内镜像加速（可选但推荐）**
   - 打开 Docker Desktop
   - 点击右上角 **设置 (⚙️)**
   - 选择 **Docker Engine**
   - 在 JSON 配置中添加：
     ```json
     {
       "registry-mirrors": [
         "https://docker.mirrors.ustc.edu.cn",
         "https://hub-mirror.c.163.com"
       ]
     }
     ```
   - 点击 **Apply & Restart**

---

## 🐳 启动项目环境

本项目已预置 `docker-compose.yml`，包含以下服务：

| 服务 | 端口 | 用途 |
|------|------|------|
| Ganache | 8545 | 本地以太坊测试链 |
| IPFS | 4001/5001/8080 | 分布式文件存储 |
| PostgreSQL | 5432 | 关系型数据库 |
| Redis | 6379 | 缓存与会话 |

### 启动步骤

```bash
# 1. 进入项目目录
cd D:\develop\homework\blockchain

# 2. 创建环境变量文件
copy .env.example .env

# 3. 启动所有服务（后台运行）
docker-compose up -d

# 4. 查看运行状态
docker-compose ps

# 5. 查看日志
docker-compose logs -f

# 6. 停止所有服务
docker-compose down

# 7. 停止并删除数据卷（谨慎使用）
docker-compose down -v
```

---

## 📁 项目文件说明

```
D:\develop\homework\blockchain
├── docker-compose.yml          # Docker Compose 服务定义
├── .env.example                # 环境变量模板
├── install-docker.bat          # Windows 批处理安装脚本
├── install-docker.ps1          # PowerShell 安装脚本
└── README-Docker.md            # 本说明文件
```

---

## ❓ 常见问题

### 1. 安装时提示 "WSL 2 installation is incomplete"

**解决**：下载并安装 WSL2 Linux 内核更新包
- 下载地址：https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi
- 安装后重启电脑

### 2. Docker Desktop 启动失败或卡住

**解决**：
- 确保 BIOS 中启用了虚拟化（Intel VT-x / AMD-V）
- 检查 Windows 更新是否完整
- 尝试在 PowerShell 中运行：`wsl --update`

### 3. 端口冲突

如果提示端口被占用，修改 `docker-compose.yml` 中的端口映射，例如：
```yaml
ports:
  - "8546:8545"  # 将主机的 8546 映射到容器的 8545
```

### 4. 权限问题

确保当前用户属于 `docker-users` 组，或始终以管理员身份运行终端。

---

## 📚 相关资源

- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 官方文档](https://docs.docker.com/compose/)
- [Ganache 文档](https://trufflesuite.com/docs/ganache/)
- [IPFS 文档](https://docs.ipfs.tech/)

---

**祝你的区块链分布式数字身份系统大作业顺利！** 🎓⛓️
