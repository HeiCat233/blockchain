/*
 * Filename: chainmaker-client.js
 * Function: ChainMaker Client Wrapper (Dual Mode Support)
 * Author: Project Dev Team
 * Date: 2024-06-14
 * Description: Supports two modes:
 *              1. DEMO_MODE (default): File storage, no ChainMaker required
 *              2. CHAIN_MODE: Real ChainMaker, requires node running
 */

// ======================================================================
// Module Imports
// ======================================================================

const fs = require('fs');
const path = require('path');

// ======================================================================
// Configuration
// ======================================================================

const RUN_MODE = process.env.RUN_MODE || 'DEMO_MODE';

const CHAIN_CONFIG = {
    chainId: 'chain1',
    orgId: 'TestCMorg1',
    rpcAddr: 'localhost:12301',
    contractName: 'did-contract'
};

// ======================================================================
// Language Support
// ======================================================================

// Auto-detect system language or use English for compatibility
const useEnglish = true; // Set to false for Chinese (may have encoding issues on Windows)

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
        chain_reserved: '[Chainmaker] ChainMaker mode reserved, using mock implementation',
        chain_hint: '[Chainmaker] Hint: To fully implement ChainMaker mode, install SDK and configure certificates',
        chain_certs_found: '[Chainmaker] Certificate directory found:',
        demo_register: '[Demo] Registering identity:',
        demo_query: '[Demo] Querying identity:',
        demo_verify: '[Demo] Verifying identity:',
        demo_update: '[Demo] Updating identity:',
        demo_revoke: '[Demo] Revoking identity:',
        chain_register: '[Chainmaker] Reserved - Register identity:',
        chain_query: '[Chainmaker] Reserved - Query identity:',
        chain_verify: '[Chainmaker] Reserved - Verify identity:',
        chain_update: '[Chainmaker] Reserved - Update identity:',
        chain_revoke: '[Chainmaker] Reserved - Revoke identity:',
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
        chain_reserved: '[Chainmaker] 长安链模式预留，当前使用模拟实现',
        chain_hint: '[Chainmaker] 提示：要完整实现长安链模式，请安装 SDK 并配置证书',
        chain_certs_found: '[Chainmaker] 证书目录存在:',
        demo_register: '[Demo] 注册身份:',
        demo_query: '[Demo] 查询身份:',
        demo_verify: '[Demo] 验证身份:',
        demo_update: '[Demo] 更新身份:',
        demo_revoke: '[Demo] 吊销身份:',
        chain_register: '[Chainmaker] 预留 - 注册身份:',
        chain_query: '[Chainmaker] 预留 - 查询身份:',
        chain_verify: '[Chainmaker] 预留 - 验证身份:',
        chain_update: '[Chainmaker] 预留 - 更新身份:',
        chain_revoke: '[Chainmaker] 预留 - 吊销身份:',
        error_did_exists: 'DID 已存在',
        error_did_not_found: 'DID 不存在',
        error_no_permission: '无权限操作'
    }
};

const t = useEnglish ? i18n.en : i18n.zh;

// ======================================================================
// Client Class Definition
// ======================================================================

class SimpleChainmakerClient {
    constructor() {
        console.log(`${t.system_run_mode} ${RUN_MODE}`);
        
        if (RUN_MODE === 'CHAIN_MODE') {
            this.initChainMode();
        } else {
            this.initDemoMode();
        }
    }

    // ======================================================================
    // Demo Mode Initialization
    // ======================================================================

    initDemoMode() {
        this.dataFile = path.join(__dirname, '..', 'data', 'did-storage.json');
        this.storage = new Map();
        this.loadFromFile();
        this.loadCerts();
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

    // ======================================================================
    // ChainMaker Mode Initialization
    // ======================================================================

    initChainMode() {
        console.log(t.chain_init);
        
        this.chainId = CHAIN_CONFIG.chainId;
        this.orgId = CHAIN_CONFIG.orgId;
        this.rpcAddr = CHAIN_CONFIG.rpcAddr;
        this.contractName = CHAIN_CONFIG.contractName;
        
        console.log(t.chain_reserved);
        console.log(t.chain_hint);
        
        this.initDemoMode();
    }

    loadCerts() {
        try {
            const certPath = path.join(__dirname, 'config', 'certs');
            if (fs.existsSync(certPath)) {
                console.log(`${t.chain_certs_found} ${certPath}`);
            }
        } catch (err) {
            // Ignore
        }
    }

    // ======================================================================
    // Business Methods - Auto Select Mode
    // ======================================================================

    async registerIdentity(controller, did, publicKey) {
        return RUN_MODE === 'CHAIN_MODE' 
            ? this.registerIdentityChain(controller, did, publicKey)
            : this.registerIdentityDemo(controller, did, publicKey);
    }

    async queryIdentity(did) {
        return RUN_MODE === 'CHAIN_MODE' 
            ? this.queryIdentityChain(did)
            : this.queryIdentityDemo(did);
    }

    async verifyIdentity(did) {
        return RUN_MODE === 'CHAIN_MODE' 
            ? this.verifyIdentityChain(did)
            : this.verifyIdentityDemo(did);
    }

    async updateIdentity(controller, did, newPublicKey) {
        return RUN_MODE === 'CHAIN_MODE' 
            ? this.updateIdentityChain(controller, did, newPublicKey)
            : this.updateIdentityDemo(controller, did, newPublicKey);
    }

    async revokeIdentity(controller, did) {
        return RUN_MODE === 'CHAIN_MODE' 
            ? this.revokeIdentityChain(controller, did)
            : this.revokeIdentityDemo(controller, did);
    }

    // ======================================================================
    // Demo Mode Implementations
    // ======================================================================

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

    // ======================================================================
    // ChainMaker Mode Implementations (Reserved)
    // ======================================================================

    async registerIdentityChain(controller, did, publicKey) {
        console.log(`${t.chain_register} ${did}`);
        return this.registerIdentityDemo(controller, did, publicKey);
    }

    async queryIdentityChain(did) {
        console.log(`${t.chain_query} ${did}`);
        return this.queryIdentityDemo(did);
    }

    async verifyIdentityChain(did) {
        console.log(`${t.chain_verify} ${did}`);
        return this.verifyIdentityDemo(did);
    }

    async updateIdentityChain(controller, did, newPublicKey) {
        console.log(`${t.chain_update} ${did}`);
        return this.updateIdentityDemo(controller, did, newPublicKey);
    }

    async revokeIdentityChain(controller, did) {
        console.log(`${t.chain_revoke} ${did}`);
        return this.revokeIdentityDemo(controller, did);
    }
}

// ======================================================================
// Module Export
// ======================================================================

module.exports = SimpleChainmakerClient;
