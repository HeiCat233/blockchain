# 连接真实长安链详细指南

## 现有状态

你已经配置好真实长安链环境，我们已经：
- ✅ 复制了证书文件到 `backend/config/certs`
- ✅ 创建了 `chainmaker-client.js` 真实客户端框架
- ✅ 主应用已更新为使用模块化的架构

---

## 连接真实长安链的两种方式

### 方式 1：使用长安链官方 SDK（推荐）

#### 步骤：

1. **查看长安链官方 SDK 版本**
   - 你的长安链节点在 `localhost:12301`
   - 节点版本信息：查看 `didchain/release/VERSION` 文件

2. **安装 SDK**
   ```bash
   cd backend
   npm install @chainmaker/chainmaker-sdk-js --save
   ```

3. **完善 `chainmaker-client.js`**
   - 在 `chainmaker-client.js` 中替换 TODO 部分
   - 使用真实 SDK 的 `invokeContract` 和 `queryContract` 方法

---

### 方式 2：直接使用长安链 REST 接口（更简单）

长安链有 REST 网关，可以直接调用，不需要复杂 SDK。

查看你节点配置中 `gateway` 是否打开：`chainmaker/config/node1/chainmaker.yml` 中 `rpc.gateway.enabled` 应为 `true`

#### REST 调用示例：
```javascript
const axios = require('axios');

// 查询链状态
axios.get('http://localhost:12301/api/v1/blocks/height')
  .then(resp => console.log('链高度:', resp.data));
```

---

## 现在测试你的环境

我们先确认你的长安链节点是正常的：

1. 访问健康检查：
   ```
   curl http://localhost:12301
   ```

2. 看看你的长安链是否有 Gateway REST 接口

---

## 当前项目文件

- `backend/app.js` - 主应用程序
- `backend/chainmaker-client.js` - 真实链客户端框架，可完善
- `backend/config/certs/` - 你的长安链证书目录
- `backend/test-demo.js` - 测试脚本

---

## 快速切换到真实链

在 `chainmaker-client.js` 中，你只需要：
1. 安装官方 SDK
2. 替换 `putState` 和 `getState` 两个方法为真实链调用
