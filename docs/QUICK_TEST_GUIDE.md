# DID 系统快速测试指南

## ✅ 当前状态

- ✅ 长安链：运行中
- ✅ 后端服务：运行中
- ✅ 健康检查：通过

---

## 🚀 快速测试

### 1️⃣ 健康检查
```powershell
# 应该返回：{"status":"ok","message":"DID System Service Running"}
Invoke-WebRequest -Uri http://localhost:3000/health -UseBasicParsing
```

### 2️⃣ 注册一个新身份
```powershell
$body = @{
    controller = "did:chainmaker:admin123"
    did = "did:chainmaker:testuser001"
    publicKey = "test_public_key_12345"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/identity/register" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
```

### 3️⃣ 查询身份信息
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/identity/did:chainmaker:testuser001" -UseBasicParsing
```

### 4️⃣ 验证身份
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/identity/did:chainmaker:testuser001/verify" -UseBasicParsing
```

---

## 📋 完整的 API 文档

| 接口 | 方法 | 说明 |
|------|------|------|
| `/health` | GET | 健康检查 |
| `/api/identity/register` | POST | 注册身份 |
| `/api/identity/{did}` | GET | 查询身份 |
| `/api/identity/{did}/verify` | GET | 验证身份 |
| `/api/identity/{did}` | PUT | 更新身份 |
| `/api/identity/{did}` | DELETE | 吊销身份 |

---

## 🎯 测试流程建议

### 完整流程测试
1. ✅ 健康检查
2. ✅ 注册身份
3. ✅ 查询身份
4. ✅ 验证身份
5. ✅ 更新身份
6. ✅ 验证身份
7. ✅ 吊销身份
8. ✅ 再次验证（应该返回无效）

---

## 🌐 浏览器访问

您也可以在浏览器中访问：

- **健康检查**：`http://localhost:3000/health`
- **查询身份**：`http://localhost:3000/api/identity/did:chainmaker:testuser001`

---

## 📝 数据存储

- **当前模式**：DEMO_MODE（文件存储）
- **数据位置**：`D:\develop\homework\blockchain\data\did-storage.json`

---

## 🔧 开发模式

如需切换到长安链模式：
1. 编辑 `backend/chainmaker-client.js`
2. 设置 `useEnglish = false`（如需中文输出）
3. 设置环境变量 `RUN_MODE=CHAIN_MODE`
4. 重启后端服务
