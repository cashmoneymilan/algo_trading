'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useNewsStore } from '@/stores/newsStore';
import type { NewsItem } from '@/types/news';

interface UseNewsOptions {
  symbols?: string[];
  limit?: number;
  pollingInterval?: number; // in ms, default 60000 (60 seconds)
  enabled?: boolean;
}

export function useNews({
  symbols,
  limit = 20,
  pollingInterval = 60000,
  enabled = true,
}: UseNewsOptions = {}) {
  const news = useNewsStore((state) => state.news);
  const isLoading = useNewsStore((state) => state.isLoading);
  const error = useNewsStore((state) => state.error);
  const lastFetched = useNewsStore((state) => state.lastFetched);
  const currentSymbol = useNewsStore((state) => state.currentSymbol);

  const setNews = useNewsStore((state) => state.setNews);
  const setLoading = useNewsStore((state) => state.setLoading);
  const setError = useNewsStore((state) => state.setError);
  const setLastFetched = useNewsStore((state) => state.setLastFetched);
  const setCurrentSymbol = useNewsStore((state) => state.setCurrentSymbol);
  const clearNews = useNewsStore((state) => state.clearNews);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchNews = useCallback(async () => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setLoading(true);

    try {
      const params = new URLSearchParams({ limit: limit.toString() });
      if (symbols && symbols.length > 0) {
        params.append('symbols', symbols.join(','));
      }

      const response = await fetch(`/api/alpaca/news?${params.toString()}`, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch news');
      }

      const data = await response.json();

      // Transform timestamps to Date objects
      const newsItems: NewsItem[] = data.news.map((item: NewsItem) => ({
        ...item,
        timestamp: new Date(item.timestamp),
      }));

      setNews(newsItems);
      setLastFetched(Date.now());
      setCurrentSymbol(symbols?.[0] || null);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Request was cancelled, ignore
      }
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  }, [symbols, limit, setNews, setLoading, setError, setLastFetched, setCurrentSymbol]);

  // Fetch on mount and when symbols change
  useEffect(() => {
    if (!enabled) return;

    // Clear news if symbol changed
    const symbolKey = symbols?.join(',') || 'all';
    const currentKey = currentSymbol || 'all';
    if (symbolKey !== currentKey) {
      clearNews();
    }

    fetchNews();

    // Set up polling
    if (pollingInterval > 0) {
      pollingRef.current = setInterval(fetchNews, pollingInterval);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [enabled, symbols?.join(','), pollingInterval, fetchNews, clearNews, currentSymbol]);

  const refetch = useCallback(() => {
    fetchNews();
  }, [fetchNews]);

  return {
    news,
    isLoading,
    error,
    lastFetched,
    refetch,
  };
}

// Format relative time
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}
