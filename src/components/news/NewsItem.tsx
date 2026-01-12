'use client';

import type { NewsItem as NewsItemType } from '@/types/news';
import { formatRelativeTime } from '@/hooks/useNews';

interface NewsItemProps {
  article: NewsItemType;
  onSymbolClick?: (symbol: string) => void;
}

export function NewsItem({ article, onSymbolClick }: NewsItemProps) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block px-3 py-2.5 border-b border-border hover:bg-surface-2/50 transition-colors group"
    >
      {/* Header: Source + Time */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {article.source}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {formatRelativeTime(new Date(article.timestamp))}
        </span>
      </div>

      {/* Headline */}
      <h3 className="text-sm font-medium leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
        {article.headline}
      </h3>

      {/* Summary (if available) */}
      {article.summary && (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {article.summary}
        </p>
      )}

      {/* Symbols */}
      {article.symbols && article.symbols.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {article.symbols.slice(0, 5).map((symbol) => (
            <button
              key={symbol}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSymbolClick?.(symbol);
              }}
              className="px-1.5 py-0.5 text-[10px] font-mono bg-surface-3 hover:bg-primary/20 hover:text-primary rounded transition-colors"
            >
              {symbol}
            </button>
          ))}
          {article.symbols.length > 5 && (
            <span className="px-1.5 py-0.5 text-[10px] text-muted-foreground">
              +{article.symbols.length - 5}
            </span>
          )}
        </div>
      )}
    </a>
  );
}
