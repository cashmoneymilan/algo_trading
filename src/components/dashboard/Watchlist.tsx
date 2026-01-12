'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useMarketDataStore } from '@/stores/marketDataStore';
import { useAlpacaWebSocket } from '@/hooks/useAlpacaWebSocket';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';
import { DEFAULT_WATCHLIST, API_ROUTES } from '@/config/constants';

interface WatchlistProps {
  className?: string;
  onSelectSymbol?: (symbol: string) => void;
  selectedSymbol?: string;
}

export function Watchlist({ className, onSelectSymbol, selectedSymbol }: WatchlistProps) {
  const [symbols, setSymbols] = useState<string[]>(DEFAULT_WATCHLIST as unknown as string[]);
  const [newSymbol, setNewSymbol] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Track previous prices for tick direction
  const prevPrices = useRef<Record<string, number>>({});

  const quotes = useMarketDataStore((state) => state.quotes);
  const updateQuote = useMarketDataStore((state) => state.updateQuote);
  const { subscribe, unsubscribe, isConnected } = useAlpacaWebSocket();
  const colorblindMode = useUIStore((state) => state.colorblindMode);

  const bullishClass = colorblindMode ? 'text-bullish-alt' : 'text-bullish';
  const bearishClass = colorblindMode ? 'text-bearish-alt' : 'text-bearish';

  // Fetch initial quotes via REST API
  useEffect(() => {
    const fetchQuotes = async () => {
      for (const symbol of symbols) {
        try {
          const response = await fetch(`${API_ROUTES.MARKET_DATA}?symbol=${symbol}&type=quote`);
          if (response.ok) {
            const data = await response.json();
            if (data.quote) {
              updateQuote({
                symbol,
                bid: data.quote.bp || 0,
                ask: data.quote.ap || 0,
                bidSize: data.quote.bs || 0,
                askSize: data.quote.as || 0,
                timestamp: new Date(data.quote.t).getTime(),
              });
            }
          }
        } catch (error) {
          console.error(`Failed to fetch quote for ${symbol}:`, error);
        }
      }
    };

    fetchQuotes();
  }, [symbols, updateQuote]);

  // Subscribe to all watchlist symbols on mount for real-time updates
  useEffect(() => {
    if (isConnected && symbols.length > 0) {
      subscribe(symbols, ['quotes']);
    }
  }, [isConnected, symbols, subscribe]);

  // Focus input when shown
  useEffect(() => {
    if (showAddInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showAddInput]);

  const handleAddSymbol = useCallback(() => {
    const symbol = newSymbol.toUpperCase().trim();
    if (symbol && !symbols.includes(symbol)) {
      setSymbols((prev) => [...prev, symbol]);
      subscribe([symbol], ['quotes']);
      setNewSymbol('');
      setShowAddInput(false);
    }
  }, [newSymbol, symbols, subscribe]);

  const handleRemoveSymbol = useCallback((e: React.MouseEvent, symbolToRemove: string) => {
    e.stopPropagation();
    setSymbols((prev) => prev.filter((s) => s !== symbolToRemove));
    unsubscribe([symbolToRemove], ['quotes']);
  }, [unsubscribe]);

  const getTickDirection = (symbol: string, currentPrice: number): 'up' | 'down' | 'neutral' => {
    const prev = prevPrices.current[symbol];
    if (prev === undefined || prev === currentPrice) return 'neutral';
    prevPrices.current[symbol] = currentPrice;
    return currentPrice > prev ? 'up' : 'down';
  };

  return (
    <div className={cn('terminal-panel flex flex-col h-full', className)}>
      {/* Header */}
      <div className="terminal-panel-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>Watchlist</span>
          <span className={cn(
            'status-dot',
            isConnected ? 'status-dot-connected' : 'status-dot-disconnected'
          )} />
        </div>
        <button
          onClick={() => setShowAddInput(!showAddInput)}
          className="text-[10px] text-muted-foreground hover:text-foreground"
        >
          {showAddInput ? '×' : '+'}
        </button>
      </div>

      {/* Add symbol input */}
      {showAddInput && (
        <div className="flex border-b border-border">
          <input
            ref={inputRef}
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddSymbol();
              if (e.key === 'Escape') setShowAddInput(false);
            }}
            placeholder="SYMBOL"
            className="terminal-input flex-1 border-0 border-r"
          />
          <button
            onClick={handleAddSymbol}
            className="terminal-button px-3 bg-surface-2 hover:bg-surface-3"
          >
            ADD
          </button>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto terminal-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th className="w-16">SYM</th>
              <th className="text-right">BID</th>
              <th className="text-right">ASK</th>
              <th className="text-right w-12">SPD</th>
              <th className="w-6"></th>
            </tr>
          </thead>
          <tbody>
            {symbols.map((symbol) => {
              const quote = quotes[symbol];
              const bid = quote?.bid || 0;
              const ask = quote?.ask || 0;
              const mid = bid && ask ? (bid + ask) / 2 : 0;
              const spread = ask && bid ? ((ask - bid) / mid * 100) : 0;
              const tick = mid ? getTickDirection(symbol, mid) : 'neutral';
              const isSelected = symbol === selectedSymbol;

              return (
                <tr
                  key={symbol}
                  onClick={() => onSelectSymbol?.(symbol)}
                  className={cn(
                    'cursor-pointer',
                    isSelected && 'bg-primary/10'
                  )}
                >
                  <td className="font-semibold">
                    <span className={cn(
                      tick === 'up' && 'tick-up',
                      tick === 'down' && 'tick-down',
                      tick === 'neutral' && 'tick-neutral'
                    )}>
                      {symbol}
                    </span>
                  </td>
                  <td className={cn('text-right price-display', bid > 0 && bullishClass)}>
                    {bid > 0 ? bid.toFixed(2) : '--'}
                  </td>
                  <td className={cn('text-right price-display', ask > 0 && bearishClass)}>
                    {ask > 0 ? ask.toFixed(2) : '--'}
                  </td>
                  <td className="text-right text-muted-foreground text-[10px]">
                    {spread > 0 ? spread.toFixed(2) + '%' : '--'}
                  </td>
                  <td>
                    <button
                      onClick={(e) => handleRemoveSymbol(e, symbol)}
                      className="text-muted-foreground hover:text-bearish text-[10px] opacity-0 group-hover:opacity-100"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer with count */}
      <div className="px-2 py-1 border-t border-border text-[10px] text-muted-foreground">
        {symbols.length} symbols
      </div>
    </div>
  );
}
