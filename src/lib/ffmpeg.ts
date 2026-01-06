import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';

// Use ffmpeg-static for portable binary
const ffmpegStatic = require('ffmpeg-static');

const FFMPEG_PATH = ffmpegStatic || 'ffmpeg';
const FFPROBE_PATH = 'ffprobe';

export interface SynthesizeOptions {
    ttsPath: string;
    bgmPath: string;
    outputPath: string;
    bgmVolume: number;      // 0.0 to 1.0
    introDelay?: number;    // BGM 시작 후 음성 시작까지 딜레이 (초)
    outroLength?: number;   // 음성 종료 후 BGM 아웃트로 길이 (초)
}

/**
 * Check if FFmpeg is available on the system
 */
export async function isFFmpegAvailable(): Promise<boolean> {
    return new Promise((resolve) => {
        const ffmpeg = spawn(FFMPEG_PATH, ['-version']);

        ffmpeg.on('close', (code) => {
            resolve(code === 0);
        });

        ffmpeg.on('error', () => {
            resolve(false);
        });
    });
}

/**
 * Get the duration of an audio file in seconds
 */
export async function getAudioDuration(filePath: string): Promise<number> {
    return new Promise((resolve) => {
        const args = [
            '-i', filePath,
            '-show_entries', 'format=duration',
            '-v', 'quiet',
            '-of', 'csv=p=0',
        ];

        const ffprobe: ChildProcess = spawn(FFPROBE_PATH, args);

        let output = '';

        ffprobe.stdout?.on('data', (data: Buffer) => {
            output += data.toString();
        });

        ffprobe.on('close', (code: number | null) => {
            if (code === 0) {
                const duration = parseFloat(output.trim());
                resolve(isNaN(duration) ? 0 : duration);
            } else {
                resolve(0);
            }
        });

        ffprobe.on('error', () => {
            resolve(0);
        });
    });
}

/**
 * Synthesize TTS audio with BGM using FFmpeg
 * - introDelay: BGM이 먼저 시작되고, 지정된 시간 후에 음성이 시작
 * - outroLength: 음성이 끝난 후 BGM이 추가로 재생되는 시간
 */
export async function synthesizeAudio(options: SynthesizeOptions): Promise<string> {
    const {
        ttsPath,
        bgmPath,
        outputPath,
        bgmVolume,
        introDelay = 0,
        outroLength = 0,
    } = options;

    // Check if FFmpeg is available
    const ffmpegAvailable = await isFFmpegAvailable();
    if (!ffmpegAvailable) {
        throw new Error('FFmpeg가 설치되어 있지 않습니다. choco install ffmpeg 명령으로 설치해주세요.');
    }

    // Get TTS duration to calculate total output length
    const ttsDuration = await getAudioDuration(ttsPath);
    const totalDuration = introDelay + ttsDuration + outroLength;

    return new Promise((resolve, reject) => {
        // FFmpeg filter explanation:
        // 1. BGM: loop indefinitely, adjust volume, trim to total duration
        // 2. TTS: add silence at beginning (introDelay), then the voice
        // 3. Mix both together

        let filterComplex: string;

        if (introDelay > 0 || outroLength > 0) {
            // Complex filter with intro delay and/or outro
            // [0:a] = TTS, [1:a] = BGM
            // Add silence before TTS for intro delay
            // Trim BGM to total duration
            filterComplex = [
                // BGM: loop, volume adjust, trim to total duration
                `[1:a]aloop=loop=-1:size=2e+09,volume=${bgmVolume},atrim=duration=${totalDuration}[bgm]`,
                // TTS: add silence at the beginning for intro delay
                introDelay > 0
                    ? `[0:a]adelay=${Math.round(introDelay * 1000)}|${Math.round(introDelay * 1000)}[voice]`
                    : `[0:a]acopy[voice]`,
                // Mix both: BGM as base, voice on top
                `[bgm][voice]amix=inputs=2:duration=first:dropout_transition=2,atrim=duration=${totalDuration}[out]`
            ].join(';');
        } else {
            // Simple filter: just mix with voice duration
            filterComplex = `[1:a]aloop=loop=-1:size=2e+09,volume=${bgmVolume}[bgm];[0:a][bgm]amix=inputs=2:duration=first:dropout_transition=2[out]`;
        }

        const args = [
            '-y', // Overwrite output file
            '-i', ttsPath,
            '-i', bgmPath,
            '-filter_complex', filterComplex,
            '-map', '[out]',
            '-c:a', 'libmp3lame',
            '-q:a', '2',
            outputPath,
        ];

        console.log('FFmpeg args:', args.join(' '));

        const ffmpeg: ChildProcess = spawn(FFMPEG_PATH, args);

        let stderr = '';

        ffmpeg.stderr?.on('data', (data: Buffer) => {
            stderr += data.toString();
        });

        ffmpeg.on('close', (code: number | null) => {
            if (code === 0) {
                resolve(outputPath);
            } else {
                reject(new Error(`FFmpeg process exited with code ${code}: ${stderr}`));
            }
        });

        ffmpeg.on('error', (error: Error) => {
            reject(new Error(`FFmpeg error: ${error.message}. FFmpeg가 설치되어 있는지 확인해주세요.`));
        });
    });
}

import os from 'os';

/**
 * Ensure the temp directory exists
 */
export function ensureTempDir(): string {
    const tempDir = os.tmpdir();
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }
    return tempDir;
}

/**
 * Clean up old temp files (older than 1 hour)
 */
export function cleanupTempFiles(): void {
    const tempDir = os.tmpdir();
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
