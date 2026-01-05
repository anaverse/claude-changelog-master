import { useState, useEffect, useCallback } from 'react';
import type { ChangelogVersion, GeminiAnalysis } from '../types';
import { fetchChangelog, parseChangelog, getLatestVersion } from '../services/changelogService';
import { analyzeChangelog } from '../services/geminiService';
import { getCachedAnalysis, setCachedAnalysis, hashString } from '../services/cacheService';

interface UseChangelogReturn {
  rawChangelog: string | null;
  parsedChangelog: ChangelogVersion[];
  analysis: GeminiAnalysis | null;
  latestVersion: string;
  isLoading: boolean;
  isAnalyzing: boolean;
  error: string | null;
  lastFetched: number | null;
  refresh: () => Promise<void>;
}

export function useChangelog(): UseChangelogReturn {
  const [rawChangelog, setRawChangelog] = useState<string | null>(null);
  const [parsedChangelog, setParsedChangelog] = useState<ChangelogVersion[]>([]);
  const [analysis, setAnalysis] = useState<GeminiAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<number | null>(null);

  const loadChangelog = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const markdown = await fetchChangelog();
      setRawChangelog(markdown);

      const versions = parseChangelog(markdown);
      setParsedChangelog(versions);
      setLastFetched(Date.now());

      const latestVersionText = versions.slice(0, 3).map((v) =>
        `## ${v.version}\n${v.items.map((i) => `- ${i.content}`).join('\n')}`
      ).join('\n\n');

      const versionHash = hashString(latestVersionText);

      const cached = await getCachedAnalysis(versionHash);
      if (cached) {
        setAnalysis(cached);
      } else {
        setIsAnalyzing(true);
        try {
          const result = await analyzeChangelog(latestVersionText);
          setAnalysis(result);
          await setCachedAnalysis(versionHash, result);
        } catch (analysisError) {
          console.error('Analysis failed:', analysisError);
        } finally {
          setIsAnalyzing(false);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load changelog');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChangelog();
  }, [loadChangelog]);

  const latestVersion = getLatestVersion(parsedChangelog);

  return {
    rawChangelog,
    parsedChangelog,
    analysis,
    latestVersion,
    isLoading,
    isAnalyzing,
    error,
    lastFetched,
    refresh: loadChangelog,
  };
}
