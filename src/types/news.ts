// Alpaca News API types

export interface NewsArticle {
  id: number;
  headline: string;
  summary: string;
  author: string;
  source: string;
  url: string;
  symbols: string[];
  created_at: string;
  updated_at: string;
  // Optional image
  images?: {
    size: 'thumb' | 'small' | 'large';
    url: string;
  }[];
}

export interface NewsResponse {
  news: NewsArticle[];
  next_page_token?: string;
}

// Simplified article for display
export interface NewsItem {
  id: number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  symbols: string[];
  timestamp: Date;
  imageUrl?: string;
}

// News filter options
export interface NewsFilter {
  symbols?: string[];
  limit?: number;
}

// Transform Alpaca response to our format
export function transformNewsArticle(article: NewsArticle): NewsItem {
  return {
    id: article.id,
    headline: article.headline,
    summary: article.summary,
    source: article.source,
    url: article.url,
    symbols: article.symbols,
    timestamp: new Date(article.created_at),
    imageUrl: article.images?.find((img) => img.size === 'small')?.url,
  };
}
