import { RefreshCw, Sun, Moon, Mail, ChevronDown } from 'lucide-react';
import { SettingsPanel } from './SettingsPanel';
import { SourcesPanel } from './SourcesPanel';
import type { ChangelogSource } from '../types';

function ClaudeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      className={className}
      viewBox="0 0 16 16"
    >
      <path d="m3.127 10.604 3.135-1.76.053-.153-.053-.085H6.11l-.525-.032-1.791-.048-1.554-.065-1.505-.08-.38-.081L0 7.832l.036-.234.32-.214.455.04 1.009.069 1.513.105 1.097.064 1.626.17h.259l.036-.105-.089-.065-.068-.064-1.566-1.062-1.695-1.121-.887-.646-.48-.327-.243-.306-.104-.67.435-.48.585.04.15.04.593.456 1.267.981 1.654 1.218.242.202.097-.068.012-.049-.109-.181-.9-1.626-.96-1.655-.428-.686-.113-.411a2 2 0 0 1-.068-.484l.496-.674L4.446 0l.662.089.279.242.411.94.666 1.48 1.033 2.014.302.597.162.553.06.17h.105v-.097l.085-1.134.157-1.392.154-1.792.052-.504.25-.605.497-.327.387.186.319.456-.045.294-.19 1.23-.37 1.93-.243 1.29h.142l.161-.16.654-.868 1.097-1.372.484-.545.565-.601.363-.287h.686l.505.751-.226.775-.707.895-.585.759-.839 1.13-.524.904.048.072.125-.012 1.897-.403 1.024-.186 1.223-.21.553.258.06.263-.218.536-1.307.323-1.533.307-2.284.54-.028.02.032.04 1.029.098.44.024h1.077l2.005.15.525.346.315.424-.053.323-.807.411-3.631-.863-.872-.218h-.12v.073l.726.71 1.331 1.202 1.667 1.55.084.383-.214.302-.226-.032-1.464-1.101-.565-.497-1.28-1.077h-.084v.113l.295.432 1.557 2.34.08.718-.112.234-.404.141-.444-.08-.911-1.28-.94-1.44-.759-1.291-.093.053-.448 4.821-.21.246-.484.186-.403-.307-.214-.496.214-.98.258-1.28.21-1.016.19-1.263.112-.42-.008-.028-.092.012-.953 1.307-1.448 1.957-1.146 1.227-.274.109-.477-.247.045-.44.266-.39 1.586-2.018.956-1.25.617-.723-.004-.105h-.036l-4.212 2.736-.75.096-.324-.302.04-.496.154-.162 1.267-.871z" />
    </svg>
  );
}

interface HeaderProps {
  version: string;
  lastFetched: number | null;
  isLoading: boolean;
  onRefresh: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onSendEmail: () => void;
  isEmailSending: boolean;
  refreshInterval: number;
  onRefreshIntervalChange: (interval: number) => void;
  defaultTheme: 'light' | 'dark';
  onDefaultThemeChange: (theme: 'light' | 'dark') => void;
  sources?: ChangelogSource[];
  selectedSourceId: string | null;
  selectedSourceName: string;
  onSelectSource?: (sourceId: string | null) => void;
}

export function Header({
  version,
  lastFetched,
  isLoading,
  onRefresh,
  theme,
  onToggleTheme,
  onSendEmail,
  isEmailSending,
  refreshInterval,
  onRefreshIntervalChange,
  defaultTheme,
  onDefaultThemeChange,
  sources = [],
  selectedSourceId,
  selectedSourceName,
  onSelectSource,
}: HeaderProps) {
  const formatLastFetched = (timestamp: number | null) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const activeSources = sources.filter(s => s.is_active);

  return (
    <header className="border-b-brutal bg-brutal-elevated sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="w-10 h-10 bg-accent-coral border-brutal flex items-center justify-center shadow-brutal-sm">
              <ClaudeIcon className="w-6 h-6 text-white" />
            </div>

            <div className="flex items-center gap-3">
              <h1 className="heading-brutal heading-brutal-md">
                {selectedSourceName}
              </h1>
              {activeSources.length > 1 && onSelectSource && (
                <div className="relative group">
                  <button
                    className="p-2 border-brutal-thin hover:bg-brutal-secondary transition-colors"
                    aria-label="Switch changelog source"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <div className="absolute left-0 top-full mt-2 w-72 bg-brutal-elevated border-brutal shadow-brutal opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-100 z-50">
                    <div className="py-1">
                      {activeSources.map((source) => (
                        <button
                          key={source.id}
                          onClick={() => onSelectSource(source.id)}
                          className={`w-full px-4 py-3 text-left text-sm flex items-center justify-between border-b-brutal-thin last:border-b-0 transition-colors font-brutal uppercase tracking-wide ${
                            source.id === selectedSourceId
                              ? 'bg-accent-coral text-white'
                              : 'hover:bg-brutal-secondary'
                          }`}
                        >
                          <span className="truncate font-bold">{source.name}</span>
                          {source.last_version && (
                            <span className="tag-brutal text-xs ml-2">
                              v{source.last_version}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <span className="tag-brutal-coral">
              v{version}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {lastFetched && (
              <span className="text-sm text-brutal-secondary font-brutal hidden sm:block mr-2">
                {formatLastFetched(lastFetched)}
              </span>
            )}

            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="btn-brutal-ghost p-2.5 disabled:opacity-50"
              aria-label="Refresh changelog"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onToggleTheme}
              className="btn-brutal-ghost p-2.5"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title={theme === 'light' ? 'Dark mode' : 'Light mode'}
            >
              <div className="relative w-5 h-5">
                <Sun
                  className={`w-5 h-5 absolute inset-0 transition-all duration-100 ${
                    theme === 'dark'
                      ? 'rotate-0 scale-100 opacity-100'
                      : 'rotate-90 scale-0 opacity-0'
                  }`}
                />
                <Moon
                  className={`w-5 h-5 absolute inset-0 transition-all duration-100 ${
                    theme === 'light'
                      ? 'rotate-0 scale-100 opacity-100'
                      : '-rotate-90 scale-0 opacity-0'
                  }`}
                />
              </div>
            </button>

            <button
              onClick={onSendEmail}
              disabled={isEmailSending}
              className="btn-brutal-ghost p-2.5 disabled:opacity-50"
              aria-label="Send changelog to email"
              title="Send to email"
            >
              <Mail className={`w-5 h-5 ${isEmailSending ? 'animate-pulse' : ''}`} />
            </button>

            <SourcesPanel />

            <SettingsPanel
              refreshInterval={refreshInterval}
              onRefreshIntervalChange={onRefreshIntervalChange}
              defaultTheme={defaultTheme}
              onDefaultThemeChange={onDefaultThemeChange}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
