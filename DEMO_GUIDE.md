# 分布式数字身份系统 - 演示操作指南

> 每次打开项目后，请按此文档进行演示操作

---

## 📋 目录
1. [项目启动前检查](#1-项目启动前检查)
2. [启动系统](#2-启动系统)
3. [演示功能流程](#3-演示功能流程)
4. [完整演示脚本](#4-完整演示脚本)

---

## 1. 项目启动前检查

### 1.1 检查 Docker 状态
```powershell
# 打开 PowerShell，检查 Docker 是否运行
docker ps
```
**预期结果**：可以看到 `chainmaker-node1`, `chainmaker-vm`, `chainmaker-redis` 正在运行

### 1.2 如果 Docker 没运行
```powershell
# 1. 启动 Docker Desktop
# 2. 检查长安链状态
cd D:\develop\homework\blockchain\Scripts
docker-compose -f docker-compose-chainmaker.yml up -d

# 3. 等待约 30 秒
docker ps
```

---

## 2. 启动系统

### 2.1 启动后端服务

```powershell
# 打开新的 PowerShell 终端
cd D:\develop\homework\blockchain\backend

# 启动后端（如果之前没运行）
node app.js
```

**预期输出**：
```
[System] Running mode: DEMO_MODE
[Storage] Loaded X records from file
[System] Demo mode started
=== Decentralized DID System Started ===
Service URL: http://localhost:3000
Health Check: http://localhost:3000/health
```

### 2.2 验证服务状态
打开浏览器访问：
- **健康检查**：http://localhost:3000/health
- **预期返回**：`{"status":"ok","message":"DID System Service Running"}`

---

## 3. 演示功能流程

### 🎬 完整演示流程（推荐）

---

### 第 1 步：健康检查
```powershell
Invoke-WebRequest -Uri http://localhost:3000/health -UseBasicParsing | Select-Object -ExpandProperty Content
```

**预期输出**：
```json
{"status":"ok","message":"DID System Service Running"}
```

---

### 第 2 步：注册身份
```powershell
$body = @{
    controller = "did:chainmaker:admin123"
    did = "did:chainmaker:alice001"
    publicKey = "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE8nQ..."
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/identity/register" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing | Select-Object -ExpandProperty Content
```

**预期输出**：
```json
{"success":true,"did":"did:chainmaker:alice001"}
```

---

### 第 3 步：查询身份
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/identity/did:chainmaker:alice001" -UseBasicParsing | Select-Object -ExpandProperty Content
```

**预期输出**：
```json
{"success":true,"data":{"id":"did:chainmaker:alice001","controller":"did:chainmaker:admin123","publicKey":"MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE8nQ...","status":"active","created":"2026-06-16T...","updated":"2026-06-16T..."}}
```

---

### 第 4 步：验证身份有效性
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/identity/did:chainmaker:alice001/verify" -UseBasicParsing | Select-Object -ExpandProperty Content
```

**预期输出**：
```json
{"success":true,"valid":true}
```

---

### 第 5 步：更新身份公钥
```powershell
$body = @{
    controller = "did:chainmaker:admin123"
    publicKey = "new_public_key_2024_updated_abc123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/identity/did:chainmaker:alice001" -Method PUT -Body $body -ContentType "application/json" -UseBasicParsing | Select-Object -ExpandProperty Content
```

**预期输出**：
```json
{"success":true}
```

---

### 第 6 步：查询更新后的身份
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/identity/did:chainmaker:alice001" -UseBasicParsing | Select-Object -ExpandProperty Content
```

**验证**：检查 `publicKey` 是否已更新为新值

---

### 第 7 步：吊销身份
```powershell
$body = @{
    controller = "did:chainmaker:admin123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/identity/did:chainmaker:alice001" -Method DELETE -Body $body -ContentType "application/json" -UseBasicParsing | Select-Object -ExpandProperty Content
```

**预期输出**：
```json
{"success":true}
```

---

### 第 8 步：验证已吊销的身份
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/identity/did:chainmaker:alice001/verify" -UseBasicParsing | Select-Object -ExpandProperty Content
```

**预期输出**：
```json
{"success":true,"valid":false}
```

---

### 第 9 步（可选）：再注册一个新身份进行对比
```powershell
$body = @{
    controller = "did:chainmaker:admin123"
    did = "did:chainmaker:bob002"
    publicKey = "bob_public_key_xyz789"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/identity/register" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing | Select-Object -ExpandProperty Content
```

---

## 4. 完整演示脚本

### 快速一键测试脚本
```powershell
# ==============================================
# DID 系统完整演示脚本
# ==============================================

Write-Host "`n=== 分布式数字身份系统演示 ===`n" -ForegroundColor Green

# ----------------------
# 1. 健康检查
# ----------------------
Write-Host "[1/8] 健康检查..." -ForegroundColor Cyan
$health = Invoke-WebRequest -Uri http://localhost:3000/health -UseBasicParsing | Select-Object -ExpandProperty Content
Write-Host "✅ 健康状态: $health`n"

# ----------------------
# 2. 注册身份
# ----------------------
Write-Host "[2/8] 注册身份: alice001..." -ForegroundColor Cyan
$regBody = @{
    controller = "did:chainmaker:admin123"
    did = "did:chainmaker:alice001"
    publicKey = "alice_pub_key_123"
} | ConvertTo-Json
$regResult = Invoke-WebRequest -Uri "http://localhost:3000/api/identity/register" -Method POST -Body $regBody -ContentType "application/json" -UseBasicParsing | Select-Object -ExpandProperty Content
Write-Host "✅ 注册结果: $regResult`n"

# ----------------------
# 3. 查询身份
# ----------------------
Write-Host "[3/8] 查询身份信息..." -ForegroundColor Cyan
$queryResult = Invoke-WebRequest -Uri "http://localhost:3000/api/identity/did:chainmaker:alice001" -UseBasicParsing | Select-Object -ExpandProperty Content
Write-Host "✅ 查询结果: $queryResult`n"

# ----------------------
# 4. 验证身份
# ----------------------
Write-Host "[4/8] 验证身份有效性..." -ForegroundColor Cyan
$verifyResult = Invoke-WebRequest -Uri "http://localhost:3000/api/identity/did:chainmaker:alice001/verify" -UseBasicParsing | Select-Object -ExpandProperty Content
Write-Host "✅ 验证结果: $verifyResult`n"

# ----------------------
# 5. 更新身份
# ----------------------
Write-Host "[5/8] 更新身份公钥..." -ForegroundColor Cyan
$updateBody = @{
    controller = "did:chainmaker:admin123"
    publicKey = "alice_updated_pub_key_456"
} | ConvertTo-Json
$updateResult = Invoke-WebRequest -Uri "http://localhost:3000/api/identity/did:chainmaker:alice001" -Method PUT -Body $updateBody -ContentType "application/json" -UseBasicParsing | Select-Object -ExpandProperty Content
Write-Host "✅ 更新结果: $updateResult`n"

# ----------------------
# 6. 查看更新后身份
# ----------------------
Write-Host "[6/8] 查询更新后的身份..." -ForegroundColor Cyan
$queryUpdated = Invoke-WebRequest -Uri "http://localhost:3000/api/identity/did:chainmaker:alice001" -UseBasicParsing | Select-Object -ExpandProperty Content
Write-Host "✅ 更新后信息: $queryUpdated`n"

# ----------------------
# 7. 吊销身份
# ----------------------
Write-Host "[7/8] 吊销身份..." -ForegroundColor Cyan
$revokeBody = @{
    controller = "did:chainmaker:admin123"
} | ConvertTo-Json
$revokeResult = Invoke-WebRequest -Uri "http://localhost:3000/api/identity/did:chainmaker:alice001" -Method DELETE -Body $revokeBody -ContentType "application/json" -UseBasicParsing | Select-Object -ExpandProperty Content
Write-Host "✅ 吊销结果: $revokeResult`n"

# ----------------------
# 8. 验证吊销后状态
# ----------------------
Write-Host "[8/8] 验证吊销后状态..." -ForegroundColor Cyan
$verifyRevoked = Invoke-WebRequest -Uri "http://localhost:3000/api/identity/did:chainmaker:alice001/verify" -UseBasicParsing | Select-Object -ExpandProperty Content
Write-Host "✅ 最终验证: $verifyRevoked`n"

# ----------------------
# 完成
# ----------------------
Write-Host "=== 演示完成！所有功能测试通过 ===" -ForegroundColor Green
Write-Host "`n💡 数据已保存到: data/did-storage.json`n"
```

---

## 📝 浏览器访问（可选）

您也可以在浏览器中直接访问：

| 功能 | URL |
|------|-----|
| 健康检查 | http://localhost:3000/health |
| 查询 alice001 | http://localhost:3000/api/identity/did:chainmaker:alice001 |
| 验证 alice001 | http://localhost:3000/api/identity/did:chainmaker:alice001/verify |

---

## 🧹 重置演示数据（可选）

如果需要重新开始演示：

```powershell
# 删除数据文件（Windows）
Remove-Item D:\develop\homework\blockchain\data\did-storage.json -ErrorAction SilentlyContinue

# 重启后端服务（在后端终端按 Ctrl+C，然后再运行 node app.js）
```

---

## 🔍 查看后端日志

后端服务运行的终端会显示详细的操作日志：

```
[Demo] Registering identity: did:chainmaker:alice001
[Storage] Data saved to file
[Demo] Querying identity: did:chainmaker:alice001
[Demo] Verifying identity: did:chainmaker:alice001
...
```

---

## ⚠️ 常见问题

### Q: 后端服务无法启动？
A: 检查端口 3000 是否被占用，关闭占用程序或使用其他端口

### Q: 健康检查返回连接失败？
A: 确保后端服务正在运行，检查终端输出

### Q: 想再次演示已注册的身份？
A: 可以直接查询，或删除数据文件重新开始

### Q: 长安链需要运行吗？
A: 当前 DEMO_MODE 不需要长安链，长安链只作为后续升级预留

---

## 📚 相关文档

- 项目完整指南：`project_guide.md`
- 快速测试指南：`docs/QUICK_TEST_GUIDE.md`
- 长安链使用指南：`docs/CHAINMAKER_USAGE_GUIDE.md`

---

> 🎯 **提示**：把这个文档固定到 IDE 侧边栏，每次演示时快速参考！
