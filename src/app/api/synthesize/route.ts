import { NextRequest, NextResponse } from 'next/server';
import { synthesizeAudio } from '@/lib/ffmpeg';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { ttsUrl, bgmId, bgmVolume, customBGMFile, introDelay, outroLength } = body;

        // Validation
        if (!ttsUrl) {
            return NextResponse.json({ error: 'TTS URL is required' }, { status: 400 });
        }

        // 1. Resolve TTS Path
        let ttsPath: string;
        const tempDir = os.tmpdir();

        // Handle both local static path (/temp/) and API serving route (/api/audio?file=)
        if (ttsUrl.startsWith('/temp/') || ttsUrl.includes('/api/audio')) {
            let filename: string;

            if (ttsUrl.includes('/api/audio')) {
                // Extract filename from query param
                // Dummy base url to parse relative url
                const url = new URL(ttsUrl, 'http://localhost');
                filename = url.searchParams.get('file') || '';
            } else {
                // Legacy /temp/ path
                filename = path.basename(ttsUrl);
            }

            if (!filename) {
                return NextResponse.json({ error: 'Invalid TTS URL format' }, { status: 400 });
            }

            ttsPath = path.join(tempDir, filename);
        } else {
            // Treat as direct path or external URL (not supported in this logic yet)
            ttsPath = ttsUrl;
        }

        // Check if TTS file exists
        if (!fs.existsSync(ttsPath)) {
            // If not in temp, try public (legacy fallback)
            const publicPath = path.join(process.cwd(), 'public', ttsUrl);
            if (fs.existsSync(publicPath)) {
                ttsPath = publicPath;
            } else {
                return NextResponse.json({ error: 'TTS file not found' }, { status: 404 });
            }
        }

        // 2. Resolve BGM Path
        let bgmPath: string;
        if (customBGMFile) {
            // Custom BGM in temp
            const bgmFilename = path.basename(customBGMFile);
            bgmPath = path.join(tempDir, bgmFilename);
        } else {
            // Preset BGM in public/bgm
            let bgmFilename = 'upbeat-corporate.mp3'; // Default
            if (bgmId === '2') bgmFilename = 'inspiring.mp3';
            // Map other IDs if needed, keeping it simple for now

            bgmPath = path.join(process.cwd(), 'public', 'bgm', bgmFilename);
        }

        if (!fs.existsSync(bgmPath)) {
            console.warn(`BGM file not found: ${bgmPath}`);
            return NextResponse.json({ error: 'BGM file not found' }, { status: 404 });
        }

        // 3. Synthesize
        const outputFilename = `final-ad-${uuidv4()}.mp3`;
        const outputPath = path.join(tempDir, outputFilename);

        await synthesizeAudio({
            ttsPath,
            bgmPath,
            outputPath,
            bgmVolume: bgmVolume || 0.3,
            introDelay: introDelay || 0,
            outroLength: outroLength || 0,
        });

        // 4. Upload to Supabase Storage
        const fileContent = fs.readFileSync(outputPath);

        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('audio-ads')
            .upload(outputFilename, fileContent, {
                contentType: 'audio/mpeg',
                upsert: true
            });

        if (uploadError) {
            throw new Error(`Supabase Upload Failed: ${uploadError.message}`);
        }

        // 5. Get Public URL
        const { data: { publicUrl } } = supabase
            .storage
            .from('audio-ads')
            .getPublicUrl(outputFilename);

        // 6. Persistence (DB Insert)
        const { error: dbError } = await supabase
            .from('ads')
            .insert({
                audio_url: publicUrl,
                script_text: 'Generated Audio',
                user_id: 'anonymous',
            });

        if (dbError) {
            console.error('DB Insert Error:', dbError);
        }

        // 7. Cleanup
        try {
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        } catch (e) { console.error(e); }

        return NextResponse.json({
            synthesizedUrl: publicUrl,
            message: 'Successfully synthesized and uploaded to Supabase'
        });

    } catch (error) {
        console.error('Synthesis error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Audio synthesis failed' },
            { status: 500 }
        );
    }
}
