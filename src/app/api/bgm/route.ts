import { NextResponse } from 'next/server';

interface BGM {
    id: string;
    name: string;
    category: string;
    duration: string;
    file: string;
}

// BGM 목록 - public/bgm 폴더의 파일들과 매핑
const bgmList: BGM[] = [
    { id: '1', name: 'Upbeat Energy', category: '활기찬', duration: '2:30', file: '/bgm/upbeat.mp3' },
    { id: '2', name: 'Calm Corporate', category: '차분한', duration: '3:00', file: '/bgm/corporate.mp3' },
    { id: '3', name: 'Modern Tech', category: '모던', duration: '2:45', file: '/bgm/tech.mp3' },
    { id: '4', name: 'Inspiring Story', category: '감동적', duration: '3:15', file: '/bgm/inspiring.mp3' },
    { id: '5', name: 'Joyful Pop', category: '경쾌한', duration: '2:20', file: '/bgm/joyful.mp3' },
    { id: '6', name: 'Elegant Piano', category: '우아한', duration: '3:30', file: '/bgm/piano.mp3' },
];

export async function GET() {
    return NextResponse.json({
        bgmList,
        count: bgmList.length,
    });
}
