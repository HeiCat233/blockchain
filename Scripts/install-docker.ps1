# Docker Desktop 安装脚本 (PowerShell 版本)
# 用于区块链分布式数字身份系统环境部署
# 请以管理员身份运行: 右键 -> 使用 PowerShell 运行

#Requires -RunAsAdministrator

$ErrorActionPreference = "Stop"
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Docker Desktop 自动安装脚本" -ForegroundColor Cyan
Write-Host "  用于区块链分布式数字身份系统环境部署" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 1. 设置 WSL 默认版本为 2
Write-Host "[1/4] 设置 WSL 默认版本为 2..." -ForegroundColor Yellow
wsl --set-default-version 2 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "      WSL 内核更新包可能尚未安装，继续..." -ForegroundColor DarkYellow
}

# 2. 检查是否已安装 Docker Desktop
Write-Host "[2/4] 检查 Docker Desktop 是否已安装..." -ForegroundColor Yellow
$dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
if (Test-Path $dockerPath) {
    Write-Host "      Docker Desktop 已安装，跳过下载。" -ForegroundColor Green
    $installerPath = $null
} else {
    # 3. 下载 Docker Desktop
    Write-Host "[3/4] 正在下载 Docker Desktop 安装程序..." -ForegroundColor Yellow
    $url = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
    $installerPath = Join-Path $env:TEMP "DockerDesktopInstaller.exe"

    Write-Host "      下载地址: $url" -ForegroundColor DarkGray
    Write-Host "      这可能需要几分钟，请耐心等待..." -ForegroundColor DarkGray

    try {
        $ProgressPreference = 'SilentlyContinue'
        Invoke-WebRequest -Uri $url -OutFile $installerPath -UseBasicParsing
        Write-Host "      下载完成！" -ForegroundColor Green
    } catch {
        Write-Host "[错误] 下载失败: $_" -ForegroundColor Red
        Write-Host "       请手动下载安装程序:" -ForegroundColor Red
        Write-Host "       $url" -ForegroundColor Red
        Read-Host "按 Enter 键退出"
        exit 1
    }
}

# 4. 安装 Docker Desktop
Write-Host "[4/4] 正在安装 Docker Desktop..." -ForegroundColor Yellow
if ($installerPath -and (Test-Path $installerPath)) {
    & $installerPath install --quiet --accept-license
} elseif (Test-Path $dockerPath) {
    Write-Host "      Docker Desktop 已存在，无需重新安装。" -ForegroundColor Green
} else {
    Write-Host "[错误] 找不到安装程序。" -ForegroundColor Red
    Read-Host "按 Enter 键退出"
    exit 1
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  安装完成！" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "请按照以下步骤完成配置：" -ForegroundColor White
Write-Host "  1. 重启电脑（如果提示需要）" -ForegroundColor White
Write-Host "  2. 从开始菜单启动 'Docker Desktop'" -ForegroundColor White
Write-Host "  3. 接受许可协议并完成初始化" -ForegroundColor White
Write-Host "  4. 打开新的终端，运行: docker --version" -ForegroundColor White
Write-Host "  5. 运行: docker compose version" -ForegroundColor White
Write-Host ""
Read-Host "按 Enter 键退出"
