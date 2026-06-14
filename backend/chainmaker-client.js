const fs = require('fs');
const path = require('path');

class SimpleChainmakerClient {
    constructor() {
        this.chainId = 'chain1';
        this.orgId = 'TestCMorg1';
        this.rpcAddr = 'localhost:12301';
        
        // 内存存储
        this.storage = new Map();
        
        this.loadCerts();
    }

    loadCerts() {
        try {
            const certPath = path.join(__dirname, 'config', 'certs');
            if (fs.existsSync(certPath)) {
                console.log('[Chainmaker] 证书目录存在:', certPath);
            }
        } catch (e) {
            // 简单处理
        }
    }

    // 身份操作
    async registerIdentity(controller, did, publicKey) {
        console.log(`[Chainmaker] 注册身份: ${did}`);
        if (this.storage.has(`did:${did}`)) {
            return { success: false, error: 'DID 已存在' };
        }

        const doc = {
            id: did,
            controller: controller,
            publicKey: publicKey,
            status: 'active',
            created: new Date().toISOString(),
            updated: new Date().toISOString()
        };
        this.storage.set(`did:${did}`, doc);
        return { success: true, did: did };
    }

    async queryIdentity(did) {
        console.log(`[Chainmaker] 查询身份: ${did}`);
        const doc = this.storage.get(`did:${did}`);
        if (!doc) {
            return { success: false, error: 'DID 不存在' };
        }
        return { success: true, data: doc };
    }

    async verifyIdentity(did) {
        console.log(`[Chainmaker] 验证身份: ${did}`);
        const doc = this.storage.get(`did:${did}`);
        if (doc && doc.status === 'active') {
            return { success: true, valid: true };
        }
        return { success: true, valid: false };
    }

    async updateIdentity(controller, did, newPublicKey) {
        console.log(`[Chainmaker] 更新身份: ${did}`);
        const doc = this.storage.get(`did:${did}`);
        if (!doc) {
            return { success: false, error: 'DID 不存在' };
        }
        if (doc.controller !== controller) {
            return { success: false, error: '无权限操作' };
        }

        doc.publicKey = newPublicKey;
        doc.updated = new Date().toISOString();
        this.storage.set(`did:${did}`, doc);
        return { success: true };
    }

    async revokeIdentity(controller, did) {
        console.log(`[Chainmaker] 吊销身份: ${did}`);
        const doc = this.storage.get(`did:${did}`);
        if (!doc) {
            return { success: false, error: 'DID 不存在' };
        }
        if (doc.controller !== controller) {
            return { success: false, error: '无权限操作' };
        }

        doc.status = 'revoked';
        doc.updated = new Date().toISOString();
        this.storage.set(`did:${did}`, doc);
        return { success: true };
    }
}

module.exports = SimpleChainmakerClient;
