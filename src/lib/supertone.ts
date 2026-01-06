import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Supertone Play API configuration
const SUPERTONE_API_KEY = process.env.SUPERTONE_API_KEY;
const SUPERTONE_API_BASE_URL = 'https://supertoneapi.com';

// Supertone 한국어 광고 최적화 모델 (사용자 요청: sona_speech_1)
export const SUPERTONE_MODEL = 'sona_speech_1';

// 한국어 광고에 최적화된 Supertone 보이스 프리셋 (API Voice ID와 매핑)
// 권한 오류(403) 해결을 위해 모델명(sona_speech_1)을 Voice ID로 사용 시도
// 실제 조회된 Voice ID로 업데이트 (한국어 지원)
export const SUPERTONE_VOICE_PRESETS = [
    {
        id: 'e5f6fb1a53d0add87afb4f', // Agatha
        name: 'Agatha (여성)',
        description: '다국어 지원 · 밝고 선명한 톤',
        style: 'neutral',
        language: 'ko',
        category: '내레이션',
        recommended: true,
    },
    {
        id: '91992bbd4758bdcf9c9b01', // Adam
        name: 'Adam (남성)',
        description: '다국어 지원 · 차분하고 신뢰감 있는 톤',
        style: 'neutral',
        language: 'ko',
        category: '비즈니스',
        recommended: true,
    },
    {
        id: 'ac449f240c2732b7f0b8bb', // Aiko
        name: 'Aiko (여성/아이)',
        description: '다국어 지원 · 귀엽고 활기찬 톤',
        style: 'happy',
        language: 'ko',
        category: '캐릭터/게임',
        recommended: false,
    },
    {
        id: 'd9411052b13cba9cb4c313', // Allen
        name: 'Allen (남성/중년)',
        description: '다국어 지원 · 중후하고 깊이 있는 톤',
        style: 'neutral',
        language: 'ko',
        category: '다큐멘터리',
        recommended: false,
    },
    {
        id: '7c56c6a6471a12816604f0', // Ariel
        name: 'Ariel (여성)',
        description: '다국어 지원 · 부드럽고 우아한 톤',
        style: 'neutral',
        language: 'ko',
        category: '오디오북',
        recommended: false,
    },
];

// Supertone 감정 태그 목록 (스크립트 에디터용)
export const EMOTION_TAGS = [
    { tag: '[happy]', description: '밝고 행복한 톤', example: '[happy]오늘 특별한 할인![/happy]' },
    { tag: '[excited]', description: '흥분된 톤', example: '[excited]놓치지 마세요![/excited]' },
    { tag: '[calm]', description: '차분한 톤', example: '[calm]편안한 휴식을...[/calm]' },
    { tag: '[serious]', description: '진지한 톤', example: '[serious]중요한 안내입니다[/serious]' },
    { tag: '[warm]', description: '따뜻한 톤', example: '[warm]소중한 당신을 위해[/warm]' },
    { tag: '[confident]', description: '자신감 있는 톤', example: '[confident]최고의 품질[/confident]' },
];

export interface SupertoneTTSOptions {
    text: string;
    voiceId: string;
    style?: string;
    pitch?: number;     // -100 to 100
    speed?: number;     // 0.5 to 2.0
}

/**
 * Ensure the temp directory exists
 */
export function ensureTempDir(): string {
    const tempDir = path.join(process.cwd(), 'public', 'temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }
    return tempDir;
}

/**
 * Generate TTS audio using Supertone Play API
 * @param options SupertoneTTSOptions
 * @returns Promise<string> - URL path to the generated audio file
 */
export async function generateSupertone(options: SupertoneTTSOptions): Promise<string> {
    const { text, voiceId, style, pitch, speed } = options;

    // Check if API key is configured
    if (!SUPERTONE_API_KEY) {
        console.warn('Supertone API key not configured. Using mock mode.');
        return generateMockTTS();
    }

    try {
        // Endpoint: POST /v1/text-to-speech/{voice_id}
        // 사용자가 제공한 Endpoint 형식에 맞춤
        const url = `${SUPERTONE_API_BASE_URL}/v1/text-to-speech/${voiceId}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-sup-api-key': SUPERTONE_API_KEY,
            },
            body: JSON.stringify({
                text: text.slice(0, 1000), // 길이 제한 (임의 설정)
                language: 'ko',
                model: SUPERTONE_MODEL,
                speed: speed || 1.0,
                pitch: pitch || 0,
                // Supertone Play API (sona_speech) 스펙에 따라 추가 파라미터가 필요하다면 여기에 추가
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Supertone API error:', errorText);
            throw new Error(`Supertone API 요청 실패 (${response.status}): ` + errorText);
        }

        // Save audio buffer to temp file
        const audioBuffer = await response.arrayBuffer();
        const tempDir = ensureTempDir();
        const fileName = `tts-supertone-${uuidv4()}.mp3`;
        const filePath = path.join(tempDir, fileName);

        fs.writeFileSync(filePath, Buffer.from(audioBuffer));

        return `/temp/${fileName}`;
    } catch (error) {
        console.error('Supertone TTS error:', error);
        // 에러를 그대로 전파하여 상위에서 처리하도록 함 (mock으로 떨어지지 않게)
        throw error;
    }
}

/**
 * Generate mock TTS audio for demo purposes
 */
async function generateMockTTS(): Promise<string> {
    const tempDir = ensureTempDir();
    const fileName = `tts-mock-${uuidv4()}.mp3`;
    const filePath = path.join(tempDir, fileName);

    const samplePath = path.join(process.cwd(), 'public', 'samples', 'sample-tts.mp3');

    if (fs.existsSync(samplePath)) {
        fs.copyFileSync(samplePath, filePath);
    } else {
        // Create 1 second of silence if no sample exists
        // Or just an empty file, but better to warn
        fs.writeFileSync(filePath, Buffer.alloc(0));
        console.log('Mock TTS: No sample file found. Created empty placeholder.');
    }

    return `/temp/${fileName}`;
}

/**
 * Check if Supertone API is configured
 */
export function isSupertoneConfigured(): boolean {
    return !!SUPERTONE_API_KEY;
}
