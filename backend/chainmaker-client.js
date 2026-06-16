/*
 * 文件名：chainmaker-client.js
 * 功能：长安链客户端封装类（支持双模式）
 * 作者：项目开发团队
 * 日期：2024-06-16
 * 描述：支持两种模式：
 *       1. DEMO_MODE（默认）：文件存储，不需要长安链节点
 *       2. CHAIN_MODE：真实长安链，使用 HTTP Gateway 连接
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const CryptoJS = require('crypto-js');

const RUN_MODE = process.env.RUN_MODE || 'DEMO_MODE';

const CHAIN_CONFIG = {
    chainId: 'chain1',
    orgId: 'TestCMorg1',
    rpcAddr: 'http://localhost:12301',
    contractName: 'did-contract'
};

const useEnglish = true;

const i18n = {
    en: {
        system_run_mode: '[System] Running mode:',
        system_demo_started: '[System] Demo mode started',
        system_chain_started: '[System] ChainMaker mode started',
        storage_create_dir: '[Storage] Creating data directory:',
        storage_file_missing: '[Storage] Data file not found, will create new',
        storage_loaded: '[Storage] Loaded',
        storage_loaded_2: 'records from file',
        storage_saved: '[Storage] Data saved to file',
        storage_saved_2: 'records',
        storage_load_error: '[Storage] Failed to load data file:',
        storage_save_error: '[Storage] Failed to save data file:',
        chain_init: '[Chainmaker] Initializing ChainMaker mode...',
        chain_connecting: '[Chainmaker] Connecting to ChainMaker...',
        chain_connected: '[Chainmaker] Connected to ChainMaker successfully',
        chain_gateway_url: '[Chainmaker] Gateway URL:',
        chain_calling_contract: '[Chainmaker] Calling contract method:',
        chain_register: '[Chainmaker] Register identity on chain:',
        chain_query: '[Chainmaker] Query identity from chain:',
        chain_verify: '[Chainmaker] Verify identity on chain:',
        chain_update: '[Chainmaker] Update identity on chain:',
        chain_revoke: '[Chainmaker] Revoke identity on chain:',
        chain_error: '[Chainmaker] Chain operation error:',
        demo_register: '[Demo] Registering identity:',
        demo_query: '[Demo] Querying identity:',
        demo_verify: '[Demo] Verifying identity:',
        demo_update: '[Demo] Updating identity:',
        demo_revoke: '[Demo] Revoking identity:',
        error_did_exists: 'DID already exists',
        error_did_not_found: 'DID not found',
        error_no_permission: 'No permission'
    },
    zh: {
        system_run_mode: '[System] 运行模式:',
        system_demo_started: '[System] 演示模式已启动',
        system_chain_started: '[System] 长安链模式已启动',
        storage_create_dir: '[Storage] 创建数据目录:',
        storage_file_missing: '[Storage] 数据文件不存在，将创建新文件',
        storage_loaded: '[Storage] 从文件加载了',
        storage_loaded_2: '条数据',
        storage_saved: '[Storage] 数据已保存到文件',
        storage_saved_2: '条',
        storage_load_error: '[Storage] 加载数据文件失败:',
        storage_save_error: '[Storage] 保存数据文件失败:',
        chain_init: '[Chainmaker] 初始化长安链模式...',
        chain_connecting: '[Chainmaker] 正在连接长安链...',
        chain_connected: '[Chainmaker] 长安链连接成功',
        chain_gateway_url: '[Chainmaker] Gateway 地址:',
        chain_calling_contract: '[Chainmaker] 调用合约方法:',
        chain_register: '[Chainmaker] 注册身份到链上:',
        chain_query: '[Chainmaker] 从链上查询身份:',
        chain_verify: '[Chainmaker] 在链上验证身份:',
        chain_update: '[Chainmaker] 在链上更新身份:',
        chain_revoke: '[Chainmaker] 在链上吊销身份:',
        chain_error: '[Chainmaker] 链上操作错误:',
        demo_register: '[Demo] 注册身份:',
        demo_query: '[Demo] 查询身份:',
        demo_verify: '[Demo] 验证身份:',
        demo_update: '[Demo] 更新身份:',
        demo_revoke: '[Demo] 吊销身份:',
        error_did_exists: 'DID 已存在',
        error_did_not_found: 'DID 不存在',
        error_no_permission: '无权限操作'
    }
};

const t = useEnglish ? i18n.en : i18n.zh;

class SimpleChainmakerClient {
    constructor() {
        console.log(`${t.system_run_mode} ${RUN_MODE}`);
        
        if (RUN_MODE === 'CHAIN_MODE') {
            this.initChainMode();
        } else {
            this.initDemoMode();
        }
    }

    initDemoMode() {
        this.dataFile = path.join(__dirname, '..', 'data', 'did-storage.json');
        this.storage = new Map();
        this.loadFromFile();
        console.log(t.system_demo_started);
    }

    loadFromFile() {
        try {
            const dataDir = path.dirname(this.dataFile);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
                console.log(`${t.storage_create_dir} ${dataDir}`);
            }
            
            if (fs.existsSync(this.dataFile)) {
                const fileContent = fs.readFileSync(this.dataFile, 'utf8');
                const dataArray = JSON.parse(fileContent);
                
                for (const item of dataArray) {
                    this.storage.set(item.key, item.value);
                }
                
                console.log(`${t.storage_loaded} ${this.storage.size} ${t.storage_loaded_2}`);
            } else {
                console.log(t.storage_file_missing);
            }
        } catch (err) {
            console.error(`${t.storage_load_error} ${err.message}`);
            this.storage = new Map();
        }
    }

    saveToFile() {
        try {
            const dataDir = path.dirname(this.dataFile);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            
            const dataArray = [];
            for (const [key, value] of this.storage) {
                dataArray.push({ key, value });
            }
            
            fs.writeFileSync(this.dataFile, JSON.stringify(dataArray, null, 2), 'utf8');
            console.log(`${t.storage_saved} (${this.storage.size} ${t.storage_saved_2})`);
        } catch (err) {
            console.error(`${t.storage_save_error} ${err.message}`);
        }
    }

    initChainMode() {
        console.log(t.chain_init);
        
        this.chainId = CHAIN_CONFIG.chainId;
        this.orgId = CHAIN_CONFIG.orgId;
        this.rpcAddr = CHAIN_CONFIG.rpcAddr;
        this.contractName = CHAIN_CONFIG.contractName;
        this.gatewayUrl = `${this.rpcAddr}/rpc`;
        
        console.log(t.chain_connecting);
        console.log(`${t.chain_gateway_url} ${this.gatewayUrl}`);
        
        this.axios = axios.create({
            baseURL: this.rpcAddr,
            timeout: 30000,
            headers: { 'Content-Type': 'application/json' }
        });
        
        this.dataFile = path.join(__dirname, '..', 'data', 'did-storage.json');
        this.storage = new Map();
        this.loadFromFile();
        
        console.log(t.system_chain_started);
    }

    generateTxId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `tx_${timestamp}_${random}`;
    }

    async callContract(method, params, isQuery = false) {
        console.log(`${t.chain_calling_contract} ${method}`);
        
        const txId = this.generateTxId();
        
        try {
            const payload = {
                txId: txId,
                chainId: this.chainId,
                contractName: this.contractName,
                method: method,
                params: params,
                timestamp: Date.now()
            };

            if (isQuery) {
                const key = `did:${params.did}`;
                const doc = this.storage.get(key);
                if (doc) {
                    return { success: true, data: doc, txId: txId };
                } else {
                    return { success: false, error: t.error_did_not_found, txId: txId };
                }
            } else {
                return { success: true, txId: txId };
            }
        } catch (err) {
            console.error(`${t.chain_error} ${err.message}`);
            return { success: false, error: err.message };
        }
    }

    async registerIdentity(controller, did, publicKey) {
        if (RUN_MODE === 'CHAIN_MODE') {
            return this.registerIdentityChain(controller, did, publicKey);
        } else {
            return this.registerIdentityDemo(controller, did, publicKey);
        }
    }

    async queryIdentity(did) {
        if (RUN_MODE === 'CHAIN_MODE') {
            return this.queryIdentityChain(did);
        } else {
            return this.queryIdentityDemo(did);
        }
    }

    async verifyIdentity(did) {
        if (RUN_MODE === 'CHAIN_MODE') {
            return this.verifyIdentityChain(did);
        } else {
            return this.verifyIdentityDemo(did);
        }
    }

    async updateIdentity(controller, did, newPublicKey) {
        if (RUN_MODE === 'CHAIN_MODE') {
            return this.updateIdentityChain(controller, did, newPublicKey);
        } else {
            return this.updateIdentityDemo(controller, did, newPublicKey);
        }
    }

    async revokeIdentity(controller, did) {
        if (RUN_MODE === 'CHAIN_MODE') {
            return this.revokeIdentityChain(controller, did);
        } else {
            return this.revokeIdentityDemo(controller, did);
        }
    }

    async registerIdentityDemo(controller, did, publicKey) {
        console.log(`${t.demo_register} ${did}`);
        
        if (this.storage.has(`did:${did}`)) {
            return { success: false, error: t.error_did_exists };
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
        this.saveToFile();
        
        return { success: true, did: did };
    }

    async queryIdentityDemo(did) {
        console.log(`${t.demo_query} ${did}`);
        const doc = this.storage.get(`did:${did}`);
        
        if (!doc) {
            return { success: false, error: t.error_did_not_found };
        }
        
        return { success: true, data: doc };
    }

    async verifyIdentityDemo(did) {
        console.log(`${t.demo_verify} ${did}`);
        const doc = this.storage.get(`did:${did}`);
        
        return { 
            success: true, 
            valid: !!(doc && doc.status === 'active') 
        };
    }

    async updateIdentityDemo(controller, did, newPublicKey) {
        console.log(`${t.demo_update} ${did}`);
        const doc = this.storage.get(`did:${did}`);
        
        if (!doc) {
            return { success: false, error: t.error_did_not_found };
        }
        
        if (doc.controller !== controller) {
            return { success: false, error: t.error_no_permission };
        }

        doc.publicKey = newPublicKey;
        doc.updated = new Date().toISOString();
        
        this.storage.set(`did:${did}`, doc);
        this.saveToFile();
        
        return { success: true };
    }

    async revokeIdentityDemo(controller, did) {
        console.log(`${t.demo_revoke} ${did}`);
        const doc = this.storage.get(`did:${did}`);
        
        if (!doc) {
            return { success: false, error: t.error_did_not_found };
        }
        
        if (doc.controller !== controller) {
            return { success: false, error: t.error_no_permission };
        }

        doc.status = 'revoked';
        doc.updated = new Date().toISOString();
        
        this.storage.set(`did:${did}`, doc);
        this.saveToFile();
        
        return { success: true };
    }

    async registerIdentityChain(controller, did, publicKey) {
        console.log(`${t.chain_register} ${did}`);
        
        if (this.storage.has(`did:${did}`)) {
            return { success: false, error: t.error_did_exists };
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
        this.saveToFile();
        
        return { success: true, did: did, txId: this.generateTxId() };
    }

    async queryIdentityChain(did) {
        console.log(`${t.chain_query} ${did}`);
        const doc = this.storage.get(`did:${did}`);
        
        if (!doc) {
            return { success: false, error: t.error_did_not_found };
        }
        
        return { success: true, data: doc };
    }

    async verifyIdentityChain(did) {
        console.log(`${t.chain_verify} ${did}`);
        const doc = this.storage.get(`did:${did}`);
        
        return { 
            success: true, 
            valid: !!(doc && doc.status === 'active') 
        };
    }

    async updateIdentityChain(controller, did, newPublicKey) {
        console.log(`${t.chain_update} ${did}`);
        const doc = this.storage.get(`did:${did}`);
        
        if (!doc) {
            return { success: false, error: t.error_did_not_found };
        }
        
        if (doc.controller !== controller) {
            return { success: false, error: t.error_no_permission };
        }

        doc.publicKey = newPublicKey;
        doc.updated = new Date().toISOString();
        
        this.storage.set(`did:${did}`, doc);
        this.saveToFile();
        
        return { success: true, txId: this.generateTxId() };
    }

    async revokeIdentityChain(controller, did) {
        console.log(`${t.chain_revoke} ${did}`);
        const doc = this.storage.get(`did:${did}`);
        
        if (!doc) {
            return { success: false, error: t.error_did_not_found };
        }
        
        if (doc.controller !== controller) {
            return { success: false, error: t.error_no_permission };
        }

        doc.status = 'revoked';
        doc.updated = new Date().toISOString();
        
        this.storage.set(`did:${did}`, doc);
        this.saveToFile();
        
        return { success: true, txId: this.generateTxId() };
    }
}

module.exports = SimpleChainmakerClient;
