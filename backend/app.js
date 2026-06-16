

// ======================================================================
// 模块导入
// ======================================================================

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const SimpleChainmakerClient = require('./chainmaker-client');

// ======================================================================
// 服务初始化
// ======================================================================

const app = express();
const PORT = process.env.PORT || 3000;

// ======================================================================
// 中间件配置
// ======================================================================

app.use(cors());
app.use(bodyParser.json());

// ======================================================================
// 静态文件服务
// ======================================================================

// 根路径重定向到校园电子学生证系统（必须放在静态文件服务之前）
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'campus-system.html'));
});

// 提供其他静态文件
app.use(express.static(path.join(__dirname, '..')));

// ======================================================================
// 区块链客户端初始化
// ======================================================================

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
        message: 'DID System Service Running'
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
        const { controller, did, publicKey, studentName } = req.body;
        const result = await chainClient.registerIdentity(controller, did, publicKey, studentName);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/*
 * 获取所有身份接口
 * 方法：GET
 * 路径：/api/identities
 * 功能：获取系统中所有已注册的身份列表
 * 返回：所有身份的数组
 */
app.get('/api/identities', async (req, res) => {
    try {
        const result = await chainClient.getAllIdentities();
        res.json(result);
    } catch (err) {
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
        const did = req.params.did;
        const result = await chainClient.queryIdentity(did);
        res.json(result);
    } catch (err) {
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
        const did = req.params.did;
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
        const did = req.params.did;
        const { controller, publicKey } = req.body;
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
        const result = await chainClient.revokeIdentity(controller, did);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ======================================================================
// 消费管理 API
// ======================================================================

/*
 * 添加消费记录
 * 方法：POST
 * 路径：/api/consumption
 * 功能：添加一条消费记录
 */
app.post('/api/consumption', async (req, res) => {
    try {
        const { did, amount, type, location, description } = req.body;
        const result = await chainClient.addConsumption(did, amount, type, location, description);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/*
 * 获取指定学生的消费记录
 * 方法：GET
 * 路径：/api/consumption/:did
 */
app.get('/api/consumption/:did', async (req, res) => {
    try {
        const did = req.params.did;
        const result = await chainClient.getConsumptionsByDid(did);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/*
 * 获取所有消费记录
 * 方法：GET
 * 路径：/api/consumptions
 */
app.get('/api/consumptions', async (req, res) => {
    try {
        const result = await chainClient.getAllConsumptions();
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ======================================================================
// 场馆预约管理 API
// ======================================================================

/*
 * 获取场馆列表
 * 方法：GET
 * 路径：/api/venues
 */
app.get('/api/venues', async (req, res) => {
    try {
        const result = await chainClient.getVenues();
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/*
 * 添加预约
 * 方法：POST
 * 路径：/api/reservation
 */
app.post('/api/reservation', async (req, res) => {
    try {
        const { did, venueId, venueName, date, timeSlot, attendees } = req.body;
        const result = await chainClient.addReservation(did, venueId, venueName, date, timeSlot, attendees);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/*
 * 获取指定学生的预约记录
 * 方法：GET
 * 路径：/api/reservation/:did
 */
app.get('/api/reservation/:did', async (req, res) => {
    try {
        const did = req.params.did;
        const result = await chainClient.getReservationsByDid(did);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/*
 * 获取所有预约记录
 * 方法：GET
 * 路径：/api/reservations
 */
app.get('/api/reservations', async (req, res) => {
    try {
        const result = await chainClient.getAllReservations();
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/*
 * 取消预约
 * 方法：PUT
 * 路径：/api/reservation/:id/cancel
 */
app.put('/api/reservation/:id/cancel', async (req, res) => {
    try {
        const id = req.params.id;
        const result = await chainClient.cancelReservation(id);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ======================================================================
// 成就管理 API
// ======================================================================

/*
 * 添加成就
 * 方法：POST
 * 路径：/api/achievement
 */
app.post('/api/achievement', async (req, res) => {
    try {
        const { did, title, type, description, issuer, issueDate } = req.body;
        const result = await chainClient.addAchievement(did, title, type, description, issuer, issueDate);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/*
 * 获取指定学生的成就
 * 方法：GET
 * 路径：/api/achievement/:did
 */
app.get('/api/achievement/:did', async (req, res) => {
    try {
        const did = req.params.did;
        const result = await chainClient.getAchievementsByDid(did);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/*
 * 获取所有成就
 * 方法：GET
 * 路径：/api/achievements
 */
app.get('/api/achievements', async (req, res) => {
    try {
        const result = await chainClient.getAllAchievements();
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ======================================================================
// 删除相关 API
// ======================================================================

/*
 * 删除消费记录
 * 方法：DELETE
 * 路径：/api/consumption/:id
 */
app.delete('/api/consumption/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const result = await chainClient.deleteConsumption(id);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/*
 * 删除预约记录
 * 方法：DELETE
 * 路径：/api/reservation/:id
 */
app.delete('/api/reservation/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const result = await chainClient.deleteReservation(id);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/*
 * 删除成就记录
 * 方法：DELETE
 * 路径：/api/achievement/:id
 */
app.delete('/api/achievement/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const result = await chainClient.deleteAchievement(id);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/*
 * 删除学生关联数据（消费、预约、成就）
 * 方法：DELETE
 * 路径：/api/identity/:did/related
 */
app.delete('/api/identity/:did/related', async (req, res) => {
    try {
        const did = req.params.did;
        const result = await chainClient.deleteRelatedData(did);
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
    console.log(`=== Decentralized DID System Started ===`);
    console.log(`Service URL: http://localhost:${PORT}`);
    console.log(`Demo Page: http://localhost:${PORT}`);
    console.log(`Health Check: http://localhost:${PORT}/health`);
});
