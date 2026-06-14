# WSL 部署长安链详细指南

## 前置条件

- ✅ 已安装 WSL（Ubuntu）
- ✅ 已安装 Docker Desktop（Windows）

---

## 第一步：启动 WSL

在 Windows PowerShell 中执行：

```powershell
wsl
```

进入 Ubuntu 命令行界面。

---

## 第二步：更新系统并安装依赖

在 WSL 中执行：

```bash
# 更新包列表
sudo apt update

# 安装必要依赖
sudo apt install -y git wget curl unzip make gcc tmux 7zip
```

---

## 第三步：安装 Go 语言

长安链需要 Go 1.19+ 版本。

```bash
# 下载 Go 1.21
wget https://go.dev/dl/go1.21.0.linux-amd64.tar.gz

# 解压到 /usr/local
sudo tar -C /usr/local -xzf go1.21.0.linux-amd64.tar.gz

# 配置环境变量
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
echo 'export GOPATH=$HOME/go' >> ~/.bashrc
echo 'export PATH=$PATH:$GOPATH/bin' >> ~/.bashrc

# 使配置生效
source ~/.bashrc

# 验证安装
go version
```

预期输出：`go version go1.21.0 linux/amd64`

---

## 第四步：配置 Docker（WSL 中使用 Windows Docker）

WSL 可以直接使用 Windows 的 Docker Desktop。

```bash
# 验证 Docker 是否可用
docker --version
docker ps
```

如果提示权限问题，执行：

```bash
# 将当前用户加入 docker 组
sudo usermod -aG docker $USER

# 重新登录 WSL 使生效
exit
wsl
```

---

## 第五步：下载长安链源码

### 方式 A：从 Gitee 克隆（国内更快，推荐）

```bash
# 创建工作目录
mkdir -p ~/chainmaker && cd ~/chainmaker

# 克隆长安链源码
git clone -b v2.3.8 --depth=1 https://gitee.com/chinamobile/ChainMaker.git chainmaker-go

# 进入源码目录
cd chainmaker-go
```

### 方式 B：从官方 Git 克隆

```bash
# 需要先注册账号：https://git.chainmaker.org.cn/users/sign_up
git clone -b v2.3.8 --depth=1 https://git.chainmaker.org.cn/chainmaker/chainmaker-go.git
```

---

## 第六步：下载证书生成工具

```bash
# 回到工作目录
cd ~/chainmaker

# 克隆证书生成工具
git clone -b v2.3.8 --depth=1 https://gitee.com/chinamobile/chainmaker-cryptogen.git

# 编译证书生成工具
cd chainmaker-cryptogen
make

# 创建软链接到 chainmaker-go/tools 目录
cd ~/chainmaker/chainmaker-go/tools
ln -s ../../chainmaker-cryptogen/ .
```

---

## 第七步：生成配置文件和证书

```bash
# 进入脚本目录
cd ~/chainmaker/chainmaker-go/scripts

# 执行配置生成脚本（生成 4 节点集群）
./prepare.sh 4 1
```

**执行过程中会提示输入：**

```
input consensus type (0-SOLO,1-TBFT(default),3-MAXBFT,4-RAFT):
# 输入 1 或直接回车（使用默认 TBFT 共识）

input log level (DEBUG|INFO(default)|WARN|ERROR):
# 直接回车（使用默认 INFO）

enable docker vm (YES|NO(default)):
# 输入 YES（启用 Docker 虚拟机）

vm go transport protocol (uds|tcp(default)):
# 直接回车（使用默认 tcp）

input vm go log level (DEBUG|INFO(default)|WARN|ERROR):
# 直接回车（使用默认 INFO）
```

---

## 第八步：编译长安链

```bash
# 在 chainmaker-go/scripts 目录下执行
./build_release.sh
```

编译完成后，安装包位于 `chainmaker-go/build/release/` 目录。

---

## 第九步：启动长安链节点

```bash
# 在 chainmaker-go/scripts 目录下执行
./cluster_quick_start.sh normal
```

---

## 第十步：验证节点启动

### 检查进程

```bash
ps -ef | grep chainmaker | grep -v grep
```

应该看到 4 个 chainmaker 进程。

### 检查端口

```bash
netstat -lptn | grep 1230
```

应该看到：
- 12301
- 12302
- 12303
- 12304

### 检查日志

```bash
# 查看节点日志
cat ~/chainmaker/chainmaker-go/build/release/*/log/system.log | grep "ERROR\|all necessary"

# 如果看到 "all necessary peers connected" 表示节点已就绪
```

---

## 第十一步：停止长安链（可选）

```bash
cd ~/chainmaker/chainmaker-go/scripts
./cluster_quick_stop.sh
```

---

## 常见问题

### Q1: Go 下载很慢

使用国内镜像：

```bash
wget https://golang.google.cn/dl/go1.21.0.linux-amd64.tar.gz
```

### Q2: Git 克隆失败

使用 Gitee 镜像：

```bash
git clone https://gitee.com/chinamobile/ChainMaker.git
```

### Q3: Docker 权限问题

```bash
sudo usermod -aG docker $USER
# 重新登录 WSL
```

### Q4: 端口被占用

修改 `prepare.sh` 脚本参数：

```bash
./prepare.sh 4 1 21301 22301
# 参数：节点数 链数 P2P端口 RPC端口
```

### Q5: 内存不足

建议 WSL 分配至少 4GB 内存。修改 `.wslconfig`：

```powershell
# 在 Windows 用户目录下创建 .wslconfig
# C:\Users\你的用户名\.wslconfig

[wsl2]
memory=8GB
processors=4
```

---

## 下一步

长安链启动成功后，您可以：

1. **编译 CMC 命令行工具**：用于部署和调用合约
2. **安装 Go SDK**：用于开发后端应用
3. **编写智能合约**：参考《大作业实施规划.md》

---

## 快速命令汇总

```bash
# 一键执行所有步骤（复制粘贴即可）

# 更新系统
sudo apt update && sudo apt install -y git wget curl unzip make gcc tmux 7zip

# 安装 Go
wget https://go.dev/dl/go1.21.0.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.21.0.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc

# 下载长安链
mkdir -p ~/chainmaker && cd ~/chainmaker
git clone -b v2.3.8 --depth=1 https://gitee.com/chinamobile/ChainMaker.git chainmaker-go
git clone -b v2.3.8 --depth=1 https://gitee.com/chinamobile/chainmaker-cryptogen.git

# 编译证书工具
cd chainmaker-cryptogen && make
cd ~/chainmaker/chainmaker-go/tools && ln -s ../../chainmaker-cryptogen/ .

# 生成配置
cd ~/chainmaker/chainmaker-go/scripts
./prepare.sh 4 1

# 编译并启动
./build_release.sh
./cluster_quick_start.sh normal
```

---

**文档版本：** v1.0  
**更新日期：** 2026-06-14  
**适用系统：** Windows 10/11 + WSL2 (Ubuntu 20.04/22.04)
