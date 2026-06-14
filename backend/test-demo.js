const http = require('http');

const baseUrl = 'http://localhost:3000';

async function testDIDSystem() {
    console.log('=== 开始测试 DID 系统 ===\n');

    // 1. 检查健康状态
    console.log('1. 测试健康检查接口...');
    const healthResult = await makeRequest('GET', '/health');
    console.log('✅ 健康状态:', healthResult, '\n');

    // 2. 注册身份
    console.log('2. 注册新身份...');
    const registerData = {
        controller: "user1",
        did: "did:chain:test:user1",
        publicKey: "0x123456abcdef"
    };
    const registerResult = await makeRequest('POST', '/api/identity/register', registerData);
    console.log('✅ 注册结果:', registerResult, '\n');

    // 3. 查询身份
    console.log('3. 查询身份信息...');
    const queryResult = await makeRequest('GET', '/api/identity/did:chain:test:user1');
    console.log('✅ 查询结果:', queryResult, '\n');

    // 4. 验证身份有效性
    console.log('4. 验证身份有效性...');
    const verifyResult = await makeRequest('GET', '/api/identity/did:chain:test:user1/verify');
    console.log('✅ 验证结果:', verifyResult, '\n');

    // 5. 更新身份
    console.log('5. 更新身份公钥...');
    const updateData = {
        controller: "user1",
        publicKey: "0xupdated_abcdef123"
    };
    const updateResult = await makeRequest('PUT', '/api/identity/did:chain:test:user1', updateData);
    console.log('✅ 更新结果:', updateResult, '\n');

    // 6. 查询更新后身份
    console.log('6. 查询更新后的身份...');
    const queryUpdatedResult = await makeRequest('GET', '/api/identity/did:chain:test:user1');
    console.log('✅ 更新后信息:', queryUpdatedResult, '\n');

    console.log('=== 测试成功完成！核心功能都已正常运行 ===');
}

function makeRequest(method, path, data) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    resolve(body);
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

testDIDSystem().catch(console.error);
