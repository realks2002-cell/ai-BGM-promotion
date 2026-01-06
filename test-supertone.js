const https = require('https');

const API_KEY = 'bf21af130f37c3ec7ef7eb93c20cb4a2';
const HOST = 'supertoneapi.com';

const endpoints = [
    '/v1/voices',
    '/v1/voice/list',
    '/v1/models',
    '/v1/tts/voices'
];

function testEndpoint(path) {
    const options = {
        hostname: HOST,
        path: path,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-sup-api-key': API_KEY
        }
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            console.log(`[${path}] Status: ${res.statusCode}`);
            if (res.statusCode === 200) {
                console.log(`[${path}] Data:`, data.substring(0, 500)); // 처음 500자만 출력
            } else {
                // 에러 메시지 간략 출력
                console.log(`[${path}] Error:`, data);
            }
        });
    });

    req.on('error', (e) => {
        console.error(`[${path}] Request Error: ${e.message}`);
    });

    req.end();
}

console.log('Testing Supertone API endpoints...');
endpoints.forEach(testEndpoint);
