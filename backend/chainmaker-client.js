/*
 * 文件名：chainmaker-client.js
 * 功能：长安链客户端封装类（支持双模式）
 * 作者：项目开发团队
 * 日期：2024-06-14
 * 描述：支持两种模式：
 *       1. DEMO_MODE（默认）：文件存储，不需要长安链节点
 *       2. CHAIN_MODE：真实长安链，需要节点运行
 */

// ======================================================================
// 模块导入
// ======================================================================

const fs = require('fs');
const path = require('path');

// ======================================================================
// 配置常量
// ======================================================================

const RUN_MODE = process.env.RUN_MODE || 'DEMO_MODE';

const CHAIN_CONFIG = {
    chainId: 'chain1',
    orgId: 'TestCMorg1',
    rpcAddr: 'localhost:12301',
    contractName: 'did-contract'
};

// ======================================================================
// 语言支持
// ======================================================================

// 为了Windows终端兼容性，控制台输出使用英文，但代码注释使用中文
// 如果需要中文输出，将 useEnglish 设置为 false（可能有编码问题）
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
// 客户端类定义
// ======================================================================

class SimpleChainmakerClient {
    /**
     * 构造函数，初始化客户端配置
     */
    constructor() {
        console.log(`${t.system_run_mode} ${RUN_MODE}`);
        
        // 初始化存储引擎
        if (RUN_MODE === 'CHAIN_MODE') {
            this.initChainMode();
        } else {
            this.initDemoMode();
        }
    }

    // ======================================================================
    // 演示模式初始化
    // ======================================================================

    /**
     * 初始化演示模式（文件存储）
     */
    initDemoMode() {
        // 数据存储文件路径（在项目根目录下）
        this.dataFile = path.join(__dirname, '..', 'data', 'did-storage.json');
        
        // 初始化内存存储
        this.storage = new Map();
        
        // 从文件加载已有数据
        this.loadFromFile();
        
        // 尝试加载证书配置（仅用于提示）
        this.loadCerts();
        
        console.log(t.system_demo_started);
    }

    /**
     * 从文件加载数据到内存
     */
    loadFromFile() {
        try {
            // 确保数据目录存在
            const dataDir = path.dirname(this.dataFile);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
                console.log(`${t.storage_create_dir} ${dataDir}`);
            }
            
            // 如果文件存在，读取内容
            if (fs.existsSync(this.dataFile)) {
                const fileContent = fs.readFileSync(this.dataFile, 'utf8');
                const dataArray = JSON.parse(fileContent);
                
                // 将数组转换为 Map
                for (const item of dataArray) {
                    this.storage.set(item.key, item.value);
                }
                
                console.log(`${t.storage_loaded} ${this.storage.size} ${t.storage_loaded_2}`);
            } else {
                console.log(t.storage_file_missing);
            }
        } catch (err) {
            console.error(`${t.storage_load_error} ${err.message}`);
            // 出错时使用空的内存存储
            this.storage = new Map();
        }
    }

    /**
     * 将内存数据保存到文件
     */
    saveToFile() {
        try {
            // 确保数据目录存在
            const dataDir = path.dirname(this.dataFile);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            
            // 将 Map 转换为数组以便序列化
            const dataArray = [];
            for (const [key, value] of this.storage) {
                dataArray.push({ key, value });
            }
            
            // 写入文件
            fs.writeFileSync(this.dataFile, JSON.stringify(dataArray, null, 2), 'utf8');
            console.log(`${t.storage_saved} (${this.storage.size} ${t.storage_saved_2})`);
        } catch (err) {
            console.error(`${t.storage_save_error} ${err.message}`);
        }
    }

    // ======================================================================
    // 长安链模式初始化
    // ======================================================================

    /**
     * 初始化长安链模式
     */
    initChainMode() {
        console.log(t.chain_init);
        
        this.chainId = CHAIN_CONFIG.chainId;
        this.orgId = CHAIN_CONFIG.orgId;
        this.rpcAddr = CHAIN_CONFIG.rpcAddr;
        this.contractName = CHAIN_CONFIG.contractName;
        
        // 这里预留长安链 SDK 初始化
        // 实际使用时需要安装：npm install @chainmaker/chainmaker-sdk
        // this.chainClient = new ChainClient(config);
        
        console.log(t.chain_reserved);
        console.log(t.chain_hint);
        
        // 降级到演示模式（暂存）
        this.initDemoMode();
    }

    /**
     * 加载区块链证书配置
     */
    loadCerts() {
        try {
            const certPath = path.join(__dirname, 'config', 'certs');
            if (fs.existsSync(certPath)) {
                console.log(`${t.chain_certs_found} ${certPath}`);
            }
        } catch (err) {
            // 简单处理
        }
    }

    // ======================================================================
    // 身份管理业务方法 - 自动选择模式
    // ======================================================================

    /**
     * 注册新身份
     */
    async registerIdentity(controller, did, publicKey) {
        if (RUN_MODE === 'CHAIN_MODE') {
            return this.registerIdentityChain(controller, did, publicKey);
        } else {
            return this.registerIdentityDemo(controller, did, publicKey);
        }
    }

    /**
     * 查询身份信息
     */
    async queryIdentity(did) {
        if (RUN_MODE === 'CHAIN_MODE') {
            return this.queryIdentityChain(did);
        } else {
            return this.queryIdentityDemo(did);
        }
    }

    /**
     * 验证身份有效性
     */
    async verifyIdentity(did) {
        if (RUN_MODE === 'CHAIN_MODE') {
            return this.verifyIdentityChain(did);
        } else {
            return this.verifyIdentityDemo(did);
        }
    }

    /**
     * 更新身份信息
     */
    async updateIdentity(controller, did, newPublicKey) {
        if (RUN_MODE === 'CHAIN_MODE') {
            return this.updateIdentityChain(controller, did, newPublicKey);
        } else {
            return this.updateIdentityDemo(controller, did, newPublicKey);
        }
    }

    /**
     * 吊销身份
     */
    async revokeIdentity(controller, did) {
        if (RUN_MODE === 'CHAIN_MODE') {
            return this.revokeIdentityChain(controller, did);
        } else {
            return this.revokeIdentityDemo(controller, did);
        }
    }

    // ======================================================================
    // 演示模式方法实现
    // ======================================================================

    async registerIdentityDemo(controller, did, publicKey) {
        console.log(`${t.demo_register} ${did}`);
        
        // 检查 DID 是否已存在
        if (this.storage.has(`did:${did}`)) {
            return { success: false, error: t.error_did_exists };
        }

        // 构建 DID 文档对象
        const doc = {
            id: did,
            controller: controller,
            publicKey: publicKey,
            status: 'active',
            created: new Date().toISOString(),
            updated: new Date().toISOString()
        };
        
        // 存储到内存
        this.storage.set(`did:${did}`, doc);
        // 保存到文件
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
        
        // 权限验证
        if (doc.controller !== controller) {
            return { success: false, error: t.error_no_permission };
        }

        // 更新公钥和时间戳
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

        // 更新状态为已吊销
        doc.status = 'revoked';
        doc.updated = new Date().toISOString();
        
        this.storage.set(`did:${did}`, doc);
        this.saveToFile();
        
        return { success: true };
    }

    // ======================================================================
    // 长安链模式方法实现（预留接口）
    // ======================================================================

    async registerIdentityChain(controller, did, publicKey) {
        console.log(`${t.chain_register} ${did}`);
        // 这里将来会调用真实的长安链 SDK
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
// 导出模块
// ======================================================================

module.exports = SimpleChainmakerClient;
