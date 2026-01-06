'use client';

import { useState, useRef, useEffect } from 'react';

interface BGMSelectorProps {
    selectedBGM: string | null;
    bgmVolume: number;
    introDelay: number;
    outroLength: number;
    onSelectBGM: (bgmId: string | null) => void;
    onVolumeChange: (volume: number) => void;
    onIntroDelayChange: (delay: number) => void;
    onOutroLengthChange: (length: number) => void;
    customBGMFile?: string | null;
    onCustomBGMChange?: (file: string | null) => void;
}

interface BGM {
    id: string;
    name: string;
    category: string;
    duration: string;
    file: string;
    color: string;
    isCustom?: boolean;
}

const defaultBgmList: BGM[] = [
    { id: '1', name: 'Upbeat Energy', category: '활기찬', duration: '2:30', file: '/bgm/upbeat.mp3', color: '#f472b6' },
    { id: '2', name: 'Calm Corporate', category: '차분한', duration: '3:00', file: '/bgm/corporate.mp3', color: '#22d3ee' },
    { id: '3', name: 'Modern Tech', category: '모던', duration: '2:45', file: '/bgm/tech.mp3', color: '#6366f1' },
    { id: '4', name: 'Inspiring Story', category: '감동적', duration: '3:15', file: '/bgm/inspiring.mp3', color: '#10b981' },
    { id: '5', name: 'Joyful Pop', category: '경쾌한', duration: '2:20', file: '/bgm/joyful.mp3', color: '#fbbf24' },
    { id: '6', name: 'Elegant Piano', category: '우아한', duration: '3:30', file: '/bgm/piano.mp3', color: '#8b5cf6' },
];

