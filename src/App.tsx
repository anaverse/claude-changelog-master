import { useState, useCallback, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { Header, TabNav, ChangelogView, MattersView, AudioPlayer, Toast, LoadingSkeleton, ChatPanel } from './components';
import { useTheme, useChangelog, useAudio } from './hooks';
import { sendChangelogEmail } from './services';

function App() {
  const { theme, toggleTheme } = useTheme();
  const {
    rawChangelog,
    parsedChangelog,
    analysis,
    latestVersion,
    isLoading,
    isAnalyzing,
    error,
    lastFetched,
    refresh,
  } = useChangelog();

  const {
    audioUrl,
    generatingFor,
    playingFor,
    isPlaying,
    currentTime,
    duration,
    playbackSpeed,
    selectedVoice,
    setSelectedVoice,
    setPlaybackSpeed,
    generateAndPlay,
    play,
    pause,
    stop,
    download,
  } = useAudio();

  const [activeTab, setActiveTab] = useState<'changelog' | 'matters'>('changelog');
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(() => {
    const saved = localStorage.getItem('refreshInterval');
    return saved ? parseInt(saved) : 0;
  });

  // Auto-refresh effect
  useEffect(() => {
    if (refreshInterval === 0) return;

    const intervalId = setInterval(() => {
      refresh();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [refreshInterval, refresh]);

  const handleRefreshIntervalChange = useCallback((interval: number) => {
    setRefreshInterval(interval);
    localStorage.setItem('refreshInterval', interval.toString());
  }, []);

  const handleSendEmail = useCallback(async () => {
    if (!analysis) {
      setToast({ message: 'Analysis not available yet', type: 'error' });
      return;
    }

    setIsEmailSending(true);
    try {
      const success = await sendChangelogEmail({
        version: latestVersion,
        tldr: analysis.tldr,
        analysis,
      });

      if (success) {
        setToast({ message: 'Changelog sent to your email!', type: 'success' });
      } else {
        setToast({ message: 'Failed to send email. Please try again.', type: 'error' });
      }
    } catch {
      setToast({ message: 'Failed to send email. Please try again.', type: 'error' });
    } finally {
      setIsEmailSending(false);
    }
  }, [analysis, latestVersion]);

  const handleGenerateAudio = useCallback(
    async (text: string, label: string) => {
      await generateAndPlay(text, label);
    },
    [generateAndPlay]
  );

  const handleDownload = useCallback(() => {
    download(`claude-code-${latestVersion}-${playingFor || 'audio'}.wav`);
  }, [download, latestVersion, playingFor]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header
        version={latestVersion}
        lastFetched={lastFetched}
        isLoading={isLoading}
        onRefresh={refresh}
        theme={theme}
        onToggleTheme={toggleTheme}
        onSendEmail={handleSendEmail}
        isEmailSending={isEmailSending}
        refreshInterval={refreshInterval}
        onRefreshIntervalChange={handleRefreshIntervalChange}
      />

      <TabNav activeTab={activeTab} onTabChange={setActiveTab} isAnalyzing={isAnalyzing} />

      <main className="pb-24">
        {error ? (
          <div className="max-w-4xl mx-auto p-8">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
              <p className="font-medium">Error loading changelog</p>
              <p className="text-sm mt-1">{error}</p>
              <button
                onClick={refresh}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : isLoading ? (
          <LoadingSkeleton />
        ) : activeTab === 'changelog' ? (
          <ChangelogView
            versions={parsedChangelog}
            rawMarkdown={rawChangelog}
            onGenerateAudio={handleGenerateAudio}
            generatingAudioFor={generatingFor}
            playingAudioFor={playingFor}
            onStopAudio={stop}
          />
        ) : (
          <MattersView
            analysis={analysis}
            isAnalyzing={isAnalyzing}
            onGenerateAudio={handleGenerateAudio}
            generatingAudioFor={generatingFor}
            playingAudioFor={playingFor}
            onStopAudio={stop}
          />
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0">
        <AudioPlayer
          audioUrl={audioUrl}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          playbackSpeed={playbackSpeed}
          selectedVoice={selectedVoice}
          playingLabel={playingFor}
          onVoiceChange={setSelectedVoice}
          onSpeedChange={setPlaybackSpeed}
          onPlay={play}
          onPause={pause}
          onDownload={handleDownload}
        />
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Floating Chat Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 z-30"
        aria-label="Open changelog chat"
        title="Ask about changelogs"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Panel */}
      <ChatPanel
        versions={parsedChangelog}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
}

export default App;
