'use client';

import { useState, useCallback } from 'react';
import TextInput from '@/components/TextInput';
import VoiceSettings, { supertoneVoices } from '@/components/VoiceSettings';
import BGMSelector from '@/components/BGMSelector';
import AudioPlayer from '@/components/AudioPlayer';
import GenerateButton from '@/components/GenerateButton';

interface GenerationState {
  isGenerating: boolean;
  progress: number;
  stage: 'idle' | 'tts' | 'synthesizing' | 'done' | 'error';
  error?: string;
}

export default function Home() {
  const [text, setText] = useState('');

  // Voice settings (Supertone Only)
  const [voiceId, setVoiceId] = useState(supertoneVoices[0].id); // Supertone Default

  // Expert Mode State
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(0);

  // BGM settings
  const [selectedBGM, setSelectedBGM] = useState<string | null>(null);
  const [bgmVolume, setBgmVolume] = useState(0.3);
  const [customBGMFile, setCustomBGMFile] = useState<string | null>(null);
  const [introDelay, setIntroDelay] = useState(1.0);  // BGM 시작 후 음성 시작까지
  const [outroLength, setOutroLength] = useState(1.5); // 음성 종료 후 BGM 길이

  // Voice Preview
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);

  // Audio output
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [generationState, setGenerationState] = useState<GenerationState>({
    isGenerating: false,
    progress: 0,
    stage: 'idle',
  });

  const handlePreviewVoice = useCallback(async (previewVoiceId: string) => {
    // Stop current preview if playing
    if (previewAudio) {
      previewAudio.pause();
      setPreviewAudio(null);
      setPlayingVoiceId(null);

      // If clicking the same voice, just stop
      if (playingVoiceId === previewVoiceId) {
        return;
      }
    }

    try {
      setPlayingVoiceId(previewVoiceId);

      const previewText = "안녕하세요, 제 목소리입니다.";

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: previewText,
          voiceId: previewVoiceId,
          engine: 'supertone', // Force Supertone
          speed: 1.0, // Preview uses default speed
          pitch: 0,   // Preview uses default pitch
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Preview generation failed');
      }

      const { audioUrl } = await response.json();
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        setPlayingVoiceId(null);
        setPreviewAudio(null);
      };

      audio.play();
      setPreviewAudio(audio);

    } catch (error) {
      console.error('Preview error:', error);
      setPlayingVoiceId(null);
      alert(error instanceof Error ? error.message : '미리듣기 생성에 실패했습니다.');
    }
  }, [previewAudio, playingVoiceId]);

  const handleGenerate = useCallback(async () => {
    if (!text.trim()) {
      setGenerationState({ isGenerating: false, progress: 0, stage: 'error', error: '텍스트를 입력해주세요.' });
      return;
    }

    setGenerationState({ isGenerating: true, progress: 10, stage: 'tts' });

    try {
      // Step 1: Generate TTS
      const ttsResponse = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceId,
          engine: 'supertone', // Force Supertone
          speed,
          pitch,
        }),
      });

      if (!ttsResponse.ok) {
        const error = await ttsResponse.json();
        throw new Error(error.error || 'TTS 생성에 실패했습니다.');
      }

      const { audioUrl: ttsUrl } = await ttsResponse.json();
      setGenerationState({ isGenerating: true, progress: 50, stage: 'synthesizing' });

      // Step 2: Synthesize with BGM (if selected)
      if (selectedBGM) {
        const synthResponse = await fetch('/api/synthesize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ttsUrl, bgmId: selectedBGM, bgmVolume, customBGMFile, introDelay, outroLength }),
        });

        if (!synthResponse.ok) {
          const error = await synthResponse.json();
          throw new Error(error.error || '오디오 합성에 실패했습니다.');
        }

        const { synthesizedUrl } = await synthResponse.json();
        setGeneratedAudio(synthesizedUrl);
      } else {
        setGeneratedAudio(ttsUrl);
      }

      setGenerationState({ isGenerating: false, progress: 100, stage: 'done' });
    } catch (error) {
      setGenerationState({
        isGenerating: false,
        progress: 0,
        stage: 'error',
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      });
    }
  }, [text, voiceId, speed, pitch, selectedBGM, bgmVolume, customBGMFile, introDelay, outroLength]);

  return (
    <div className="min-h-screen p-6 md:p-8">
      {/* Background with Gradient Mesh */}
      <div className="fixed inset-0 bg-[#0f1115] -z-10" />
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-cyan-900/20 pointer-events-none -z-10" />
      <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none -z-10" />

      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">AI Audio Platform</h1>
            <p className="text-sm text-gray-400">Professional Ad Audio Generation</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Text Input & Voice Settings */}
        <div className="lg:col-span-2 space-y-6">
          <TextInput value={text} onChange={setText} />
          <VoiceSettings
            voice={voiceId}
            speed={speed}
            pitch={pitch}
            onVoiceChange={setVoiceId}
            onSpeedChange={setSpeed}
            onPitchChange={setPitch}
            playingVoiceId={playingVoiceId}
            onPreview={handlePreviewVoice}
          />
        </div>

        {/* Right Column - BGM Selector */}
        <div className="space-y-6">
          <BGMSelector
            selectedBGM={selectedBGM}
            bgmVolume={bgmVolume}
            introDelay={introDelay}
            outroLength={outroLength}
            onSelectBGM={setSelectedBGM}
            onVolumeChange={setBgmVolume}
            onIntroDelayChange={setIntroDelay}
            onOutroLengthChange={setOutroLength}
            customBGMFile={customBGMFile}
            onCustomBGMChange={setCustomBGMFile}
          />
        </div>

        {/* Bottom - Generate Button & Audio Player */}
        <div className="lg:col-span-3 space-y-6">
          <GenerateButton
            onClick={handleGenerate}
            isGenerating={generationState.isGenerating}
            progress={generationState.progress}
            stage={generationState.stage}
            error={generationState.error}
          />

          {generatedAudio && (
            <AudioPlayer audioUrl={generatedAudio} />
          )}
        </div>
      </main>
    </div>
  );
}
