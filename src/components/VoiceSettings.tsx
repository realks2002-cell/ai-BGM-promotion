'use client';

import { useState } from 'react';

// TTSEngine 타입 제거 (Supertone 단일)

interface VoiceSettingsProps {
    voice: string;
    // Supertone specific
    speed: number;
    pitch: number;
    onVoiceChange: (voice: string) => void;
    onSpeedChange: (speed: number) => void;
    onPitchChange: (pitch: number) => void;
    playingVoiceId: string | null;
    onPreview: (voiceId: string) => void;
}

// Supertone 한국어 성우 프리셋
export const supertoneVoices = [
    { id: 'e5f6fb1a53d0add87afb4f', name: 'Agatha (여성)', description: '다국어 지원 · 밝고 선명한 톤', icon: '👩', category: '내레이션', recommended: true },
    { id: '91992bbd4758bdcf9c9b01', name: 'Adam (남성)', description: '다국어 지원 · 차분하고 신뢰감 있는 톤', icon: '👨', category: '비즈니스', recommended: true },
    { id: 'ac449f240c2732b7f0b8bb', name: 'Aiko (여성/아이)', description: '다국어 지원 · 귀엽고 활기찬 톤', icon: '👧', category: '캐릭터/게임', recommended: false },
    { id: 'd9411052b13cba9cb4c313', name: 'Allen (남성/중년)', description: '다국어 지원 · 중후하고 깊이 있는 톤', icon: '👴', category: '다큐멘터리', recommended: false },
    { id: '7c56c6a6471a12816604f0', name: 'Ariel (여성)', description: '다국어 지원 · 부드럽고 우아한 톤', icon: '💃', category: '오디오북', recommended: false },
];

// Supertone 감정 태그 가이드
const emotionTags = [
    { tag: '[happy]', description: '밝고 행복한 톤', example: '[happy]오늘 특별 할인![/happy]' },
    { tag: '[excited]', description: '흥분된 톤', example: '[excited]놓치지 마세요![/excited]' },
    { tag: '[calm]', description: '차분한 톤', example: '[calm]편안한 휴식을...[/calm]' },
    { tag: '[serious]', description: '진지한 톤', example: '[serious]중요한 안내[/serious]' },
    { tag: '[warm]', description: '따뜻한 톤', example: '[warm]소중한 당신을 위해[/warm]' },
];

