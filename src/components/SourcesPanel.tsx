import { useState, useEffect, useCallback } from 'react';
import { Link, X, Plus, Trash2, Check, ExternalLink, Loader2, AlertCircle, CheckCircle, Edit3, Power, TestTube } from 'lucide-react';

interface ChangelogSource {
  id: string;
  name: string;
  url: string;
  is_active: boolean;
  last_version: string | null;
  last_checked_at: string | null;
}

interface TestResult {
  valid: boolean;
  latestVersion?: string;
  preview?: string;
  message?: string;
}

export function SourcesPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [sources, setSources] = useState<ChangelogSource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Test URL state
  const [testingUrl, setTestingUrl] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editUrl, setEditUrl] = useState('');

  const loadSources = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/sources');
      if (!res.ok) throw new Error('Failed to load sources');
      const data = await res.json();
      setSources(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sources');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      loadSources();
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, loadSources]);

  const testUrl = async (url: string) => {
    setTestingUrl(url);
    setTestResult(null);
    try {
      const res = await fetch('/api/sources/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch {
      setTestResult({ valid: false, message: 'Failed to test URL' });
    } finally {
      setTestingUrl(null);
    }
  };

  const handleAddSource = async () => {
    if (!newName.trim() || !newUrl.trim()) {
      setAddError('Name and URL are required');
      return;
    }

    setIsAdding(true);
    setAddError(null);

    try {
      const res = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), url: newUrl.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add source');
      }

      setNewName('');
      setNewUrl('');
      setShowAddForm(false);
      setTestResult(null);
      await loadSources();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to add source');
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateSource = async (id: string) => {
    try {
      const res = await fetch(`/api/sources/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim(), url: editUrl.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update source');
      }

      setEditingId(null);
      await loadSources();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update source');
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await fetch(`/api/sources/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentActive }),
      });
      await loadSources();
    } catch {
      setError('Failed to toggle source');
    }
  };

  const handleDeleteSource = async (id: string) => {
    if (!confirm('Are you sure you want to delete this source? All version history for this source will be removed.')) {
      return;
    }

    try {
      const res = await fetch(`/api/sources/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete source');
      await loadSources();
    } catch {
      setError('Failed to delete source');
    }
  };

  const startEditing = (source: ChangelogSource) => {
    setEditingId(source.id);
    setEditName(source.name);
    setEditUrl(source.url);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2.5 text-brutal-secondary hover:text-brutal-primary hover:bg-brutal-secondary/10 transition-colors"
        aria-label="Changelog Sources"
        title="Changelog Sources"
      >
        <Link className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-brutal-elevated border-brutal shadow-brutal z-50 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="heading-brutal heading-brutal-md">Changelog Sources</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-brutal-secondary hover:bg-brutal-secondary/10 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-accent-coral" />
              </div>
            ) : (
              <div className="space-y-4">
                {error && (
                  <div className="p-3 bg-accent-red/10 border-brutal border-l-4 border-l-accent-red flex items-center gap-2 text-accent-red text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                {/* Sources list */}
                <div className="space-y-3">
                  {sources.map((source) => (
                    <div
                      key={source.id}
                      className={`p-4 border-brutal transition-colors ${
                        source.is_active
                          ? 'border-l-4 border-l-accent-green bg-accent-green/10'
                          : 'bg-brutal-secondary/10 opacity-60'
                      }`}
                    >
                      {editingId === source.id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Source name"
                            className="input-brutal w-full text-sm"
                          />
                          <input
                            type="url"
                            value={editUrl}
                            onChange={(e) => setEditUrl(e.target.value)}
                            placeholder="Changelog URL"
                            className="input-brutal w-full text-sm font-mono"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateSource(source.id)}
                              className="px-3 py-1.5 bg-accent-coral text-white text-sm border-brutal shadow-brutal-sm hover:shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-100 font-brutal uppercase"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-3 py-1.5 bg-brutal-secondary/10 text-brutal-primary text-sm border-brutal-thin hover:bg-brutal-secondary/20 transition-colors font-brutal uppercase"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-brutal text-brutal-primary truncate">
                                  {source.name}
                                </h3>
                                {source.is_active && (
                                  <span className="tag-brutal bg-accent-green text-black">
                                    Active
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                <a
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-accent-coral hover:underline truncate font-mono"
                                >
                                  {source.url}
                                </a>
                                <ExternalLink className="w-3 h-3 flex-shrink-0 text-accent-coral" />
                              </div>
                              {source.last_version && (
                                <p className="text-xs text-brutal-secondary mt-1">
                                  Last version: <span className="font-mono">{source.last_version}</span>
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleToggleActive(source.id, source.is_active)}
                                className={`p-1.5 transition-colors ${
                                  source.is_active
                                    ? 'text-accent-green hover:bg-accent-green/20'
                                    : 'text-brutal-secondary hover:bg-brutal-secondary/20'
                                }`}
                                title={source.is_active ? 'Disable source' : 'Enable source'}
                              >
                                <Power className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => startEditing(source)}
                                className="p-1.5 text-brutal-secondary hover:bg-brutal-secondary/20 transition-colors"
                                title="Edit source"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteSource(source.id)}
                                className="p-1.5 text-accent-coral hover:bg-accent-coral/20 transition-colors"
                                title="Delete source"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  {sources.length === 0 && (
                    <div className="text-center py-8 text-brutal-secondary font-brutal">
                      No changelog sources configured
                    </div>
                  )}
                </div>

                {/* Add source form */}
                {showAddForm ? (
                  <div className="p-4 border-brutal border-l-4 border-l-accent-coral bg-accent-coral/10 space-y-4">
                    <h3 className="font-brutal uppercase tracking-wide text-brutal-primary">Add New Source</h3>

                    {addError && (
                      <div className="p-2 bg-accent-red/20 border-brutal-thin text-accent-red text-sm">
                        {addError}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm text-brutal-secondary mb-1">Name</label>
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g., Antigravity IDE"
                        className="input-brutal w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-brutal-secondary mb-1">Changelog URL</label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={newUrl}
                          onChange={(e) => {
                            setNewUrl(e.target.value);
                            setTestResult(null);
                          }}
                          placeholder="https://raw.githubusercontent.com/..."
                          className="input-brutal flex-1 font-mono text-sm"
                        />
                        <button
                          onClick={() => testUrl(newUrl)}
                          disabled={!newUrl || testingUrl !== null}
                          className="px-3 py-2 bg-brutal-secondary/10 text-brutal-primary border-brutal-thin hover:bg-brutal-secondary/20 disabled:opacity-50 flex items-center gap-1 font-brutal uppercase text-sm"
                        >
                          {testingUrl === newUrl ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <TestTube className="w-4 h-4" />
                          )}
                          Test
                        </button>
                      </div>
                    </div>

                    {/* Test result */}
                    {testResult && (
                      <div
                        className={`p-3 border-brutal text-sm ${
                          testResult.valid
                            ? 'bg-accent-green/10 border-l-4 border-l-accent-green'
                            : 'bg-accent-red/10 border-l-4 border-l-accent-red'
                        }`}
                      >
                        {testResult.valid ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-accent-green">
                              <CheckCircle className="w-4 h-4" />
                              <span className="font-brutal">Valid changelog detected!</span>
                            </div>
                            <p className="text-brutal-secondary">
                              Latest version: <span className="font-mono font-medium">{testResult.latestVersion}</span>
                            </p>
                            {testResult.preview && (
                              <details className="text-xs">
                                <summary className="cursor-pointer text-brutal-secondary hover:text-brutal-primary">
                                  Preview content
                                </summary>
                                <pre className="mt-2 p-2 bg-brutal-secondary/10 border-brutal-thin overflow-auto max-h-32 font-mono">
                                  {testResult.preview}
                                </pre>
                              </details>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-accent-red">
                            <AlertCircle className="w-4 h-4" />
                            <span>{testResult.message}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={handleAddSource}
                        disabled={isAdding || !newName || !newUrl}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-accent-coral text-white border-brutal shadow-brutal-sm hover:shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-100 disabled:opacity-50 font-brutal uppercase"
                      >
                        {isAdding ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            Add Source
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setShowAddForm(false);
                          setNewName('');
                          setNewUrl('');
                          setAddError(null);
                          setTestResult(null);
                        }}
                        className="px-4 py-2 bg-brutal-secondary/10 text-brutal-primary border-brutal-thin hover:bg-brutal-secondary/20 transition-colors font-brutal uppercase"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-brutal-secondary/50 text-brutal-secondary hover:border-accent-coral hover:text-accent-coral transition-colors font-brutal uppercase"
                  >
                    <Plus className="w-5 h-5" />
                    Add Changelog Source
                  </button>
                )}

                {/* Info */}
                <div className="p-4 bg-brutal-secondary/10 border-brutal border-l-4 border-l-accent-coral">
                  <p className="text-xs text-brutal-secondary">
                    Add multiple changelog sources to monitor. Each source should be a raw markdown file URL
                    (e.g., from GitHub raw content). Active sources will be checked for new versions based on
                    your notification settings.
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
