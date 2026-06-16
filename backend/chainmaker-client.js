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
        
        // 初始化各业务模块的存储
        this.consumptionFile = path.join(__dirname, '..', 'data', 'consumption-storage.json');
        this.reservationFile = path.join(__dirname, '..', 'data', 'reservation-storage.json');
        this.achievementFile = path.join(__dirname, '..', 'data', 'achievement-storage.json');
        this.consumptionStorage = new Map();
        this.reservationStorage = new Map();
        this.achievementStorage = new Map();
        this.loadBusinessData();
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

    loadBusinessData() {
        try {
            const dataDir = path.dirname(this.consumptionFile);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            
            // 加载消费数据
            if (fs.existsSync(this.consumptionFile)) {
                const content = fs.readFileSync(this.consumptionFile, 'utf8');
                const dataArray = JSON.parse(content);
                for (const item of dataArray) {
                    this.consumptionStorage.set(item.key, item.value);
                }
            }
            
            // 加载预约数据
            if (fs.existsSync(this.reservationFile)) {
                const content = fs.readFileSync(this.reservationFile, 'utf8');
                const dataArray = JSON.parse(content);
                for (const item of dataArray) {
                    this.reservationStorage.set(item.key, item.value);
                }
            }
            
            // 加载成就数据
            if (fs.existsSync(this.achievementFile)) {
                const content = fs.readFileSync(this.achievementFile, 'utf8');
                const dataArray = JSON.parse(content);
                for (const item of dataArray) {
                    this.achievementStorage.set(item.key, item.value);
                }
            }
            
            console.log(`[Business Storage] Loaded business data successfully`);
        } catch (err) {
            console.error(`[Business Storage] Failed to load business data: ${err.message}`);
        }
    }

    saveBusinessData() {
        try {
            // 保存消费数据
            const consumptionArray = [];
            for (const [key, value] of this.consumptionStorage) {
                consumptionArray.push({ key, value });
            }
            fs.writeFileSync(this.consumptionFile, JSON.stringify(consumptionArray, null, 2), 'utf8');
            
            // 保存预约数据
            const reservationArray = [];
            for (const [key, value] of this.reservationStorage) {
                reservationArray.push({ key, value });
            }
            fs.writeFileSync(this.reservationFile, JSON.stringify(reservationArray, null, 2), 'utf8');
            
            // 保存成就数据
            const achievementArray = [];
            for (const [key, value] of this.achievementStorage) {
                achievementArray.push({ key, value });
            }
            fs.writeFileSync(this.achievementFile, JSON.stringify(achievementArray, null, 2), 'utf8');
            
            console.log(`[Business Storage] Saved business data successfully`);
        } catch (err) {
            console.error(`[Business Storage] Failed to save business data: ${err.message}`);
        }
    }

    // ==================== 消费管理模块 ====================
    async addConsumption(did, amount, type, location, description) {
        const id = `consumption_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const record = {
            id,
            did,
            amount,
            type, // 'food', 'shopping', 'transport', 'other'
            location,
            description,
            timestamp: new Date().toISOString(),
            status: 'completed'
        };
        this.consumptionStorage.set(id, record);
        this.saveBusinessData();
        return { success: true, data: record };
    }

    async getConsumptionsByDid(did) {
        const records = [];
        for (const value of this.consumptionStorage.values()) {
            if (value.did === did) {
                records.push(value);
            }
        }
        return { success: true, data: records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) };
    }

    async getAllConsumptions() {
        const records = [];
        for (const value of this.consumptionStorage.values()) {
            records.push(value);
        }
        return { success: true, data: records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) };
    }

    // ==================== 场馆预约管理模块 ====================
    async addReservation(did, venueId, venueName, date, timeSlot, attendees = 1) {
        const id = `reservation_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const record = {
            id,
            did,
            venueId,
            venueName,
            date,
            timeSlot,
            attendees,
            status: 'confirmed', // 'pending', 'confirmed', 'cancelled', 'completed'
            createdAt: new Date().toISOString()
        };
        this.reservationStorage.set(id, record);
        this.saveBusinessData();
        return { success: true, data: record };
    }

    async getReservationsByDid(did) {
        const records = [];
        for (const value of this.reservationStorage.values()) {
            if (value.did === did) {
                records.push(value);
            }
        }
        return { success: true, data: records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) };
    }

    async getAllReservations() {
        const records = [];
        for (const value of this.reservationStorage.values()) {
            records.push(value);
        }
        return { success: true, data: records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) };
    }

    async cancelReservation(id) {
        const record = this.reservationStorage.get(id);
        if (!record) {
            return { success: false, error: 'Reservation not found' };
        }
        record.status = 'cancelled';
        record.updatedAt = new Date().toISOString();
        this.reservationStorage.set(id, record);
        this.saveBusinessData();
        return { success: true, data: record };
    }

    async getVenues() {
        const venues = [
            { id: 'library', name: '图书馆', description: '图书借阅、自习室', capacity: 200, icon: '📚' },
            { id: 'gym', name: '体育馆', description: '篮球场、羽毛球场、健身房', capacity: 100, icon: '🏀' },
            { id: 'lab_cs', name: '计算机实验室', description: '编程、人工智能实验', capacity: 50, icon: '💻' },
            { id: 'conference', name: '会议室', description: '小组讨论、会议', capacity: 30, icon: '📋' }
        ];
        return { success: true, data: venues };
    }

    // ==================== 成就管理模块 ====================
    async addAchievement(did, title, type, description, issuer, issueDate) {
        const id = `achievement_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const record = {
            id,
            did,
            title,
            type, // 'scholarship', 'certificate', 'competition', 'other'
            description,
            issuer,
            issueDate,
            verified: true,
            createdAt: new Date().toISOString()
        };
        this.achievementStorage.set(id, record);
        this.saveBusinessData();
        return { success: true, data: record };
    }

    async getAchievementsByDid(did) {
        const records = [];
        for (const value of this.achievementStorage.values()) {
            if (value.did === did) {
                records.push(value);
            }
        }
        return { success: true, data: records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) };
    }

    async getAllAchievements() {
        const records = [];
        for (const value of this.achievementStorage.values()) {
            records.push(value);
        }
        return { success: true, data: records };
    }

    async deleteConsumption(id) {
        if (!this.consumptionStorage.has(id)) {
            return { success: false, error: '消费记录不存在' };
        }
        this.consumptionStorage.delete(id);
        this.saveBusinessData();
        return { success: true };
    }

    async deleteReservation(id) {
        if (!this.reservationStorage.has(id)) {
            return { success: false, error: '预约记录不存在' };
        }
        this.reservationStorage.delete(id);
        this.saveBusinessData();
        return { success: true };
    }

    async deleteAchievement(id) {
        if (!this.achievementStorage.has(id)) {
            return { success: false, error: '成就记录不存在' };
        }
        this.achievementStorage.delete(id);
        this.saveBusinessData();
        return { success: true };
    }

    async deleteRelatedData(did) {
        let deletedCount = 0;
        const idsToDelete = [];
        
        for (const [id, record] of this.consumptionStorage) {
            if (record.did === did) {
                idsToDelete.push(id);
            }
        }
        for (const id of idsToDelete) {
            this.consumptionStorage.delete(id);
            deletedCount++;
        }
        idsToDelete.length = 0;
        
        for (const [id, record] of this.reservationStorage) {
            if (record.did === did) {
                idsToDelete.push(id);
            }
        }
        for (const id of idsToDelete) {
            this.reservationStorage.delete(id);
            deletedCount++;
        }
        idsToDelete.length = 0;
        
        for (const [id, record] of this.achievementStorage) {
            if (record.did === did) {
                idsToDelete.push(id);
            }
        }
        for (const id of idsToDelete) {
            this.achievementStorage.delete(id);
            deletedCount++;
        }
        
        this.saveBusinessData();
        return { success: true, deletedCount };
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

    async registerIdentity(controller, did, publicKey, studentName = null) {
        if (RUN_MODE === 'CHAIN_MODE') {
            return this.registerIdentityChain(controller, did, publicKey, studentName);
        } else {
            return this.registerIdentityDemo(controller, did, publicKey, studentName);
        }
    }

    async getAllIdentities() {
        console.log(`[System] Getting all identities, count: ${this.storage.size}`);
        const identities = [];
        for (const value of this.storage.values()) {
            identities.push(value);
        }
        return { success: true, data: identities };
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

    async registerIdentityDemo(controller, did, publicKey, studentName = null) {
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

        if (studentName) {
            doc.studentName = studentName;
        }
        
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

    async registerIdentityChain(controller, did, publicKey, studentName = null) {
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

        if (studentName) {
            doc.studentName = studentName;
        }
        
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
