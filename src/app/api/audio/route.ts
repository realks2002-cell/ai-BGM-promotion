import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const filename = searchParams.get('file');

    if (!filename) {
        return new NextResponse('Filename required', { status: 400 });
    }

    // Security: Prevent directory traversal
    const cleanFilename = path.basename(filename);

    // Use consistent temp directory logic (force /tmp on Vercel)
    let tempDir = os.tmpdir();
    if (process.env.VERCEL || process.env.AWS_REGION || process.env.NODE_ENV === 'production') {
        tempDir = '/tmp';
    }

    const filePath = path.join(tempDir, cleanFilename);

    if (!fs.existsSync(filePath)) {
        return new NextResponse('File not found', { status: 404 });
    }

    try {
        const fileBuffer = fs.readFileSync(filePath);

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Cache-Control': 'no-store, max-age=0',
            },
        });
    } catch (error) {
        console.error('Error reading audio file:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
