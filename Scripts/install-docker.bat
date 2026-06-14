@echo off
chcp 65001 >nul
echo ==========================================
echo  Docker Desktop 自动安装脚本
echo  用于区块链分布式数字身份系统环境部署
echo ==========================================
echo.

:: 检查管理员权限
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] 请以管理员身份运行此脚本！
    echo 右键点击脚本，选择"以管理员身份运行"。
    pause
    exit /b 1
)

:: 设置 WSL 默认版本为 2
echo [1/4] 设置 WSL 默认版本为 2...
wsl --set-default-version 2 >nul 2>&1
if %errorLevel% neq 0 (
    echo       WSL 内核更新包可能尚未安装，继续...
)

:: 检查是否已安装 Docker Desktop
echo [2/4] 检查 Docker Desktop 是否已安装...
if exist "C:\Program Files\Docker\Docker\Docker Desktop.exe" (
    echo       Docker Desktop 已安装，跳过下载。
    goto INSTALL
)

:: 下载 Docker Desktop
echo [3/4] 正在下载 Docker Desktop 安装程序...
echo       下载地址: https://desktop.docker.com/win/main/amd64/Docker%%20Desktop%%20Installer.exe
echo       这可能需要几分钟，请耐心等待...
powershell -Command "& {$ProgressPreference='SilentlyContinue'; Invoke-WebRequest -Uri 'https://desktop.docker.com/win/main/amd64/Docker%%20Desktop%%20Installer.exe' -OutFile '%TEMP%\DockerDesktopInstaller.exe'}"

if not exist "%TEMP%\DockerDesktopInstaller.exe" (
    echo [错误] 下载失败，请手动下载安装程序。
    echo       下载地址: https://desktop.docker.com/win/main/amd64/Docker%%20Desktop%%20Installer.exe
    pause
    exit /b 1
)

echo       下载完成！

:INSTALL
echo [4/4] 正在安装 Docker Desktop...
if exist "%TEMP%\DockerDesktopInstaller.exe" (
    "%TEMP%\DockerDesktopInstaller.exe" install --quiet --accept-license
) else (
    "C:\Program Files\Docker\Docker\Docker Desktop.exe" --quiet
)

if %errorLevel% neq 0 (
    echo [错误] 安装过程中出现问题。
    pause
    exit /b 1
)

echo.
echo ==========================================
echo  安装完成！
echo ==========================================
echo.
echo 请按照以下步骤完成配置：
echo   1. 重启电脑（如果提示需要）
echo   2. 从开始菜单启动 "Docker Desktop"
echo   3. 接受许可协议并完成初始化
echo   4. 打开新的终端，运行: docker --version
echo   5. 运行: docker compose version
echo.
pause
