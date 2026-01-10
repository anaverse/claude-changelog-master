import { Play, Pause, Download, Volume2, Gauge } from 'lucide-react';
import type { VoiceName } from '../types';
import { VOICE_OPTIONS } from '../types';

interface AudioPlayerProps {
  audioUrl: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackSpeed: number;
  selectedVoice: VoiceName;
  playingLabel: string | null;
  onVoiceChange: (voice: VoiceName) => void;
  onSpeedChange: (speed: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onDownload: () => void;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export function AudioPlayer({
  audioUrl,
  isPlaying,
  currentTime,
  duration,
  playbackSpeed,
  selectedVoice,
  playingLabel,
  onVoiceChange,
  onSpeedChange,
  onPlay,
  onPause,
  onSeek,
  onDownload,
}: AudioPlayerProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const seekTime = percentage * duration;
    onSeek(seekTime);
  };

  if (!audioUrl) {
    return (
      <div className="border-t-brutal bg-brutal-elevated p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4">
            <Volume2 className="w-4 h-4 text-brutal-secondary" />
            <select
              value={selectedVoice}
              onChange={(e) => onVoiceChange(e.target.value as VoiceName)}
              className="select-brutal text-sm"
            >
              {VOICE_OPTIONS.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.tone})
                </option>
              ))}
            </select>
            <span className="text-sm text-brutal-secondary font-brutal uppercase tracking-wide">
              Click a speaker icon to generate audio
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t-brutal bg-brutal-elevated p-4 shadow-brutal-lg">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-3">
          {/* Now Playing Label */}
          {playingLabel && (
            <div className="text-center text-sm text-brutal-secondary font-brutal uppercase tracking-wide">
              Now playing: <span className="font-bold text-accent-coral">{playingLabel}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-4">
            {/* Voice Selector */}
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-brutal-secondary" />
              <select
                value={selectedVoice}
                onChange={(e) => onVoiceChange(e.target.value as VoiceName)}
                className="select-brutal text-sm"
              >
                {VOICE_OPTIONS.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.tone})
                  </option>
                ))}
              </select>
            </div>

            {/* Speed Selector */}
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-brutal-secondary" />
              <select
                value={playbackSpeed}
                onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
                className="select-brutal text-sm"
              >
                {SPEED_OPTIONS.map((speed) => (
                  <option key={speed} value={speed}>
                    {speed}x
                  </option>
                ))}
              </select>
            </div>

            {/* Player Controls */}
            <div className="flex items-center gap-3 flex-1 min-w-[200px]">
              <button
                onClick={isPlaying ? onPause : onPlay}
                className="w-12 h-12 bg-accent-coral text-white border-brutal shadow-brutal flex items-center justify-center transition-all duration-100 hover:shadow-brutal-lg hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-0 active:translate-y-0 active:shadow-brutal-sm flex-shrink-0"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>

              <div className="flex-1 flex items-center gap-2">
                <span className="text-xs text-brutal-secondary w-10 flex-shrink-0 font-brutal">{formatTime(currentTime)}</span>
                <div
                  className="flex-1 h-3 bg-brutal-secondary/20 border-brutal-thin overflow-hidden min-w-[60px] cursor-pointer hover:h-4 transition-all"
                  onClick={handleProgressClick}
                  role="slider"
                  aria-label="Seek audio"
                  aria-valuenow={currentTime}
                  aria-valuemin={0}
                  aria-valuemax={duration}
                  tabIndex={0}
                >
                  <div
                    className="h-full bg-accent-coral transition-all duration-100 pointer-events-none"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs text-brutal-secondary w-10 flex-shrink-0 font-brutal">{formatTime(duration)}</span>
              </div>

              <button
                onClick={onDownload}
                className="btn-brutal-ghost p-2.5 flex-shrink-0"
                aria-label="Download audio"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
