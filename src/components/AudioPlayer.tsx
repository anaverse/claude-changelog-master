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
  onDownload,
}: AudioPlayerProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!audioUrl) {
    return (
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4">
            <Volume2 className="w-4 h-4 text-gray-400" />
            <select
              value={selectedVoice}
              onChange={(e) => onVoiceChange(e.target.value as VoiceName)}
              className="text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              {VOICE_OPTIONS.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.tone})
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Click a speaker icon to generate audio
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-3">
          {/* Now Playing Label */}
          {playingLabel && (
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              Now playing: <span className="font-medium text-amber-600 dark:text-amber-400">{playingLabel}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-4">
            {/* Voice Selector */}
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-gray-500" />
              <select
                value={selectedVoice}
                onChange={(e) => onVoiceChange(e.target.value as VoiceName)}
                className="text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
              <Gauge className="w-4 h-4 text-gray-500" />
              <select
                value={playbackSpeed}
                onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
                className="text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
                className="p-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors flex-shrink-0"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <div className="flex-1 flex items-center gap-2">
                <span className="text-xs text-gray-500 w-10 flex-shrink-0">{formatTime(currentTime)}</span>
                <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden min-w-[60px]">
                  <div
                    className="h-full bg-amber-500 transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-10 flex-shrink-0">{formatTime(duration)}</span>
              </div>

              <button
                onClick={onDownload}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
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
