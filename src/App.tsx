import { useState, useCallback, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { Header, TabNav, ChangelogView, MattersView, AudioPlayer, Toast, LoadingSkeleton, ChatPanel } from './components';
import { useTheme, useChangelog, useAudio } from './hooks';
import { sendChangelogEmail } from './services';

function App() {
  const { theme, toggleTheme, setDefaultTheme, getDefaultTheme } = useTheme();
  const {
    rawChangelog,
    parsedChangelog,
    analysis,
    latestVersion,
    isLoading,
    isAnalyzing,
    error,
    lastFetched,
    sources,
    selectedSourceId,
    selectedSourceName,
    refresh,
    selectSource,
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
    seek,
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
    setIsEmailSending(true);
    try {
      const success = await sendChangelogEmail();

      if (success) {
        setToast({ message: 'Changelog sent to your email with audio!', type: 'success' });
      } else {
        setToast({ message: 'Failed to send email. Please try again.', type: 'error' });
      }
    } catch {
      setToast({ message: 'Failed to send email. Please try again.', type: 'error' });
    } finally {
      setIsEmailSending(false);
    }
  }, []);

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
    <div className="min-h-screen bg-brutal">
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
        defaultTheme={getDefaultTheme()}
        onDefaultThemeChange={setDefaultTheme}
        sources={sources}
        selectedSourceId={selectedSourceId}
        selectedSourceName={selectedSourceName}
        onSelectSource={selectSource}
      />

      <TabNav activeTab={activeTab} onTabChange={setActiveTab} isAnalyzing={isAnalyzing} />

      <main className="pb-24">
        {error ? (
          <div className="max-w-4xl mx-auto p-8">
            <div className="alert-brutal alert-brutal-error">
              <p className="heading-brutal heading-brutal-sm">Error Loading Changelog</p>
              <p className="text-sm mt-2 text-brutal-secondary">{error}</p>
              <button
                onClick={refresh}
                className="btn-brutal-primary mt-4"
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
          onSeek={seek}
          onDownload={handleDownload}
        />
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Floating Chat Button - Neo-brutalist */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-accent-coral border-brutal shadow-brutal flex items-center justify-center transition-all duration-100 hover:shadow-brutal-lg hover:translate-x-[-4px] hover:translate-y-[-4px] active:translate-x-0 active:translate-y-0 active:shadow-brutal-sm z-30"
        aria-label="Open changelog chat"
        title="Ask about changelogs"
      >
        <MessageSquare className="w-6 h-6 text-white" />
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
