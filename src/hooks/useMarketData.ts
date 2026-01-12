'use client';

import { useEffect } from 'react';
import { useMarketDataStore, selectQuote, selectBars, selectLatestPrice } from '@/stores/marketDataStore';
import { API_ROUTES, CHART_CONFIG } from '@/config/constants';
import type { Bar } from '@/types/trading';

interface UseMarketDataOptions {
  symbol: string;
  timeframe?: typeof CHART_CONFIG.TIMEFRAMES[number];
  limit?: number;
  fetchBars?: boolean;
}

export function useMarketData({
  symbol,
  timeframe = CHART_CONFIG.DEFAULT_TIMEFRAME,
  limit = CHART_CONFIG.DEFAULT_BAR_COUNT,
  fetchBars = true,
}: UseMarketDataOptions) {
  const quote = useMarketDataStore(selectQuote(symbol));
  const bars = useMarketDataStore(selectBars(symbol));
  const latestPrice = useMarketDataStore(selectLatestPrice(symbol));
  const setBars = useMarketDataStore((state) => state.setBars);

  // Fetch historical bars on mount or when params change
  useEffect(() => {
    if (!fetchBars || !symbol) return;

    const fetchHistoricalBars = async () => {
      try {
        // Calculate start date based on timeframe
        const now = new Date();
        let daysBack = 30; // default
        switch (timeframe) {
          case '1Min':
          case '5Min':
            daysBack = 1;
            break;
          case '15Min':
            daysBack = 5;
            break;
          case '1Hour':
            daysBack = 14;
            break;
          case '1Day':
            daysBack = 365;
            break;
        }
        const start = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

        const params = new URLSearchParams({
          symbol,
          type: 'bars',
          timeframe,
          limit: limit.toString(),
          start: start.toISOString().split('T')[0],
        });

        const response = await fetch(`${API_ROUTES.MARKET_DATA}?${params}`);
        if (!response.ok) {
          throw new Error('Failed to fetch bars');
        }

        const data = await response.json();
        if (data.bars && data.bars.length > 0) {
          setBars(symbol, data.bars as Bar[]);
        }
      } catch (error) {
        console.error('Error fetching historical bars:', error);
      }
    };

    fetchHistoricalBars();
  }, [symbol, timeframe, limit, fetchBars, setBars]);

  return {
    quote,
    bars,
    latestPrice,
    bid: quote?.bid,
    ask: quote?.ask,
    spread: quote ? quote.ask - quote.bid : null,
    midPrice: quote ? (quote.bid + quote.ask) / 2 : latestPrice,
  };
}

// Hook for just the quote (more efficient if you don't need bars)
export function useQuote(symbol: string) {
  return useMarketDataStore(selectQuote(symbol));
}

// Hook for multiple symbols' quotes
export function useQuotes(symbols: string[]) {
  return useMarketDataStore((state) => {
    const quotes: Record<string, typeof state.quotes[string]> = {};
    for (const symbol of symbols) {
      quotes[symbol] = state.quotes[symbol];
    }
    return quotes;
  });
}

// Hook for bars only
export function useBars(symbol: string) {
  return useMarketDataStore(selectBars(symbol));
}

// Hook for latest price only
export function useLatestPrice(symbol: string) {
  return useMarketDataStore(selectLatestPrice(symbol));
}