export default function BGMSelector({
    selectedBGM,
    bgmVolume,
    introDelay,
    outroLength,
    onSelectBGM,
    onVolumeChange,
    onIntroDelayChange,
    onOutroLengthChange,
    customBGMFile,
    onCustomBGMChange,
}: BGMSelectorProps) {
    const [previewingBGM, setPreviewingBGM] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [customBGMs, setCustomBGMs] = useState<BGM[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, []);

    const handlePreview = (bgm: BGM) => {
        if (previewingBGM === bgm.id) {
            audioRef.current?.pause();
            setPreviewingBGM(null);
        } else {
            if (audioRef.current) {
                audioRef.current.pause();
            }
            audioRef.current = new Audio(bgm.file);
            audioRef.current.volume = bgmVolume;
            audioRef.current.play().catch(() => {
                console.log('BGM preview not available');
            });
            audioRef.current.onended = () => setPreviewingBGM(null);
            setPreviewingBGM(bgm.id);
        }
    };

    const handleSelect = (bgmId: string, file?: string) => {
        if (selectedBGM === bgmId) {
            onSelectBGM(null);
            onCustomBGMChange?.(null);
        } else {
            onSelectBGM(bgmId);
            if (file) {
                onCustomBGMChange?.(file);
            }
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/bgm/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '업로드 실패');
            }

            const newCustomBGM: BGM = {
                id: data.bgm.id,
                name: data.bgm.name,
                category: data.bgm.category,
                duration: data.bgm.duration,
                file: data.bgm.file,
                color: '#ec4899',
                isCustom: true,
            };

            setCustomBGMs((prev) => [newCustomBGM, ...prev]);
            onSelectBGM(newCustomBGM.id);
            onCustomBGMChange?.(newCustomBGM.file);
        } catch (error) {
            setUploadError(error instanceof Error ? error.message : '업로드 실패');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemoveCustomBGM = (bgmId: string) => {
        setCustomBGMs((prev) => prev.filter((bgm) => bgm.id !== bgmId));
        if (selectedBGM === bgmId) {
            onSelectBGM(null);
            onCustomBGMChange?.(null);
        }
    };

    const allBGMs = [...customBGMs, ...defaultBgmList];

    return (
        <div className="glass-card p-6 hover-lift h-full">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                배경 음악 설정
            </h2>

            {/* BGM Volume Control */}
            <div className="mb-3 p-3 bg-gray-900/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-gray-400">🔊 BGM 볼륨</label>
                    <span className="text-sm font-mono text-accent">{Math.round(bgmVolume * 100)}%</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={bgmVolume}
                    onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                    className="w-full"
                />
            </div>

            {/* Timing Controls */}
            {selectedBGM && (
                <div className="mb-4 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                    <div className="text-xs text-purple-400 font-medium mb-3">⏱️ BGM 타이밍 설정</div>

                    {/* Intro Delay */}
                    <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-xs text-gray-400">인트로 (음성 시작 전 BGM)</label>
                            <span className="text-xs font-mono text-cyan-400">{introDelay.toFixed(1)}초</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="5"
                            step="0.5"
                            value={introDelay}
                            onChange={(e) => onIntroDelayChange(parseFloat(e.target.value))}
                            className="w-full"
                        />
                        <div className="flex justify-between text-[10px] text-gray-600 mt-0.5">
                            <span>없음</span>
                            <span>5초</span>
                        </div>
                    </div>

                    {/* Outro Length */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-xs text-gray-400">아웃트로 (음성 종료 후 BGM)</label>
                            <span className="text-xs font-mono text-pink-400">{outroLength.toFixed(1)}초</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="5"
                            step="0.5"
                            value={outroLength}
                            onChange={(e) => onOutroLengthChange(parseFloat(e.target.value))}
                            className="w-full"
                        />
                        <div className="flex justify-between text-[10px] text-gray-600 mt-0.5">
                            <span>없음</span>
                            <span>5초</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom BGM Upload */}
            <div className="mb-3">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".mp3,.wav,.ogg,.m4a,audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className={`w-full p-2.5 rounded-xl border-2 border-dashed transition-all flex items-center justify-center gap-2 text-sm ${isUploading
                            ? 'border-gray-600 text-gray-500 cursor-not-allowed'
                            : 'border-pink-500/50 text-pink-400 hover:border-pink-500 hover:bg-pink-500/10'
                        }`}
                >
                    {isUploading ? (
                        <>
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            <span>업로드 중...</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span>내 BGM 업로드</span>
                        </>
                    )}
                </button>
                {uploadError && <p className="text-xs text-red-400 mt-1">{uploadError}</p>}
            </div>

            {/* No BGM Option */}
            <button
                onClick={() => onSelectBGM(null)}
                className={`w-full p-2.5 mb-2 rounded-xl border transition-all flex items-center gap-3 ${selectedBGM === null
                        ? 'bg-gray-600/30 border-gray-500 text-white'
                        : 'bg-gray-800/30 border-gray-700 text-gray-400 hover:border-gray-500'
                    }`}
            >
                <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                </div>
                <span className="font-medium text-sm">BGM 없음</span>
            </button>

            {/* BGM List */}
            <div className="space-y-1.5 max-h-[240px] overflow-y-auto pr-1">
                {allBGMs.map((bgm) => (
                    <div
                        key={bgm.id}
                        className={`p-2.5 rounded-xl border transition-all ${selectedBGM === bgm.id
                                ? 'bg-primary/20 border-primary'
                                : 'bg-gray-800/30 border-gray-700 hover:border-gray-500'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            {/* Preview Button */}
                            <button
                                onClick={() => handlePreview(bgm)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
                                style={{ backgroundColor: `${bgm.color}20`, color: bgm.color }}
                            >
                                {previewingBGM === bgm.id ? (
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <rect x="6" y="4" width="4" height="16" />
                                        <rect x="14" y="4" width="4" height="16" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                )}
                            </button>

                            {/* BGM Info */}
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-white text-xs truncate flex items-center gap-1">
                                    {bgm.name}
                                    {bgm.isCustom && (
                                        <span className="text-[10px] bg-pink-500/20 text-pink-400 px-1 py-0.5 rounded">업로드</span>
                                    )}
                                </div>
                                <div className="text-[10px] text-gray-500">{bgm.category}</div>
                            </div>

                            {/* Delete Button (for custom BGMs) */}
                            {bgm.isCustom && (
                                <button
                                    onClick={() => handleRemoveCustomBGM(bgm.id)}
                                    className="p-1 rounded text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                    title="삭제"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}

                            {/* Select Button */}
                            <button
                                onClick={() => handleSelect(bgm.id, bgm.file)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${selectedBGM === bgm.id
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                            >
                                {selectedBGM === bgm.id ? '선택됨' : '선택'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
