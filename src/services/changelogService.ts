import type { ChangelogVersion, ChangelogItem } from '../types';

const CHANGELOG_URL = 'https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md';

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  let lastError: Error | null = null;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error) {
      lastError = error as Error;
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }

  throw lastError || new Error('Failed to fetch after retries');
}

export async function fetchChangelog(): Promise<string> {
  const response = await fetchWithRetry(CHANGELOG_URL);
  return response.text();
}

export function parseChangelog(markdown: string): ChangelogVersion[] {
  const versions: ChangelogVersion[] = [];
  const lines = markdown.split('\n');

  let currentVersion: ChangelogVersion | null = null;

  for (const line of lines) {
    const versionMatch = line.match(/^##\s+\[?(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.]+)?)\]?(?:\s*[-–]\s*(.+))?/);

    if (versionMatch) {
      if (currentVersion) {
        versions.push(currentVersion);
      }
      currentVersion = {
        version: versionMatch[1],
        date: versionMatch[2]?.trim() || '',
        items: [],
      };
      continue;
    }

    if (currentVersion && (line.startsWith('- ') || line.startsWith('* '))) {
      const content = line.slice(2).trim();
      const item: ChangelogItem = {
        type: categorizeItem(content),
        content,
      };
      currentVersion.items.push(item);
    }
  }

  if (currentVersion) {
    versions.push(currentVersion);
  }

  return versions;
}

function categorizeItem(content: string): ChangelogItem['type'] {
  const lowerContent = content.toLowerCase();

  if (lowerContent.includes('breaking') || lowerContent.includes('removed') && lowerContent.includes('support')) {
    return 'breaking';
  }
  if (lowerContent.includes('removed') || lowerContent.includes('deprecated') || lowerContent.includes('no longer')) {
    return 'removal';
  }
  if (lowerContent.includes('fix') || lowerContent.includes('fixed') || lowerContent.includes('bug') || lowerContent.includes('issue')) {
    return 'fix';
  }
  if (lowerContent.includes('add') || lowerContent.includes('new') || lowerContent.includes('feature') || lowerContent.includes('support')) {
    return 'feature';
  }

  return 'other';
}

export function getLatestVersion(versions: ChangelogVersion[]): string {
  return versions[0]?.version || 'Unknown';
}
