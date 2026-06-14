const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const SimpleChainmakerClient = require('./chainmaker-client');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());

// 初始化长安链客户端
const chainClient = new SimpleChainmakerClient();

// API 接口
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'DID 系统服务正常'
    });
});

// 身份注册
app.post('/api/identity/register', async (req, res) => {
    try {
        const { controller, did, publicKey } = req.body;
        const result = await chainClient.registerIdentity(controller, did, publicKey);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 身份查询
app.get('/api/identity/:did', async (req, res) => {
    try {
        const did = req.params.did;
        const result = await chainClient.queryIdentity(did);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 身份验证
app.get('/api/identity/:did/verify', async (req, res) => {
    try {
        const did = req.params.did;
        const result = await chainClient.verifyIdentity(did);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 身份更新
app.put('/api/identity/:did', async (req, res) => {
    try {
        const did = req.params.did;
        const { controller, publicKey } = req.body;
        const result = await chainClient.updateIdentity(controller, did, publicKey);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 身份吊销
app.delete('/api/identity/:did', async (req, res) => {
    try {
        const did = req.params.did;
        const { controller } = req.body;
        const result = await chainClient.revokeIdentity(controller, did);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 启动服务
app.listen(PORT, () => {
    console.log(`=== 分布式DID系统启动成功 ===`);
    console.log(`服务地址: http://localhost:${PORT}`);
    console.log(`健康检查: http://localhost:${PORT}/health`);
});
