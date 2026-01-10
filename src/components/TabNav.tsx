interface TabNavProps {
  activeTab: 'changelog' | 'matters';
  onTabChange: (tab: 'changelog' | 'matters') => void;
  isAnalyzing: boolean;
}

export function TabNav({ activeTab, onTabChange, isAnalyzing }: TabNavProps) {
  return (
    <nav className="border-b-brutal bg-brutal-elevated">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex gap-0">
          <button
            onClick={() => onTabChange('changelog')}
            className={`tab-brutal ${
              activeTab === 'changelog'
                ? 'tab-brutal-active !bg-accent-coral text-white !border-b-accent-coral'
                : ''
            }`}
            aria-selected={activeTab === 'changelog'}
            role="tab"
          >
            Changelog
          </button>
          <button
            onClick={() => onTabChange('matters')}
            className={`tab-brutal flex items-center gap-2 ${
              activeTab === 'matters'
                ? 'tab-brutal-active !bg-accent-coral text-white !border-b-accent-coral'
                : ''
            }`}
            aria-selected={activeTab === 'matters'}
            role="tab"
          >
            What Matters
            {isAnalyzing && (
              <span className="w-3 h-3 bg-accent-red border-2 border-black animate-pulse" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
