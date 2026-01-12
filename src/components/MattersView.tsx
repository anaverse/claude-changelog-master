import { useState, useEffect, useCallback } from 'react';
import type { GeminiAnalysis } from '../types';
import { AlertTriangle, AlertCircle, Sparkles, Wrench, Terminal, Code, Slash, Volume2, Loader2, Square, History, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AnalysisHistoryItem {
  version: string;
  created_at: string;
}

interface MattersViewProps {
  analysis: GeminiAnalysis | null;
  isAnalyzing: boolean;
  onGenerateAudio: (text: string, label: string) => void;
  generatingAudioFor: string | null;
  playingAudioFor: string | null;
  onStopAudio: () => void;
}

export function MattersView({
  analysis,
  isAnalyzing,
  onGenerateAudio,
  generatingAudioFor,
  playingAudioFor,
  onStopAudio,
}: MattersViewProps) {
  const [historyItems, setHistoryItems] = useState<AnalysisHistoryItem[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [historicalAnalysis, setHistoricalAnalysis] = useState<GeminiAnalysis | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await fetch('/api/analysis');
      if (res.ok) {
        const data = await res.json();
        setHistoryItems(data);
      }
    } catch (error) {
      console.error('Failed to load analysis history:', error);
    }
  };

  const loadHistoricalAnalysis = useCallback(async (version: string) => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`/api/analysis/${encodeURIComponent(version)}`);
      if (res.ok) {
        const data = await res.json();
        setHistoricalAnalysis(data.analysis);
        setSelectedVersion(version);
      }
    } catch (error) {
      console.error('Failed to load historical analysis:', error);
    } finally {
      setIsLoadingHistory(false);
      setShowHistoryDropdown(false);
    }
  }, []);

  const showCurrentAnalysis = () => {
    setSelectedVersion(null);
    setHistoricalAnalysis(null);
    setShowHistoryDropdown(false);
  };

  // Determine which analysis to display
  const displayAnalysis = selectedVersion ? historicalAnalysis : analysis;
  const isViewingHistory = selectedVersion !== null;

  if (isAnalyzing && !isViewingHistory) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-24 bg-brutal-secondary/20 border-brutal" />
          <div className="h-40 bg-brutal-secondary/20 border-brutal" />
          <div className="h-32 bg-brutal-secondary/20 border-brutal" />
        </div>
        <p className="text-center text-brutal-secondary mt-6 font-brutal uppercase tracking-wide">
          Analyzing changelog with AI...
        </p>
      </div>
    );
  }

  if (!displayAnalysis) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <p className="text-brutal-secondary font-brutal uppercase tracking-wide">
          Analysis not available. Please check your Gemini API key configuration.
        </p>
      </div>
    );
  }

  const getFullAnalysisText = () => {
    let text = `Here's what matters in the latest Claude Code release. ${displayAnalysis.tldr}. `;

    if (displayAnalysis.categories.critical_breaking_changes.length > 0) {
      text += `Critical breaking changes: ${displayAnalysis.categories.critical_breaking_changes.join('. ')}. `;
    }

    if (displayAnalysis.categories.major_features.length > 0) {
      text += `Major new features: ${displayAnalysis.categories.major_features.join('. ')}. `;
    }

    if (displayAnalysis.categories.important_fixes.length > 0) {
      text += `Important fixes: ${displayAnalysis.categories.important_fixes.join('. ')}. `;
    }

    if (displayAnalysis.action_items.length > 0) {
      text += `Action items for you: ${displayAnalysis.action_items.join('. ')}`;
    }

    return text;
  };

  const handleAudioClick = (text: string, label: string) => {
    if (playingAudioFor === label) {
      onStopAudio();
    } else {
      onGenerateAudio(text, label);
    }
  };

  const AudioButton = ({ text, label }: { text: string; label: string }) => {
    const isGenerating = generatingAudioFor === label;
    const isPlaying = playingAudioFor === label;

    return (
      <button
        onClick={() => handleAudioClick(text, label)}
        disabled={isGenerating}
        className={`p-2 transition-colors ${
          isPlaying
            ? 'bg-accent-coral text-white'
            : 'text-brutal-secondary hover:bg-brutal-secondary/20 hover:text-accent-coral'
        } disabled:opacity-50`}
        title={isPlaying ? 'Stop' : 'Listen'}
      >
        {isGenerating ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isPlaying ? (
          <Square className="w-5 h-5 fill-current" />
        ) : (
          <Volume2 className="w-5 h-5" />
        )}
      </button>
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* History Selector */}
      {historyItems.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="relative">
            <button
              onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-brutal-elevated border-brutal-thin text-brutal hover:bg-brutal-secondary/10 transition-colors font-brutal uppercase tracking-wide text-sm"
            >
              <History className="w-4 h-4" />
              <span className="font-bold">
                {isViewingHistory ? selectedVersion : 'Current Analysis'}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showHistoryDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showHistoryDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowHistoryDropdown(false)}
                />
                <div className="absolute left-0 top-full mt-2 w-80 bg-brutal-elevated border-brutal shadow-brutal z-50 overflow-hidden max-h-64 overflow-y-auto">
                  <button
                    onClick={showCurrentAnalysis}
                    className={`w-full px-4 py-3 text-left text-sm flex items-center justify-between transition-colors font-brutal uppercase tracking-wide border-b-brutal-thin ${
                      !isViewingHistory
                        ? 'bg-accent-coral text-white'
                        : 'hover:bg-brutal-secondary/10 text-brutal'
                    }`}
                  >
                    <span className="font-bold">Current Analysis</span>
                    <span className="tag-brutal text-xs">Latest</span>
                  </button>
                  {historyItems.map((item) => (
                    <button
                      key={item.version}
                      onClick={() => loadHistoricalAnalysis(item.version)}
                      disabled={isLoadingHistory}
                      className={`w-full px-4 py-3 text-left text-sm flex items-center justify-between transition-colors border-b-brutal-thin last:border-b-0 font-brutal ${
                        selectedVersion === item.version
                          ? 'bg-accent-coral text-white'
                          : 'hover:bg-brutal-secondary/10 text-brutal'
                      } disabled:opacity-50`}
                    >
                      <span className="font-bold truncate">{item.version}</span>
                      <span className="text-xs text-brutal-secondary ml-2 flex-shrink-0">
                        {formatDate(item.created_at)}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {isViewingHistory && (
            <button
              onClick={showCurrentAnalysis}
              className="text-sm text-accent-coral hover:underline font-brutal uppercase tracking-wide"
            >
              Back to current
            </button>
          )}
        </div>
      )}

      {isLoadingHistory && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-accent-coral" />
        </div>
      )}

      {!isLoadingHistory && (
        <>
          {/* Viewing History Banner */}
          {isViewingHistory && (
            <div className="p-3 bg-accent-coral/20 border-brutal flex items-center gap-2">
              <History className="w-4 h-4 text-accent-coral" />
              <span className="text-sm font-brutal uppercase tracking-wide text-brutal">
                Viewing archived analysis: <strong>{selectedVersion}</strong>
              </span>
            </div>
          )}

          {/* TLDR Section */}
          <div className="p-6 bg-accent-coral/10 border-brutal border-l-4 border-l-accent-coral">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="heading-brutal heading-brutal-md text-accent-coral">TL;DR</h2>
              <AudioButton text={displayAnalysis.tldr} label="tldr" />
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none text-brutal prose-strong:text-accent-coral prose-ul:my-2 prose-li:my-0.5">
              <ReactMarkdown>{displayAnalysis.tldr}</ReactMarkdown>
            </div>
          </div>

          {/* Full Summary Audio Button */}
          <div className="flex justify-center">
            <button
              onClick={() => handleAudioClick(getFullAnalysisText(), 'full-analysis')}
              disabled={generatingAudioFor === 'full-analysis'}
              className={`flex items-center gap-2 px-6 py-3 border-brutal shadow-brutal transition-all duration-100 hover:shadow-brutal-lg hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-0 active:translate-y-0 active:shadow-brutal-sm font-brutal uppercase tracking-wide ${
                playingAudioFor === 'full-analysis'
                  ? 'bg-accent-coral text-white'
                  : 'bg-brutal-elevated text-brutal hover:bg-accent-coral/10'
              } disabled:opacity-50`}
            >
              {generatingAudioFor === 'full-analysis' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : playingAudioFor === 'full-analysis' ? (
                <Square className="w-5 h-5 fill-current" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
              {playingAudioFor === 'full-analysis' ? 'Stop' : 'Listen to Full Summary'}
            </button>
          </div>

          {/* Critical Breaking Changes */}
          {displayAnalysis.categories.critical_breaking_changes.length > 0 && (
            <Section
              title="Critical Breaking Changes"
              icon={<AlertTriangle className="w-5 h-5" />}
              items={displayAnalysis.categories.critical_breaking_changes}
              color="red"
              onAudio={(text) => handleAudioClick(text, 'breaking')}
              isGenerating={generatingAudioFor === 'breaking'}
              isPlaying={playingAudioFor === 'breaking'}
            />
          )}

          {/* Removals */}
          {displayAnalysis.categories.removals.length > 0 && (
            <div className="p-4 border-brutal border-l-4 border-l-accent-red bg-accent-red/10">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-accent-red" />
                <h3 className="heading-brutal heading-brutal-sm text-accent-red">Removals</h3>
              </div>
              <ul className="space-y-2">
                {displayAnalysis.categories.removals.map((removal, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span
                      className={`tag-brutal text-xs uppercase ${
                        removal.severity === 'critical'
                          ? 'bg-accent-red text-white'
                          : removal.severity === 'high'
                          ? 'bg-accent-coral text-white'
                          : 'bg-brutal-secondary/20 text-brutal'
                      }`}
                    >
                      {removal.severity}
                    </span>
                    <div>
                      <span className="font-bold text-brutal">{removal.feature}</span>
                      <span className="text-brutal-secondary"> — {removal.why}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Major Features */}
          {displayAnalysis.categories.major_features.length > 0 && (
            <Section
              title="Major Features"
              icon={<Sparkles className="w-5 h-5" />}
              items={displayAnalysis.categories.major_features}
              color="teal"
              onAudio={(text) => handleAudioClick(text, 'features')}
              isGenerating={generatingAudioFor === 'features'}
              isPlaying={playingAudioFor === 'features'}
            />
          )}

          {/* Important Fixes */}
          {displayAnalysis.categories.important_fixes.length > 0 && (
            <Section
              title="Important Fixes"
              icon={<Wrench className="w-5 h-5" />}
              items={displayAnalysis.categories.important_fixes}
              color="gray"
              onAudio={(text) => handleAudioClick(text, 'fixes')}
              isGenerating={generatingAudioFor === 'fixes'}
              isPlaying={playingAudioFor === 'fixes'}
            />
          )}

          {/* New Slash Commands */}
          {displayAnalysis.categories.new_slash_commands.length > 0 && (
            <Section
              title="New Slash Commands"
              icon={<Slash className="w-5 h-5" />}
              items={displayAnalysis.categories.new_slash_commands}
              color="purple"
              onAudio={(text) => handleAudioClick(text, 'commands')}
              isGenerating={generatingAudioFor === 'commands'}
              isPlaying={playingAudioFor === 'commands'}
            />
          )}

          {/* Terminal Improvements */}
          {displayAnalysis.categories.terminal_improvements.length > 0 && (
            <Section
              title="Terminal Improvements"
              icon={<Terminal className="w-5 h-5" />}
              items={displayAnalysis.categories.terminal_improvements}
              color="blue"
              onAudio={(text) => handleAudioClick(text, 'terminal')}
              isGenerating={generatingAudioFor === 'terminal'}
              isPlaying={playingAudioFor === 'terminal'}
            />
          )}

          {/* API Changes */}
          {displayAnalysis.categories.api_changes.length > 0 && (
            <Section
              title="API Changes"
              icon={<Code className="w-5 h-5" />}
              items={displayAnalysis.categories.api_changes}
              color="indigo"
              onAudio={(text) => handleAudioClick(text, 'api')}
              isGenerating={generatingAudioFor === 'api'}
              isPlaying={playingAudioFor === 'api'}
            />
          )}

          {/* Action Items */}
          {displayAnalysis.action_items.length > 0 && (
            <div className="p-4 bg-accent-yellow/20 border-brutal border-l-4 border-l-accent-yellow">
              <h3 className="heading-brutal heading-brutal-sm mb-3">Action Items</h3>
              <ul className="space-y-2">
                {displayAnalysis.action_items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-brutal">
                    <span className="text-accent-coral font-bold mt-0.5">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  items: string[];
  color: 'red' | 'orange' | 'teal' | 'gray' | 'purple' | 'blue' | 'indigo';
  onAudio?: (text: string) => void;
  isGenerating?: boolean;
  isPlaying?: boolean;
}

function Section({ title, icon, items, color, onAudio, isGenerating, isPlaying }: SectionProps) {
  const colorClasses = {
    red: 'border-l-accent-red bg-accent-red/10',
    orange: 'border-l-accent-coral bg-accent-coral/10',
    teal: 'border-l-accent-green bg-accent-green/10',
    gray: 'border-l-brutal-secondary bg-brutal-secondary/10',
    purple: 'border-l-accent-purple bg-accent-purple/10',
    blue: 'border-l-accent-coral bg-accent-coral/10',
    indigo: 'border-l-accent-purple bg-accent-purple/10',
  };

  const iconColorClasses = {
    red: 'text-accent-red',
    orange: 'text-accent-coral',
    teal: 'text-accent-green',
    gray: 'text-brutal-secondary',
    purple: 'text-accent-purple',
    blue: 'text-accent-coral',
    indigo: 'text-accent-purple',
  };

  const classes = colorClasses[color];
  const iconColor = iconColorClasses[color];

  const sectionText = `${title}: ${items.join('. ')}`;

  return (
    <div className={`p-4 border-brutal border-l-4 ${classes}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={iconColor}>{icon}</span>
          <h3 className="heading-brutal heading-brutal-sm text-brutal">{title}</h3>
        </div>
        {onAudio && (
          <button
            onClick={() => onAudio(sectionText)}
            disabled={isGenerating}
            className={`p-1.5 transition-colors ${
              isPlaying
                ? 'bg-accent-coral text-white'
                : 'text-brutal-secondary hover:bg-brutal-secondary/20 hover:text-accent-coral'
            } disabled:opacity-50`}
            title={isPlaying ? 'Stop' : 'Listen'}
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isPlaying ? (
              <Square className="w-4 h-4 fill-current" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
      <ul className="space-y-1">
        {items.map((item, idx) => (
          <li key={idx} className="matters-list-item flex items-start gap-2">
            <span className="text-brutal-secondary">•</span>
            <span className="matters-list-item">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
