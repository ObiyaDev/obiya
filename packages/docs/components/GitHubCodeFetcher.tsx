'use client';

import { useEffect, useState } from 'react';

interface GitHubCodeFetcherProps {
  repo: string;
  path: string;
  branch?: string;
  language?: string;
}

export function GitHubCodeFetcher({ repo, path, branch = 'main', language }: GitHubCodeFetcherProps) {
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const fetchCode = async () => {
      setLoading(true);
      try {
        const url = `https://raw.githubusercontent.com/${repo}/${branch}/${path}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch code: ${response.status} ${response.statusText}`);
        }
        
        const text = await response.text();
        setCode(text);
        setError(null);
      } catch (err) {
        console.error('Error fetching code from GitHub:', err);
        setError(`Failed to fetch code from GitHub: ${err instanceof Error ? err.message : String(err)}`);
        setCode('');
      } finally {
        setLoading(false);
      }
    };

    fetchCode();
  }, [repo, path, branch]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-900/20 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2.5"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2.5"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-2.5"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2.5"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
        <p className="font-medium">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  const fileExtension = language || path.split('.').pop() || '';

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 p-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Copy code"
      >
        {copied ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        )}
      </button>
      <pre className="rounded-lg overflow-x-auto">
        <code className={`language-${fileExtension}`}>{code}</code>
      </pre>
    </div>
  );
}

export function GitHubCodeContent({ repo, path, branch = 'main' }: GitHubCodeFetcherProps) {
  const [code, setCode] = useState<string>('');
  
  useEffect(() => {
    const fetchCode = async () => {
      try {
        const url = `https://raw.githubusercontent.com/${repo}/${branch}/${path}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch code: ${response.status} ${response.statusText}`);
        }
        
        const text = await response.text();
        setCode(text);
      } catch (err) {
        console.error('Error fetching code from GitHub:', err);
        setCode('// Error fetching code from GitHub');
      }
    };

    fetchCode();
  }, [repo, path, branch]);

  return code;
} 