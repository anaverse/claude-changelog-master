import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronDown, ChevronRight, Copy, Check, Volume2, Loader2, Square } from 'lucide-react';
import type { ChangelogVersion } from '../types';

interface ChangelogViewProps {
  versions: ChangelogVersion[];
  rawMarkdown: string | null;
  onGenerateAudio: (text: string, label: string) => void;
  generatingAudioFor: string | null;
  playingAudioFor: string | null;
  onStopAudio: () => void;
}

export function ChangelogView({
  versions,
  rawMarkdown,
  onGenerateAudio,
  generatingAudioFor,
  playingAudioFor,
  onStopAudio,
}: ChangelogViewProps) {
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(
    new Set(versions.slice(0, 1).map((v) => v.version))
  );
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const toggleVersion = (version: string) => {
    setExpandedVersions((prev) => {
      const next = new Set(prev);
      if (next.has(version)) {
        next.delete(version);
      } else {
        next.add(version);
      }
      return next;
    });
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'feature':
        return '✨';
      case 'fix':
        return '🔧';
      case 'removal':
        return '⚠️';
      case 'breaking':
        return '🚨';
      default:
        return '•';
    }
  };

  const getVersionText = (version: ChangelogVersion) => {
    const header = `Version ${version.version}${version.date ? `, released ${version.date}` : ''}.`;
    const items = version.items.map((item) => {
      const typeLabel = item.type === 'feature' ? 'New feature' :
        item.type === 'fix' ? 'Bug fix' :
        item.type === 'removal' ? 'Removal' :
        item.type === 'breaking' ? 'Breaking change' : 'Update';
      return `${typeLabel}: ${item.content}`;
    }).join('. ');
    return `${header} Changes include: ${items}`;
  };

  const handleAudioClick = (e: React.MouseEvent, version: ChangelogVersion) => {
    e.stopPropagation();
    const label = `v${version.version}`;

    if (playingAudioFor === label) {
      onStopAudio();
    } else {
      const text = getVersionText(version);
      onGenerateAudio(text, label);
    }
  };

  if (!rawMarkdown && versions.length === 0) {
    return (
      <div className="p-8 text-center text-brutal-secondary font-brutal uppercase tracking-wide">
        No changelog data available
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      {versions.map((version) => {
        const label = `v${version.version}`;
        const isGenerating = generatingAudioFor === label;
        const isPlaying = playingAudioFor === label;

        return (
          <div
            key={version.version}
            className="card-brutal overflow-hidden"
          >
            <div className="flex items-center bg-brutal-secondary/10 border-b-brutal">
              <button
                onClick={() => toggleVersion(version.version)}
                className="flex-1 px-4 py-3 flex items-center justify-between hover:bg-brutal-secondary/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {expandedVersions.has(version.version) ? (
                    <ChevronDown className="w-5 h-5 text-brutal-secondary" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-brutal-secondary" />
                  )}
                  <span className="heading-brutal heading-brutal-sm">
                    v{version.version}
                  </span>
                  {version.date && (
                    <span className="text-sm text-brutal-secondary font-brutal">
                      {version.date}
                    </span>
                  )}
                </div>
                <span className="tag-brutal">
                  {version.items.length} changes
                </span>
              </button>

              <button
                onClick={(e) => handleAudioClick(e, version)}
                disabled={isGenerating}
                className={`p-3 mr-2 transition-colors ${
                  isPlaying
                    ? 'bg-accent-coral text-white'
                    : 'text-brutal-secondary hover:bg-brutal-secondary/20 hover:text-accent-coral'
                } disabled:opacity-50`}
                aria-label={isPlaying ? 'Stop audio' : 'Generate audio for this version'}
                title={isPlaying ? 'Stop' : 'Listen to this release'}
              >
                {isGenerating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isPlaying ? (
                  <Square className="w-5 h-5 fill-current" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
            </div>

            {expandedVersions.has(version.version) && (
              <div className="p-4 space-y-2">
                {version.items.map((item, idx) => {
                  const itemId = `${version.version}-${idx}`;
                  return (
                    <div
                      key={itemId}
                      className="group flex items-start gap-2 p-2 hover:bg-brutal-secondary/10 transition-colors"
                    >
                      <span className="flex-shrink-0 text-lg">{getItemIcon(item.type)}</span>
                      <div className="flex-1 min-w-0 prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {item.content}
                        </ReactMarkdown>
                      </div>
                      <button
                        onClick={() => copyToClipboard(item.content, itemId)}
                        className="flex-shrink-0 p-1 opacity-0 group-hover:opacity-100 text-brutal-secondary hover:text-accent-coral transition-opacity"
                        aria-label="Copy to clipboard"
                      >
                        {copiedItem === itemId ? (
                          <Check className="w-4 h-4 text-accent-green" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
