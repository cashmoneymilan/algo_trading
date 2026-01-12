'use client';

import { useEffect } from 'react';
import { useTradingStore, selectTotalUnrealizedPl } from '@/stores/tradingStore';
import { useMarketDataStore } from '@/stores/marketDataStore';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';
import { REFRESH_INTERVALS } from '@/config/constants';

interface PositionListProps {
  className?: string;
  onSelectSymbol?: (symbol: string) => void;
}

export function PositionList({ className, onSelectSymbol }: PositionListProps) {
  const positions = useTradingStore((state) => state.positions);
  const isLoading = useTradingStore((state) => state.isLoadingPositions);
  const fetchPositions = useTradingStore((state) => state.fetchPositions);
  const closePosition = useTradingStore((state) => state.closePosition);
  const totalPl = useTradingStore(selectTotalUnrealizedPl);
  const quotes = useMarketDataStore((state) => state.quotes);
  const colorblindMode = useUIStore((state) => state.colorblindMode);

  const bullishClass = colorblindMode ? 'text-bullish-alt' : 'text-bullish';
  const bearishClass = colorblindMode ? 'text-bearish-alt' : 'text-bearish';

  useEffect(() => {
    fetchPositions();
    const interval = setInterval(fetchPositions, REFRESH_INTERVALS.POSITIONS);
    return () => clearInterval(interval);
  }, [fetchPositions]);

  const handleClose = async (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Close ${symbol}?`)) {
      await closePosition(symbol);
    }
  };

  return (
    <div className={cn('terminal-panel flex flex-col', className)}>
      {/* Header */}
      <div className="terminal-panel-header flex items-center justify-between">
        <span>Positions</span>
        {positions.length > 0 && (
          <span className={cn('font-mono text-[10px]', totalPl >= 0 ? bullishClass : bearishClass)}>
            P&L: {totalPl >= 0 ? '+' : ''}{totalPl.toFixed(2)}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto terminal-scroll">
        {isLoading && positions.length === 0 ? (
          <div className="p-2 text-[10px] text-muted-foreground">Loading...</div>
        ) : positions.length === 0 ? (
          <div className="p-2 text-[10px] text-muted-foreground">No positions</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>SYM</th>
                <th className="text-right">QTY</th>
                <th className="text-right">AVG</th>
                <th className="text-right">MKT</th>
                <th className="text-right">P&L</th>
                <th className="w-4"></th>
              </tr>
            </thead>
            <tbody>
              {positions.map((position) => {
                const quote = quotes[position.symbol];
                const currentPrice = quote
                  ? (quote.bid + quote.ask) / 2
                  : position.currentPrice;
                const unrealizedPl = (currentPrice - position.avgEntryPrice) * position.qty;
                const unrealizedPlPercent = ((currentPrice - position.avgEntryPrice) / position.avgEntryPrice) * 100;
                const isProfit = unrealizedPl >= 0;

                return (
                  <tr
                    key={position.assetId}
                    onClick={() => onSelectSymbol?.(position.symbol)}
                    className="cursor-pointer group"
                  >
                    <td>
                      <span className="font-semibold">{position.symbol}</span>
                      <span className={cn(
                        'text-[8px] ml-1 uppercase',
                        position.side === 'long' ? bullishClass : bearishClass
                      )}>
                        {position.side === 'long' ? 'L' : 'S'}
                      </span>
                    </td>
                    <td className="text-right">{position.qty}</td>
                    <td className="text-right">{position.avgEntryPrice.toFixed(2)}</td>
                    <td className="text-right">{currentPrice.toFixed(2)}</td>
                    <td className={cn('text-right', isProfit ? bullishClass : bearishClass)}>
                      {isProfit ? '+' : ''}{unrealizedPl.toFixed(0)}
                      <span className="text-[8px] ml-0.5">
                        ({isProfit ? '+' : ''}{unrealizedPlPercent.toFixed(1)}%)
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={(e) => handleClose(position.symbol, e)}
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
        )}
      </div>
    </div>
  );
}
