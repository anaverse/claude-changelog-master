import { RefreshCw, Sun, Moon, Mail } from 'lucide-react';
import { SettingsPanel } from './SettingsPanel';

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
}: HeaderProps) {
  const formatLastFetched = (timestamp: number | null) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Claude Code Changelog
            </h1>
            <span className="px-3 py-1 text-sm font-medium bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded-full">
              v{version}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {lastFetched && (
              <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                Updated: {formatLastFetched(lastFetched)}
              </span>
            )}

            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
              aria-label="Refresh changelog"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onToggleTheme}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title={theme === 'light' ? 'Dark mode' : 'Light mode'}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            <button
              onClick={onSendEmail}
              disabled={isEmailSending}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
              aria-label="Send changelog to email"
              title="Send to email"
            >
              <Mail className={`w-5 h-5 ${isEmailSending ? 'animate-pulse' : ''}`} />
            </button>

            <SettingsPanel
              refreshInterval={refreshInterval}
              onRefreshIntervalChange={onRefreshIntervalChange}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
