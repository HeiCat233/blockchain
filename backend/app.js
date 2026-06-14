/*
 * 文件名：app.js
 * 功能：分布式数字身份系统后端服务入口
 * 作者：项目开发团队
 * 日期：2024-06-14
 * 描述：基于 Express 框架构建的 RESTful API 服务，提供身份管理接口
 */

// ======================================================================
// 模块导入
// ======================================================================

// 引入 Express Web 框架，用于构建 API 服务
const express = require('express');
// 引入 CORS 中间件，允许跨域请求
const cors = require('cors');
// 引入 body-parser 中间件，用于解析请求体中的 JSON 数据
const bodyParser = require('body-parser');
// 引入长安链客户端封装，用于与区块链交互
const SimpleChainmakerClient = require('./chainmaker-client');

// ======================================================================
// 服务初始化
// ======================================================================

// 创建 Express 应用实例
const app = express();
// 定义服务监听端口
const PORT = 3000;

// ======================================================================
// 中间件配置
// ======================================================================

// 启用 CORS（跨域资源共享），允许前端从其他域调用接口
app.use(cors());
// 启用 JSON 解析中间件，自动解析请求体中的 JSON 数据
app.use(bodyParser.json());

// ======================================================================
// 区块链客户端初始化
// ======================================================================

// 创建长安链客户端实例
// 该客户端负责与区块链节点通信，调用智能合约
const chainClient = new SimpleChainmakerClient();

// ======================================================================
// API 接口路由定义
// ======================================================================

/*
 * 健康检查接口
 * 方法：GET
 * 路径：/health
 * 功能：检查服务是否正常运行
 * 返回：服务状态信息
 */
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'DID 系统服务正常'
    });
});

/*
 * 身份注册接口
 * 方法：POST
 * 路径：/api/identity/register
 * 功能：在区块链上注册一个新的数字身份
 * 请求体：
 *   {
 *     "controller": "did:chainmaker:admin123",   // 身份控制器
 *     "did": "did:chainmaker:user001",            // 身份标识符
 *     "publicKey": "-----BEGIN PUBLIC KEY----..."  // 公钥
 *   }
 * 返回：注册结果
 */
app.post('/api/identity/register', async (req, res) => {
    try {
        // 从请求体中解构参数
        const { controller, did, publicKey } = req.body;
        // 调用区块链客户端的注册方法
        const result = await chainClient.registerIdentity(controller, did, publicKey);
        // 返回结果给前端
        res.json(result);
    } catch (err) {
        // 捕获异常，返回500错误
        res.status(500).json({ success: false, error: err.message });
    }
});

/*
 * 身份查询接口
 * 方法：GET
 * 路径：/api/identity/:did
 * 功能：根据 DID 查询完整的身份信息
 * 参数：
 *   - did: 路径参数，身份标识符
 * 返回：身份文档数据
 */
app.get('/api/identity/:did', async (req, res) => {
    try {
        // 从 URL 路径中获取 DID 参数
        const did = req.params.did;
        // 调用区块链客户端的查询方法
        const result = await chainClient.queryIdentity(did);
        // 返回结果
        res.json(result);
    } catch (err) {
        // 异常处理
        res.status(500).json({ success: false, error: err.message });
    }
});

/*
 * 身份验证接口
 * 方法：GET
 * 路径：/api/identity/:did/verify
 * 功能：验证身份是否有效（存在且状态为 active）
 * 参数：
 *   - did: 路径参数，身份标识符
 * 返回：验证结果，valid 字段为 true/false
 */
app.get('/api/identity/:did/verify', async (req, res) => {
    try {
        // 获取 DID 参数
        const did = req.params.did;
        // 调用验证方法
        const result = await chainClient.verifyIdentity(did);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/*
 * 身份更新接口
 * 方法：PUT
 * 路径：/api/identity/:did
 * 功能：更新身份的公钥，需要 controller 权限
 * 参数：
 *   - did: 路径参数，身份标识符
 * 请求体：
 *   {
 *     "controller": "did:chainmaker:admin123",  // 权限验证
 *     "publicKey": "NEW_PUBLIC_KEY"             // 新公钥
 *   }
 * 返回：更新结果
 */
app.put('/api/identity/:did', async (req, res) => {
    try {
        // 获取路径参数和请求体参数
        const did = req.params.did;
        const { controller, publicKey } = req.body;
        // 调用更新方法
        const result = await chainClient.updateIdentity(controller, did, publicKey);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/*
 * 身份吊销接口
 * 方法：DELETE
 * 路径：/api/identity/:did
 * 功能：将身份状态改为 revoked，使其失效
 * 参数：
 *   - did: 路径参数，身份标识符
 * 请求体：
 *   {
 *     "controller": "did:chainmaker:admin123"  // 权限验证
 *   }
 * 返回：吊销结果
 */
app.delete('/api/identity/:did', async (req, res) => {
    try {
        const did = req.params.did;
        const { controller } = req.body;
        // 调用吊销方法
        const result = await chainClient.revokeIdentity(controller, did);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ======================================================================
// 启动服务
// ======================================================================

/*
 * 启动 Express 服务器
 * 监听指定端口，并在启动成功后打印信息
 */
app.listen(PORT, () => {
    console.log(`=== 分布式DID系统启动成功 ===`);
    console.log(`服务地址: http://localhost:${PORT}`);
    console.log(`健康检查: http://localhost:${PORT}/health`);
});
