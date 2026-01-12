'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useNews, formatRelativeTime } from '@/hooks/useNews';
import { NewsItem } from './NewsItem';

interface NewsFeedPanelProps {
  symbol?: string;
  onSymbolClick?: (symbol: string) => void;
  className?: string;
}

type FilterMode = 'all' | 'symbol';

export function NewsFeedPanel({ symbol, onSymbolClick, className }: NewsFeedPanelProps) {
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  const symbols = filterMode === 'symbol' && symbol ? [symbol] : undefined;

  const { news, isLoading, error, lastFetched, refetch } = useNews({
    symbols,
    limit: 25,
    pollingInterval: 60000, // 1 minute
  });

  return (
    <div className={cn('h-full flex flex-col', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-surface-2/50">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">News</span>
          {lastFetched && (
            <span className="text-[9px] text-muted-foreground">
              Updated {formatRelativeTime(new Date(lastFetched))}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* Refresh button */}
          <button
            onClick={refetch}
            disabled={isLoading}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <svg
              className={cn('w-3.5 h-3.5', isLoading && 'animate-spin')}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      {symbol && (
        <div className="flex items-center gap-0.5 px-2 py-1 border-b border-border bg-surface-2/30">
          <button
            onClick={() => setFilterMode('all')}
            className={cn(
              'px-2 py-0.5 text-[10px] uppercase tracking-wider transition-colors',
              filterMode === 'all'
                ? 'text-foreground bg-surface-3'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            All
          </button>
          <button
            onClick={() => setFilterMode('symbol')}
            className={cn(
              'px-2 py-0.5 text-[10px] uppercase tracking-wider transition-colors',
              filterMode === 'symbol'
                ? 'text-foreground bg-surface-3'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {symbol}
          </button>
        </div>
      )}

      {/* News list */}
      <div className="flex-1 overflow-y-auto">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
            <svg className="w-8 h-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-xs text-center">{error}</p>
            <button
              onClick={refetch}
              className="mt-2 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              Try again
            </button>
          </div>
        ) : isLoading && news.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <svg className="w-6 h-6 mb-2 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-xs">Loading news...</p>
          </div>
        ) : news.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <svg className="w-8 h-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
            <p className="text-xs">No news available</p>
          </div>
        ) : (
          news.map((article) => (
            <NewsItem key={article.id} article={article} onSymbolClick={onSymbolClick} />
          ))
        )}
      </div>
    </div>
  );
}
