# ============================================================
# 长安链快速启动脚本 (Windows PowerShell)
# 使用方法：在 PowerShell 中运行 .\start-chainmaker.ps1
# ============================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "长安链 Docker 部署脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Docker 是否运行
Write-Host "[1/6] 检查 Docker 状态..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✓ Docker 正在运行" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker 未运行，请先启动 Docker Desktop" -ForegroundColor Red
    exit 1
}

# 创建必要的目录
Write-Host "[2/6] 创建配置目录..." -ForegroundColor Yellow
$directories = @(
    "chainmaker/config/node1",
    "chainmaker/config/node2",
    "chainmaker/data/node1",
    "chainmaker/data/node2",
    "chainmaker/log/node1",
    "chainmaker/log/node2",
    "chainmaker/keys",
    "chainmaker/contracts"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  创建目录: $dir" -ForegroundColor Gray
    }
}
Write-Host "✓ 目录创建完成" -ForegroundColor Green

# 拉取 Docker 镜像
Write-Host "[3/6] 拉取长安链 Docker 镜像..." -ForegroundColor Yellow
Write-Host "  这可能需要几分钟，请耐心等待..." -ForegroundColor Gray

docker pull chainmakerofficial/chainmaker:v2.3.3
docker pull chainmakerofficial/chainmaker-vm-engine:v2.3.3
docker pull redis:7-alpine

Write-Host "✓ 镜像拉取完成" -ForegroundColor Green

# 启动服务
Write-Host "[4/6] 启动长安链服务..." -ForegroundColor Yellow
docker-compose -f docker-compose-chainmaker.yml up -d

Start-Sleep -Seconds 5

Write-Host "✓ 服务启动完成" -ForegroundColor Green

# 检查服务状态
Write-Host "[5/6] 检查服务状态..." -ForegroundColor Yellow
$containers = docker ps --format "table {{.Names}}`t{{.Status}}`t{{.Ports}}"
Write-Host $containers

Write-Host ""
Write-Host "[6/6] 验证连接..." -ForegroundColor Yellow
Write-Host "  Redis: " -NoNewline
try {
    docker exec chainmaker-redis redis-cli -a chainmaker123 ping 2>$null
    Write-Host "✓ Redis 连接正常" -ForegroundColor Green
} catch {
    Write-Host "✗ Redis 连接失败" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "部署完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "服务地址：" -ForegroundColor Yellow
Write-Host "  长安链 RPC: http://localhost:12301" -ForegroundColor White
Write-Host "  Redis: localhost:6379 (密码: chainmaker123)" -ForegroundColor White
Write-Host "  浏览器: http://localhost:8080" -ForegroundColor White
Write-Host ""
Write-Host "常用命令：" -ForegroundColor Yellow
Write-Host "  查看日志: docker-compose -f docker-compose-chainmaker.yml logs -f" -ForegroundColor White
Write-Host "  停止服务: docker-compose -f docker-compose-chainmaker.yml down" -ForegroundColor White
Write-Host "  重启服务: docker-compose -f docker-compose-chainmaker.yml restart" -ForegroundColor White
Write-Host ""
