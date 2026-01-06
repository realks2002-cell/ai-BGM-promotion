import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { synthesizeAudio, ensureTempDir } from '@/lib/ffmpeg';

// BGM file mapping for preset BGMs
const bgmFiles: Record<string, string> = {
    '1': 'upbeat.mp3',
    '2': 'corporate.mp3',
    '3': 'tech.mp3',
    '4': 'inspiring.mp3',
    '5': 'joyful.mp3',
    '6': 'piano.mp3',
};

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            ttsUrl,
            bgmId,
            bgmVolume,
            customBGMFile,
            introDelay = 0,    // BGM 시작 후 음성 딜레이 (초)
            outroLength = 0,   // 음성 종료 후 BGM 아웃트로 (초)
        } = body;

        // Validation
        if (!ttsUrl || typeof ttsUrl !== 'string') {
            return NextResponse.json(
                { error: 'TTS 오디오 URL이 필요합니다.' },
                { status: 400 }
            );
        }

        // Determine BGM path - custom or preset
        let bgmPath: string;

        if (customBGMFile) {
            // Custom uploaded BGM
            bgmPath = path.join(process.cwd(), 'public', customBGMFile);
        } else if (bgmId && bgmFiles[bgmId]) {
            // Preset BGM
            bgmPath = path.join(process.cwd(), 'public', 'bgm', bgmFiles[bgmId]);
        } else {
            return NextResponse.json(
                { error: '유효한 BGM을 선택해주세요.' },
                { status: 400 }
            );
        }

        const volume = typeof bgmVolume === 'number'
            ? Math.max(0, Math.min(1, bgmVolume))
            : 0.3;

        // Validate timing values (0.5초 단위, 최대 10초)
        const validIntroDelay = Math.max(0, Math.min(10, Math.round(introDelay * 2) / 2));
        const validOutroLength = Math.max(0, Math.min(10, Math.round(outroLength * 2) / 2));

        // Resolve TTS file path
        const ttsPath = path.join(process.cwd(), 'public', ttsUrl);

        // Check if TTS file exists
        if (!fs.existsSync(ttsPath)) {
            return NextResponse.json(
                { error: 'TTS 파일을 찾을 수 없습니다.' },
                { status: 404 }
            );
        }

        // Check if BGM file exists
        if (!fs.existsSync(bgmPath)) {
            console.warn(`BGM file not found: ${bgmPath}. Returning TTS only.`);
            return NextResponse.json({
                synthesizedUrl: ttsUrl,
                message: 'BGM 파일을 찾을 수 없어 음성만 반환합니다.',
            });
        }

        // Generate output path
        const tempDir = ensureTempDir();
        const outputFileName = `synthesized-${uuidv4()}.mp3`;
        const outputPath = path.join(tempDir, outputFileName);

        // Synthesize audio
        await synthesizeAudio({
            ttsPath,
            bgmPath,
            outputPath,
            bgmVolume: volume,
            introDelay: validIntroDelay,
            outroLength: validOutroLength,
        });

        return NextResponse.json({
            synthesizedUrl: `/temp/${outputFileName}`,
            message: '오디오 합성 완료',
        });
    } catch (error) {
        console.error('Synthesize API error:', error);

        // Check if it's an FFmpeg error
        if (error instanceof Error && error.message.includes('FFmpeg')) {
            return NextResponse.json(
                {
                    error: 'FFmpeg가 설치되어 있지 않거나 실행할 수 없습니다. FFmpeg를 설치해주세요.',
                    details: error.message,
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: error instanceof Error ? error.message : '오디오 합성에 실패했습니다.' },
            { status: 500 }
        );
    }
}
