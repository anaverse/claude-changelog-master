import type { GeminiAnalysis } from '../types';
import { AlertTriangle, AlertCircle, Sparkles, Wrench, Terminal, Code, Slash, Volume2, Loader2, Square } from 'lucide-react';

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
  if (isAnalyzing) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
        <p className="text-center text-gray-500 dark:text-gray-400 mt-6">
          Analyzing changelog with AI...
        </p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          Analysis not available. Please check your Gemini API key configuration.
        </p>
      </div>
    );
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getFullAnalysisText = () => {
    let text = `Here's what matters in the latest Claude Code release. ${analysis.tldr}. `;

    if (analysis.categories.critical_breaking_changes.length > 0) {
      text += `Critical breaking changes: ${analysis.categories.critical_breaking_changes.join('. ')}. `;
    }

    if (analysis.categories.major_features.length > 0) {
      text += `Major new features: ${analysis.categories.major_features.join('. ')}. `;
    }

    if (analysis.categories.important_fixes.length > 0) {
      text += `Important fixes: ${analysis.categories.important_fixes.join('. ')}. `;
    }

    if (analysis.action_items.length > 0) {
      text += `Action items for you: ${analysis.action_items.join('. ')}`;
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
        className={`p-2 rounded-lg transition-colors ${
          isPlaying
            ? 'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400'
            : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-amber-600'
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

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* TLDR Section */}
      <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-100">TL;DR</h2>
            <AudioButton text={analysis.tldr} label="tldr" />
          </div>
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getSentimentColor(analysis.sentiment)}`}>
            {analysis.sentiment}
          </span>
        </div>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{analysis.tldr}</p>
      </div>

      {/* Full Summary Audio Button */}
      <div className="flex justify-center">
        <button
          onClick={() => handleAudioClick(getFullAnalysisText(), 'full-analysis')}
          disabled={generatingAudioFor === 'full-analysis'}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            playingAudioFor === 'full-analysis'
              ? 'bg-amber-500 text-white'
              : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-800'
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
      {analysis.categories.critical_breaking_changes.length > 0 && (
        <Section
          title="Critical Breaking Changes"
          icon={<AlertTriangle className="w-5 h-5" />}
          items={analysis.categories.critical_breaking_changes}
          color="red"
          onAudio={(text) => handleAudioClick(text, 'breaking')}
          isGenerating={generatingAudioFor === 'breaking'}
          isPlaying={playingAudioFor === 'breaking'}
        />
      )}

      {/* Removals */}
      {analysis.categories.removals.length > 0 && (
        <div className="p-4 border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/20 rounded-r-lg">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <h3 className="font-semibold text-orange-900 dark:text-orange-100">Removals</h3>
          </div>
          <ul className="space-y-2">
            {analysis.categories.removals.map((removal, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span
                  className={`px-2 py-0.5 text-xs rounded ${
                    removal.severity === 'critical'
                      ? 'bg-red-200 text-red-800'
                      : removal.severity === 'high'
                      ? 'bg-orange-200 text-orange-800'
                      : 'bg-yellow-200 text-yellow-800'
                  }`}
                >
                  {removal.severity}
                </span>
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">{removal.feature}</span>
                  <span className="text-gray-600 dark:text-gray-400"> — {removal.why}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Major Features */}
      {analysis.categories.major_features.length > 0 && (
        <Section
          title="Major Features"
          icon={<Sparkles className="w-5 h-5" />}
          items={analysis.categories.major_features}
          color="teal"
          onAudio={(text) => handleAudioClick(text, 'features')}
          isGenerating={generatingAudioFor === 'features'}
          isPlaying={playingAudioFor === 'features'}
        />
      )}

      {/* Important Fixes */}
      {analysis.categories.important_fixes.length > 0 && (
        <Section
          title="Important Fixes"
          icon={<Wrench className="w-5 h-5" />}
          items={analysis.categories.important_fixes}
          color="gray"
          onAudio={(text) => handleAudioClick(text, 'fixes')}
          isGenerating={generatingAudioFor === 'fixes'}
          isPlaying={playingAudioFor === 'fixes'}
        />
      )}

      {/* New Slash Commands */}
      {analysis.categories.new_slash_commands.length > 0 && (
        <Section
          title="New Slash Commands"
          icon={<Slash className="w-5 h-5" />}
          items={analysis.categories.new_slash_commands}
          color="purple"
          onAudio={(text) => handleAudioClick(text, 'commands')}
          isGenerating={generatingAudioFor === 'commands'}
          isPlaying={playingAudioFor === 'commands'}
        />
      )}

      {/* Terminal Improvements */}
      {analysis.categories.terminal_improvements.length > 0 && (
        <Section
          title="Terminal Improvements"
          icon={<Terminal className="w-5 h-5" />}
          items={analysis.categories.terminal_improvements}
          color="blue"
          onAudio={(text) => handleAudioClick(text, 'terminal')}
          isGenerating={generatingAudioFor === 'terminal'}
          isPlaying={playingAudioFor === 'terminal'}
        />
      )}

      {/* API Changes */}
      {analysis.categories.api_changes.length > 0 && (
        <Section
          title="API Changes"
          icon={<Code className="w-5 h-5" />}
          items={analysis.categories.api_changes}
          color="indigo"
          onAudio={(text) => handleAudioClick(text, 'api')}
          isGenerating={generatingAudioFor === 'api'}
          isPlaying={playingAudioFor === 'api'}
        />
      )}

      {/* Action Items */}
      {analysis.action_items.length > 0 && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Action Items</h3>
          <ul className="space-y-2">
            {analysis.action_items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-gray-700 dark:text-gray-300">{item}</span>
              </li>
            ))}
          </ul>
        </div>
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
    red: 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    orange: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    teal: 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400',
    gray: 'border-gray-400 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
    purple: 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    blue: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    indigo: 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
  };

  const classes = colorClasses[color];
  const [borderColor, bgColor, textColor] = classes.split(' ');

  const sectionText = `${title}: ${items.join('. ')}`;

  return (
    <div className={`p-4 border-l-4 ${borderColor} ${bgColor} rounded-r-lg`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={textColor}>{icon}</span>
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        {onAudio && (
          <button
            onClick={() => onAudio(sectionText)}
            disabled={isGenerating}
            className={`p-1.5 rounded-lg transition-colors ${
              isPlaying
                ? 'bg-amber-100 dark:bg-amber-900 text-amber-600'
                : 'text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700 hover:text-amber-600'
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
          <li key={idx} className="text-gray-700 dark:text-gray-300 flex items-start gap-2">
            <span className="text-gray-400">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