export default function VoiceSettings({
    voice,
    speed,
    pitch,
    onVoiceChange,
    onSpeedChange,
    onPitchChange,
    playingVoiceId,
    onPreview,
}: VoiceSettingsProps) {
    const [showExpertMode, setShowExpertMode] = useState(false);
    const [showEmotionGuide, setShowEmotionGuide] = useState(false);

    const sortedVoices = [...supertoneVoices].sort((a, b) => (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0));

    return (
        <div className="glass-card p-6 hover-lift">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    음성 설정
                </h2>
                <div className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 px-2 py-1 rounded text-xs font-medium">
                    Supertone Engine
                </div>
            </div>

            {/* Supertone Emotion Tags Guide */}
            <div className="mb-4">
                <button
                    onClick={() => setShowEmotionGuide(!showEmotionGuide)}
                    className="w-full p-2 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-400 text-xs flex items-center justify-between hover:bg-gray-800 transition-colors"
                >
                    <span className="flex items-center gap-1">💡 <span className="text-cyan-400">Tip:</span> 감정 태그로 톤 조절하기</span>
                    <svg className={`w-4 h-4 transition-transform ${showEmotionGuide ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                {showEmotionGuide && (
                    <div className="mt-2 p-3 bg-gray-800/50 rounded-lg border border-gray-700 animate-fadeIn">
                        <p className="text-xs text-gray-400 mb-2">
                            스크립트에 태그를 넣어 감정을 표현하세요:
                        </p>
                        <div className="grid grid-cols-1 gap-1.5">
                            {emotionTags.map((et) => (
                                <div key={et.tag} className="flex items-center gap-2 text-xs">
                                    <code className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 rounded font-mono min-w-[70px] text-center">{et.tag}</code>
                                    <span className="text-gray-400">{et.description}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Expert Mode Toggle */}
            <div className="flex justify-end mb-3">
                <button
                    onClick={() => setShowExpertMode(!showExpertMode)}
                    className={`text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${showExpertMode
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {showExpertMode ? '전문가 모드 ON' : '전문가 모드'}
                </button>
            </div>

            {/* Expert Mode Settings (Supertone) */}
            {showExpertMode && (
                <div className="mb-6 p-4 rounded-xl bg-gray-800/50 border border-gray-700 space-y-5 animate-slideDown">
                    {/* Speed Slider */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                목소리 속도 (Speed)
                            </label>
                            <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">{speed.toFixed(1)}x</span>
                        </div>
                        <div className="relative flex items-center gap-3">
                            <span className="text-[10px] text-gray-500 w-8 text-right">0.5x</span>
                            <input
                                type="range"
                                min="0.5"
                                max="2.0"
                                step="0.1"
                                value={speed}
                                onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
                                className="w-full accent-blue-500 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-[10px] text-gray-500 w-8">2.0x</span>
                        </div>
                    </div>

                    {/* Pitch Slider */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                                목소리 톤 (Pitch/Tone)
                            </label>
                            <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">{pitch > 0 ? `+${pitch}` : pitch}</span>
                        </div>
                        <div className="relative flex items-center gap-3">
                            <span className="text-[10px] text-gray-500 w-8 text-right">Low</span>
                            <input
                                type="range"
                                min="-10"
                                max="10"
                                step="1"
                                value={pitch}
                                onChange={(e) => onPitchChange(parseFloat(e.target.value))}
                                className="w-full accent-purple-500 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-[10px] text-gray-500 w-8">High</span>
                        </div>
                    </div>

                    {/* Reset Button */}
                    <div className="flex justify-end pt-1">
                        <button
                            onClick={() => { onSpeedChange(1.0); onPitchChange(0); }}
                            className="text-[10px] text-gray-400 hover:text-white underline decoration-gray-600 hover:decoration-white underline-offset-2 transition-all"
                        >
                            설정 초기화
                        </button>
                    </div>
                </div>
            )}

            {/* Voice Selection */}
            <div>
                <label className="block text-sm text-gray-400 mb-2">
                    성우 선택
                    <span className="text-xs text-pink-400 ml-2">⭐ 추천 성우</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {sortedVoices.map((v) => (
                        <div
                            key={v.id}
                            onClick={() => onVoiceChange(v.id)}
                            className={`p-2.5 rounded-xl border transition-all text-left relative cursor-pointer group ${voice === v.id
                                ? 'bg-primary/20 border-primary text-white shadow-lg shadow-primary/10'
                                : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-700/50'
                                }`}
                        >
                            {v.recommended && (
                                <span className="absolute -top-1.5 -right-1.5 text-[10px] bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-1.5 py-0.5 rounded-full shadow-sm">
                                    추천
                                </span>
                            )}
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-lg filter drop-shadow-md">{v.icon}</span>
                                <span className="font-medium text-sm">{v.name}</span>
                            </div>
                            <div className="text-[10px] text-gray-400 ml-7">{v.description}</div>

                            {/* Preview Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onPreview(v.id);
                                }}
                                className={`absolute right-2 bottom-2 p-1.5 rounded-full z-10 transition-all ${playingVoiceId === v.id
                                    ? 'bg-primary text-white shadow-lg scale-110'
                                    : 'bg-gray-700/80 text-gray-300 hover:bg-primary hover:text-white'
                                    }`}
                                title={playingVoiceId === v.id ? "정지" : "미리듣기"}
                            >
                                {playingVoiceId === v.id ? (
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24">
                                        <rect x="6" y="5" width="4" height="14" fill="currentColor" rx="1" />
                                        <rect x="14" y="5" width="4" height="14" fill="currentColor" rx="1" />
                                    </svg>
                                ) : (
                                    <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div >
    );
}
