'use client';

interface GenerateButtonProps {
    onClick: () => void;
    isGenerating: boolean;
    progress: number;
    stage: 'idle' | 'tts' | 'synthesizing' | 'done' | 'error';
    disabled?: boolean;
    error?: string;
}

const stageMessages = {
    idle: '',
    tts: 'AI 음성 생성 중...',
    synthesizing: 'BGM과 합성 중...',
    done: '완료!',
    error: '오류 발생',
};

export default function GenerateButton({
    onClick,
    isGenerating,
    progress,
    stage,
    disabled,
}: GenerateButtonProps) {
    return (
        <div className="glass-card p-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
                {/* Generate Button */}
                <button
                    onClick={onClick}
                    disabled={disabled || isGenerating}
                    className={`relative w-full md:w-auto px-8 py-4 rounded-xl font-semibold text-lg transition-all ${isGenerating
                        ? 'bg-gray-700 text-gray-300 cursor-not-allowed'
                        : disabled
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'btn-primary'
                        }`}
                >
                    <span className={isGenerating ? 'opacity-0' : ''}>
                        🎙️ 광고 오디오 생성하기
                    </span>

                    {isGenerating && (
                        <div className="absolute inset-0 flex items-center justify-center gap-2">
                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            <span>{stageMessages[stage]}</span>
                        </div>
                    )}
                </button>

                {/* Progress Bar */}
                {isGenerating && (
                    <div className="flex-1 w-full">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">{stageMessages[stage]}</span>
                            <span className="text-sm font-mono text-primary">{progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary via-secondary to-accent rounded-full transition-all duration-300 loading-glow"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Tips when idle */}
                {!isGenerating && stage === 'idle' && (
                    <div className="flex-1 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>텍스트를 입력하고 음성과 BGM을 설정한 후 생성 버튼을 클릭하세요</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
