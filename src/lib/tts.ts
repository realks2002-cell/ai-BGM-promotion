import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// ElevenLabs API configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

// 반드시 한국어 지원 모델 사용 (v1이나 English 전용 모델은 억양이 영어식으로 변함)
const MODEL_ID = 'eleven_multilingual_v2';

// 한국어 광고에 최적화된 성우 프리셋
export const VOICE_PRESETS = [
    {
        id: 'cgSgspJ2msm6clMCkdW9', // Seohyun (서현) - 실제 ElevenLabs 한국어 성우 ID
        name: '서현 (Seohyun)',
        description: '여성 · 차분하고 지적인 톤',
        language: 'ko',
        category: '광고/내레이션',
        recommended: true,
    },
    {
        id: 'iP95p4xoKVk53GoZ742B', // Minjun (민준) - 실제 ElevenLabs 한국어 성우 ID  
        name: '민준 (Minjun)',
        description: '남성 · 신뢰감 있는 톤',
        language: 'ko',
        category: '기업/금융',
        recommended: true,
    },
    {
        id: 'pNInz6obpgDQGcFmaJgB',
        name: 'Adam',
        description: '남성 · 깊고 안정적',
        language: 'multilingual',
        category: '광고/내레이션',
        recommended: false,
    },
    {
        id: 'EXAVITQu4vr4xnSDxMaL',
        name: 'Sarah',
        description: '여성 · 밝고 친근한',
        language: 'multilingual',
        category: '광고/프로모션',
        recommended: false,
    },
    {
        id: 'onwK4e9ZLuTAKqWW03F9',
        name: 'Daniel',
        description: '남성 · 전문적이고 신뢰감',
        language: 'multilingual',
        category: '기업/금융',
        recommended: false,
    },
];

export interface VoiceSettings {
    stability: number;      // 0.0 to 1.0 - 0.4~0.5가 가장 감정적
    similarityBoost: number; // 0.0 to 1.0 - 0.75로 성우 톤 유지
    style: number;          // 0.0 to 1.0 - 0.45로 한국어 높낮이 드라마틱하게
    useSpeakerBoost: boolean;
}

// 한국어 광고에 최적화된 기본 음성 설정
export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
    stability: 0.45,        // 0.4~0.5 범위 - 감정적이면서 안정적
    similarityBoost: 0.75,  // 성우 고유의 톤 유지
    style: 0.45,            // 한국어 높낮이 드라마틱하게
    useSpeakerBoost: true,
};

export interface TTSOptions {
    text: string;
    voiceId: string;
    settings: VoiceSettings;
}

import os from 'os';

/**
 * Ensure the temp directory exists
 */
export function ensureTempDir(): string {
    const tempDir = os.tmpdir(); // Use system temp dir for Vercel compatibility
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }
    return tempDir;
}

/**
 * Clean up old temp files (older than 1 hour)
 */
export function cleanupTempFiles(): void {
    const tempDir = path.join(process.cwd(), 'public', 'temp');
    if (!fs.existsSync(tempDir)) return;

    const files = fs.readdirSync(tempDir);
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    files.forEach((file) => {
        const filePath = path.join(tempDir, file);
        try {
            const stats = fs.statSync(filePath);
            if (now - stats.mtimeMs > oneHour) {
                fs.unlinkSync(filePath);
            }
        } catch {
            // Ignore errors
        }
    });
}

/**
 * 텍스트 전처리 - 한국어 TTS 품질 향상을 위한 호흡 조절
 * - 마침표 뒤에 공백 추가 (호흡 조절)
 * - 쉼표 뒤에 공백 추가 (자연스러운 끊어읽기)
 * - 느낌표/물음표 뒤에 공백 추가
 */
export function preprocessText(text: string): string {
    let processed = text;

    // 마침표 뒤에 공백이 없거나 1개만 있으면 2개로 늘림 (호흡 조절)
    processed = processed.replace(/\.(\s?)/g, '.  ');

    // 물음표/느낌표 뒤에도 공백 추가
    processed = processed.replace(/\?(\s?)/g, '?  ');
    processed = processed.replace(/!(\s?)/g, '!  ');

    // 쉼표 뒤에 공백이 없으면 추가 (자연스러운 끊어읽기)
    processed = processed.replace(/,(\S)/g, ', $1');

    // 연속된 공백을 2개로 정규화 (너무 많은 공백 방지)
    processed = processed.replace(/\s{3,}/g, '  ');

    // 앞뒤 공백 제거
    processed = processed.trim();

    return processed;
}

/**
 * Generate TTS audio using ElevenLabs API
 * @param options TTSOptions
 * @returns Promise<string> - URL path to the generated audio file
 */
export async function generateTTS(options: TTSOptions): Promise<string> {
    const { text, voiceId, settings } = options;

    // Check if API key is configured
    if (!ELEVENLABS_API_KEY) {
        console.warn('ElevenLabs API key not configured. Using mock mode.');
        return generateMockTTS();
    }

    // 텍스트 전처리 적용
    const processedText = preprocessText(text);
    console.log('Preprocessed text:', processedText);

    const apiUrl = `${ELEVENLABS_API_URL}/${voiceId}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY,
            },
            body: JSON.stringify({
                text: processedText,
                model_id: MODEL_ID, // 반드시 eleven_multilingual_v2 사용
                voice_settings: {
                    stability: settings.stability,
                    similarity_boost: settings.similarityBoost,
                    style: settings.style,
                    use_speaker_boost: settings.useSpeakerBoost,
                },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('ElevenLabs API error:', errorText);
            throw new Error('ElevenLabs API 요청 실패: ' + errorText);
        }

        // Save audio buffer to temp file
        const audioBuffer = await response.arrayBuffer();
        const tempDir = ensureTempDir();
        const fileName = `tts-${uuidv4()}.mp3`;
        const filePath = path.join(tempDir, fileName);

        fs.writeFileSync(filePath, Buffer.from(audioBuffer));

        return `/api/audio?file=${fileName}`;
    } catch (error) {
        console.error('ElevenLabs TTS error:', error);
        throw new Error('TTS 생성에 실패했습니다. API 키와 성우 ID를 확인해주세요.');
    }
}

/**
 * Generate mock TTS audio for demo purposes
 */
async function generateMockTTS(): Promise<string> {
    const tempDir = ensureTempDir();
    const fileName = `tts-mock-${uuidv4()}.mp3`;
    const filePath = path.join(tempDir, fileName);

    // Check if there's a sample TTS file to use
    const samplePath = path.join(process.cwd(), 'public', 'samples', 'sample-tts.mp3');

    if (fs.existsSync(samplePath)) {
        fs.copyFileSync(samplePath, filePath);
    } else {
        fs.writeFileSync(filePath, Buffer.alloc(0));
        console.log('Mock TTS: No sample file found. Created empty placeholder.');
    }

    return `/api/audio?file=${fileName}`;
}

/**
 * Check if ElevenLabs API is configured
 */
export function isElevenLabsConfigured(): boolean {
    return !!ELEVENLABS_API_KEY &&
        ELEVENLABS_API_KEY !== 'your_elevenlabs_api_key_here' &&
        !ELEVENLABS_API_KEY.startsWith('your_');
}
