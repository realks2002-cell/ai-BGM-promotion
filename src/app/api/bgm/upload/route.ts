import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// 허용되는 오디오 파일 형식
const ALLOWED_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json(
                { error: '파일을 선택해주세요.' },
                { status: 400 }
            );
        }

        // 파일 타입 검증
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: '지원되지 않는 파일 형식입니다. MP3, WAV, OGG, M4A 파일만 업로드 가능합니다.' },
                { status: 400 }
            );
        }

        // 파일 크기 검증
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: '파일 크기가 너무 큽니다. 최대 50MB까지 업로드 가능합니다.' },
                { status: 400 }
            );
        }

        // 업로드 디렉토리 확인/생성
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'bgm');
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        // 고유 파일명 생성
        const fileExtension = path.extname(file.name) || '.mp3';
        const fileName = `custom-bgm-${uuidv4()}${fileExtension}`;
        const filePath = path.join(uploadDir, fileName);

        // 파일 저장
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // 원본 파일명 저장 (표시용)
        const originalName = file.name.replace(/\.[^/.]+$/, ''); // 확장자 제거

        return NextResponse.json({
            success: true,
            bgm: {
                id: `custom-${uuidv4()}`,
                name: originalName,
                category: '사용자 업로드',
                duration: '알 수 없음',
                file: `/uploads/bgm/${fileName}`,
                isCustom: true,
            },
            message: 'BGM 파일이 업로드되었습니다.',
        });
    } catch (error) {
        console.error('BGM upload error:', error);
        return NextResponse.json(
            { error: '파일 업로드에 실패했습니다.' },
            { status: 500 }
        );
    }
}
