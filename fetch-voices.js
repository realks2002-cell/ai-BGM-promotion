const https = require('https');
const fs = require('fs');

const API_KEY = 'bf21af130f37c3ec7ef7eb93c20cb4a2';
const HOST = 'supertoneapi.com';
const PATH = '/v1/voices';

const options = {
    hostname: HOST,
    path: PATH,
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'x-sup-api-key': API_KEY
    }
};

console.log(`Requesting https://${HOST}${PATH}...`);

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        console.log('Response Headers:', res.headers);

        try {
            // 파일로 저장 (디버깅용)
            fs.writeFileSync('voices.json', data);
            console.log('Response saved to voices.json');

            if (res.statusCode === 200) {
                const json = JSON.parse(data);
                if (Array.isArray(json)) {
                    console.log(`Found ${json.length} voices.`);
                    json.forEach(v => {
                        console.log(`- [${v.voice_id}] ${v.name} (${v.language || 'N/A'})`);
                    });
                } else if (json.voices && Array.isArray(json.voices)) {
                    console.log(`Found ${json.voices.length} voices.`);
                    json.voices.forEach(v => {
                        console.log(`- [${v.voice_id}] ${v.name}`);
                    });
                } else {
                    console.log('Unexpected JSON structure:', JSON.stringify(json, null, 2));
                }
            } else {
                console.log('Error Body:', data);
            }
        } catch (e) {
            console.error('Error parsing JSON:', e);
            console.log('Raw Data:', data);
        }
    });
});

req.on('error', (e) => {
    console.error(`Request Error: ${e.message}`);
});

req.end();
