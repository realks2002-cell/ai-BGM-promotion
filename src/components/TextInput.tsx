'use client';

interface TextInputProps {
    value: string;
    onChange: (value: string) => void;
}

const templates = [
    { id: 'sale', label: '🎉 할인 이벤트', text: '지금 바로 방문하시면 최대 50% 할인 혜택을 드립니다! 이 기회를 놓치지 마세요.' },
    { id: 'newproduct', label: '✨ 신제품 출시', text: '새로운 제품이 출시되었습니다. 지금 바로 만나보세요!' },
    { id: 'brand', label: '🏢 브랜드 소개', text: '최고의 품질, 최상의 서비스. 저희와 함께하세요.' },
];

export default function TextInput({ value, onChange }: TextInputProps) {
    const maxLength = 500;
    const charCount = value.length;

    const handleTemplateClick = (template: typeof templates[0]) => {
        onChange(template.text);
    };

    return (
        <div className="glass-card p-6 hover-lift">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    광고 문구 입력
                </h2>
                <span className={`text-sm ${charCount > maxLength * 0.9 ? 'text-red-400' : 'text-gray-400'}`}>
                    {charCount} / {maxLength}
                </span>
            </div>

            {/* Template Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
                {templates.map((template) => (
                    <button
                        key={template.id}
                        onClick={() => handleTemplateClick(template)}
                        className="px-3 py-1.5 text-sm rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors border border-gray-700 hover:border-primary"
                    >
                        {template.label}
                    </button>
                ))}
            </div>

            {/* Text Area */}
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
                placeholder="광고에 사용할 텍스트를 입력하세요...&#10;&#10;예: 지금 바로 방문하시면 특별 할인 혜택을 드립니다!"
                className="w-full h-40 p-4 bg-gray-900/50 rounded-xl border border-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-white placeholder-gray-500 resize-none transition-all"
            />

            {/* Tips */}
            <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm text-gray-300">
                    <span className="text-primary font-medium">💡 TIP:</span> 간결하고 명확한 문구가 더 효과적인 광고 음성을 만듭니다.
                </p>
            </div>
        </div>
    );
}
