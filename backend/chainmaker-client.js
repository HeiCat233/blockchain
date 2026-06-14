/*
 * 文件名：chainmaker-client.js
 * 功能：长安链客户端封装类
 * 作者：项目开发团队
 * 日期：2024-06-14
 * 描述：简化与长安链交互的客户端，当前使用内存存储作为演示
 */

// ======================================================================
// 模块导入
// ======================================================================

// 引入文件系统模块，用于读取证书文件
const fs = require('fs');
// 引入路径处理模块，用于处理文件路径
const path = require('path');

// ======================================================================
// 客户端类定义
// ======================================================================

/**
 * SimpleChainmakerClient - 简化版长安链客户端
 * 用于后端服务与区块链节点通信
 */
class SimpleChainmakerClient {
    /**
     * 构造函数，初始化客户端配置
     */
    constructor() {
        // 区块链ID，标识要连接的链
        this.chainId = 'chain1';
        // 组织ID，当前使用的组织
        this.orgId = 'TestCMorg1';
        // 节点RPC地址，用于与区块链节点通信
        this.rpcAddr = 'localhost:12301';
        
        // 内存存储（演示用途）
        // 在实际生产环境中，这里应该调用真实的长安链SDK
        this.storage = new Map();
        
        // 尝试加载证书配置
        this.loadCerts();
    }

    /**
     * 加载区块链证书配置
     * 用于与长安链节点建立安全通信
     */
    loadCerts() {
        try {
            // 构建证书目录路径
            const certPath = path.join(__dirname, 'config', 'certs');
            // 检查证书目录是否存在
            if (fs.existsSync(certPath)) {
                console.log('[Chainmaker] 证书目录存在:', certPath);
            }
        } catch (e) {
            // 简单处理异常，生产环境需要详细日志
        }
    }

    // ======================================================================
    // 身份管理业务方法
    // ======================================================================

    /**
     * 注册新身份
     * @param {string} controller - 身份控制器（谁有权操作该身份）
     * @param {string} did - 身份标识符
     * @param {string} publicKey - 身份公钥
     * @returns {Promise<Object>} 注册结果
     */
    async registerIdentity(controller, did, publicKey) {
        console.log(`[Chainmaker] 注册身份: ${did}`);
        
        // 检查DID是否已存在
        if (this.storage.has(`did:${did}`)) {
            return { success: false, error: 'DID 已存在' };
        }

        // 构建DID文档对象
        const doc = {
            id: did,                    // DID唯一标识
            controller: controller,      // 控制器
            publicKey: publicKey,        // 公钥
            status: 'active',            // 状态：活跃
            created: new Date().toISOString(), // 创建时间
            updated: new Date().toISOString()  // 更新时间
        };
        
        // 存储到内存中（演示）
        this.storage.set(`did:${did}`, doc);
        
        // 返回成功结果
        return { success: true, did: did };
    }

    /**
     * 查询身份信息
     * @param {string} did - 身份标识符
     * @returns {Promise<Object>} 查询结果
     */
    async queryIdentity(did) {
        console.log(`[Chainmaker] 查询身份: ${did}`);
        
        // 从存储中获取身份文档
        const doc = this.storage.get(`did:${did}`);
        
        // 检查是否存在
        if (!doc) {
            return { success: false, error: 'DID 不存在' };
        }
        
        // 返回查询结果
        return { success: true, data: doc };
    }

    /**
     * 验证身份有效性
     * @param {string} did - 身份标识符
     * @returns {Promise<Object>} 验证结果
     */
    async verifyIdentity(did) {
        console.log(`[Chainmaker] 验证身份: ${did}`);
        
        // 获取身份文档
        const doc = this.storage.get(`did:${did}`);
        
        // 检查是否存在且状态为active
        if (doc && doc.status === 'active') {
            return { success: true, valid: true };
        }
        
        // 身份不存在或已吊销
        return { success: true, valid: false };
    }

    /**
     * 更新身份信息
     * @param {string} controller - 身份控制器（权限验证）
     * @param {string} did - 身份标识符
     * @param {string} newPublicKey - 新的公钥
     * @returns {Promise<Object>} 更新结果
     */
    async updateIdentity(controller, did, newPublicKey) {
        console.log(`[Chainmaker] 更新身份: ${did}`);
        
        // 获取身份文档
        const doc = this.storage.get(`did:${did}`);
        
        if (!doc) {
            return { success: false, error: 'DID 不存在' };
        }
        
        // 权限验证：只有controller能修改
        if (doc.controller !== controller) {
            return { success: false, error: '无权限操作' };
        }

        // 更新公钥和时间戳
        doc.publicKey = newPublicKey;
        doc.updated = new Date().toISOString();
        
        // 保存更新
        this.storage.set(`did:${did}`, doc);
        
        return { success: true };
    }

    /**
     * 吊销身份
     * @param {string} controller - 身份控制器（权限验证）
     * @param {string} did - 身份标识符
     * @returns {Promise<Object>} 吊销结果
     */
    async revokeIdentity(controller, did) {
        console.log(`[Chainmaker] 吊销身份: ${did}`);
        
        // 获取身份文档
        const doc = this.storage.get(`did:${did}`);
        
        if (!doc) {
            return { success: false, error: 'DID 不存在' };
        }
        
        // 权限验证
        if (doc.controller !== controller) {
            return { success: false, error: '无权限操作' };
        }

        // 更新状态为已吊销
        doc.status = 'revoked';
        doc.updated = new Date().toISOString();
        
        // 保存变更
        this.storage.set(`did:${did}`, doc);
        
        return { success: true };
    }
}

// ======================================================================
// 导出模块
// ======================================================================

// 导出客户端类供其他模块使用
module.exports = SimpleChainmakerClient;
