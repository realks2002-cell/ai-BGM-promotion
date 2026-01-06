import { NextRequest, NextResponse } from 'next/server';
import {
    generateTTS as generateElevenLabs,
    isElevenLabsConfigured,
    cleanupTempFiles,
    VOICE_PRESETS as ELEVENLABS_VOICES,
    DEFAULT_VOICE_SETTINGS as ELEVENLABS_DEFAULTS,
    VoiceSettings,
} from '@/lib/tts';
import {
    generateSupertone,
    isSupertoneConfigured,
    SUPERTONE_VOICE_PRESETS,
    EMOTION_TAGS,
} from '@/lib/supertone';

export type TTSEngine = 'elevenlabs' | 'supertone';

export async function POST(request: NextRequest) {
    try {
        cleanupTempFiles();

        const body = await request.json();
        const {
            text,
            voiceId,
            settings,
            engine = 'supertone' as TTSEngine,
            // Supertone specific
            style,
            pitch,
            speed,
        } = body;

        // Validation
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return NextResponse.json(
                { error: '텍스트를 입력해주세요.' },
                { status: 400 }
            );
        }

        if (text.length > 5000) {
            return NextResponse.json(
                { error: '텍스트는 5000자를 초과할 수 없습니다.' },
                { status: 400 }
            );
        }

        let audioUrl: string;

        if (engine === 'supertone') {
            // Supertone Play TTS
            const selectedVoiceId = voiceId || SUPERTONE_VOICE_PRESETS[0].id;

            audioUrl = await generateSupertone({
                text: text.trim(),
                voiceId: selectedVoiceId,
                style: style || 'default',
                pitch: pitch ?? 0,
                speed: speed ?? 1.0,
            });

            return NextResponse.json({
                audioUrl,
                engine: 'supertone',
                isDemo: !isSupertoneConfigured(),
                message: isSupertoneConfigured()
                    ? 'Supertone TTS 생성 완료'
                    : 'Supertone API 키가 설정되지 않아 데모 모드로 실행됩니다.',
            });
        } else {
            // ElevenLabs TTS (default)
            const selectedVoiceId = voiceId || ELEVENLABS_VOICES[0].id;

            const voiceSettings: VoiceSettings = {
                stability: settings?.stability ?? ELEVENLABS_DEFAULTS.stability,
                similarityBoost: settings?.similarityBoost ?? ELEVENLABS_DEFAULTS.similarityBoost,
                style: settings?.style ?? ELEVENLABS_DEFAULTS.style,
                useSpeakerBoost: settings?.useSpeakerBoost ?? ELEVENLABS_DEFAULTS.useSpeakerBoost,
            };

            voiceSettings.stability = Math.max(0, Math.min(1, voiceSettings.stability));
            voiceSettings.similarityBoost = Math.max(0, Math.min(1, voiceSettings.similarityBoost));
            voiceSettings.style = Math.max(0, Math.min(1, voiceSettings.style));

            audioUrl = await generateElevenLabs({
                text: text.trim(),
                voiceId: selectedVoiceId,
                settings: voiceSettings,
            });

            return NextResponse.json({
                audioUrl,
                engine: 'elevenlabs',
                isDemo: !isElevenLabsConfigured(),
                message: isElevenLabsConfigured()
                    ? 'ElevenLabs TTS 생성 완료'
                    : 'ElevenLabs API 키가 설정되지 않아 데모 모드로 실행됩니다.',
            });
        }
    } catch (error) {
        console.error('TTS API error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'TTS 생성에 실패했습니다.' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        status: 'ok',
        engines: {
            elevenlabs: {
                configured: isElevenLabsConfigured(),
                voices: ELEVENLABS_VOICES,
                defaultSettings: ELEVENLABS_DEFAULTS,
            },
            supertone: {
                configured: isSupertoneConfigured(),
                voices: SUPERTONE_VOICE_PRESETS,
                emotionTags: EMOTION_TAGS,
            },
        },
    });
}
