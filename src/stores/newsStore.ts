import { create } from 'zustand';
import type { NewsItem } from '@/types/news';

interface NewsState {
  // State
  news: NewsItem[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  currentSymbol: string | null;

  // Actions
  setNews: (news: NewsItem[]) => void;
  appendNews: (news: NewsItem[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setLastFetched: (timestamp: number) => void;
  setCurrentSymbol: (symbol: string | null) => void;
  clearNews: () => void;
}

export const useNewsStore = create<NewsState>((set) => ({
  news: [],
  isLoading: false,
  error: null,
  lastFetched: null,
  currentSymbol: null,

  setNews: (news) => set({ news, error: null }),

  appendNews: (newNews) =>
    set((state) => {
      // Deduplicate by ID
      const existingIds = new Set(state.news.map((n) => n.id));
      const uniqueNews = newNews.filter((n) => !existingIds.has(n.id));
      return { news: [...uniqueNews, ...state.news] };
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),

  setLastFetched: (lastFetched) => set({ lastFetched }),

  setCurrentSymbol: (currentSymbol) => set({ currentSymbol }),

  clearNews: () => set({ news: [], error: null, lastFetched: null }),
}));

// Selectors
export const selectNews = (state: NewsState) => state.news;
export const selectIsLoading = (state: NewsState) => state.isLoading;
export const selectError = (state: NewsState) => state.error;
