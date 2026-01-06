# AI Audio Ad Studio

AI 오디오 광고 제작 플랫폼 - 텍스트를 입력하면 AI 음성과 BGM을 합성하여 광고 오디오를 생성합니다.

![Dashboard Preview](https://via.placeholder.com/800x400?text=AI+Audio+Ad+Studio)

## 🚀 기능

- **AI 음성 생성**: OpenAI TTS API를 사용하여 고품질 음성 생성
- **다양한 음성 타입**: Alloy, Echo, Fable, Onyx, Nova, Shimmer 등 6가지 음성
- **음성 속도 조절**: 0.5x ~ 2.0x 속도 조절
- **BGM 선택 & 합성**: 6종의 샘플 BGM과 음성 합성
- **실시간 미리듣기**: 생성된 오디오 즉시 재생
- **다운로드**: MP3 형식으로 다운로드

## 📋 요구사항

- Node.js 18+
- OpenAI API Key (선택사항 - 없으면 데모 모드)
- FFmpeg (오디오 합성 기능 사용 시 필요)

## 🛠 설치

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
cp .env.example .env.local
# .env.local 파일을 열어 OPENAI_API_KEY 입력

# 3. FFmpeg 설치 (Windows)
# 방법 1: Chocolatey 사용
choco install ffmpeg

# 방법 2: 수동 설치
# https://ffmpeg.org/download.html 에서 다운로드
# PATH 환경변수에 추가

# 4. 개발 서버 실행
npm run dev
```

## 🎵 BGM 파일 추가

`public/bgm/` 폴더에 다음 이름으로 MP3 파일을 추가하세요:
- `upbeat.mp3` - 활기찬 음악
- `corporate.mp3` - 차분한 기업 음악
- `tech.mp3` - 모던 테크 음악
- `inspiring.mp3` - 감동적인 음악
- `joyful.mp3` - 경쾌한 팝
- `piano.mp3` - 우아한 피아노

> 💡 무료 BGM은 [Uppbeat](https://uppbeat.io), [Pixabay](https://pixabay.com/music/) 등에서 다운로드할 수 있습니다.

## 🔧 기술 스택

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Node.js, Next.js API Routes
- **TTS**: OpenAI TTS API
- **Audio Processing**: FFmpeg, fluent-ffmpeg
- **Styling**: Tailwind CSS (Glassmorphism, Gradient)

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx              # 메인 대시보드
│   ├── layout.tsx            # 레이아웃
│   ├── globals.css           # 글로벌 스타일
│   └── api/
│       ├── tts/route.ts      # TTS 생성 API
│       ├── synthesize/route.ts # 오디오 합성 API
│       └── bgm/route.ts      # BGM 목록 API
├── components/
│   ├── TextInput.tsx         # 텍스트 입력
│   ├── VoiceSettings.tsx     # 음성 설정
│   ├── BGMSelector.tsx       # BGM 선택
│   ├── AudioPlayer.tsx       # 오디오 플레이어
│   └── GenerateButton.tsx    # 생성 버튼
└── lib/
    ├── ffmpeg.ts             # FFmpeg 유틸리티
    └── tts.ts                # TTS 클라이언트
```

## 📝 API 엔드포인트

### POST /api/tts
텍스트를 음성으로 변환
```json
{
  "text": "광고 문구",
  "voice": "alloy",
  "speed": 1.0
}
```

### POST /api/synthesize
TTS와 BGM 합성
```json
{
  "ttsUrl": "/temp/tts-xxx.mp3",
  "bgmId": "1",
  "bgmVolume": 0.3
}
```

### GET /api/bgm
BGM 목록 조회

## 📄 라이선스

MIT License

---

Made with ❤️ by AI Audio Ad Studio
