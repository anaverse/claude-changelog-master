interface TabNavProps {
  activeTab: 'changelog' | 'matters';
  onTabChange: (tab: 'changelog' | 'matters') => void;
  isAnalyzing: boolean;
}

export function TabNav({ activeTab, onTabChange, isAnalyzing }: TabNavProps) {
  return (
    <nav className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex gap-1">
          <button
            onClick={() => onTabChange('changelog')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'changelog'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            aria-selected={activeTab === 'changelog'}
            role="tab"
          >
            Changelog
          </button>
          <button
            onClick={() => onTabChange('matters')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'matters'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            aria-selected={activeTab === 'matters'}
            role="tab"
          >
            What Matters
            {isAnalyzing && (
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
