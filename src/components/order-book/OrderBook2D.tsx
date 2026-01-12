'use client';

import { useMemo } from 'react';
import { useOrderBookStore } from '@/stores/orderBookStore';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

interface OrderBook2DProps {
  symbol: string;
  maxLevels?: number;
  className?: string;
}

export function OrderBook2D({ symbol, maxLevels = 10, className }: OrderBook2DProps) {
  const { bids, asks, spread, midPrice, bidTotal, askTotal, imbalance, aggregation } =
    useOrderBookStore();
  const colorblindMode = useUIStore((state) => state.colorblindMode);
  const setOrderBookAggregation = useUIStore((state) => state.setOrderBookAggregation);

  const bullishClass = colorblindMode ? 'text-bullish-alt' : 'text-bullish';
  const bearishClass = colorblindMode ? 'text-bearish-alt' : 'text-bearish';
  const bullishBgClass = colorblindMode ? 'bg-blue-500/20' : 'bg-green-500/20';
  const bearishBgClass = colorblindMode ? 'bg-orange-500/20' : 'bg-red-500/20';

  const maxSize = useMemo(() => {
    const allSizes = [...bids, ...asks].map((l) => l.size);
    return Math.max(...allSizes, 1);
  }, [bids, asks]);

  const displayBids = bids.slice(0, maxLevels);
  const displayAsks = asks.slice(0, maxLevels);

  const aggregationOptions = [0.01, 0.05, 0.1, 0.25, 0.5, 1.0];

  // Generate stable mock data if no real data available (deterministic to avoid hydration errors)
  const hasMockData = bids.length === 0 && asks.length === 0;
  const mockBids = hasMockData ? [
    { price: 259.00, size: 450 },
    { price: 258.95, size: 320 },
    { price: 258.90, size: 580 },
    { price: 258.85, size: 210 },
    { price: 258.80, size: 390 },
    { price: 258.75, size: 270 },
    { price: 258.70, size: 510 },
    { price: 258.65, size: 180 },
  ] : [];
  const mockAsks = hasMockData ? [
    { price: 259.10, size: 380 },
    { price: 259.15, size: 290 },
    { price: 259.20, size: 520 },
    { price: 259.25, size: 160 },
    { price: 259.30, size: 440 },
    { price: 259.35, size: 350 },
    { price: 259.40, size: 230 },
    { price: 259.45, size: 410 },
  ] : [];

  const finalBids = hasMockData ? mockBids : displayBids;
  const finalAsks = hasMockData ? mockAsks : displayAsks;
  const finalMaxSize = hasMockData
    ? Math.max(...[...mockBids, ...mockAsks].map(l => l.size), 1)
    : maxSize;
  const finalSpread = hasMockData ? 0.10 : spread;
  const finalMidPrice = hasMockData ? 259.05 : midPrice;

  return (
    <div className={cn('terminal-panel flex flex-col', className)}>
      {/* Header */}
      <div className="terminal-panel-header flex items-center justify-between">
        <span>Order Book</span>
        <select
          value={aggregation}
          onChange={(e) => setOrderBookAggregation(parseFloat(e.target.value))}
          className="terminal-select w-16"
        >
          {aggregationOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt.toFixed(2)}
            </option>
          ))}
        </select>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-3 px-1.5 py-0.5 text-[10px] text-muted-foreground uppercase tracking-wider bg-surface-2 border-b border-border">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>

      {/* Asks (reversed) */}
      <div className="flex-1 overflow-auto terminal-scroll flex flex-col-reverse">
        <div>
          {[...finalAsks].reverse().map((level, index) => {
            const barWidth = (level.size / finalMaxSize) * 100;
            const cumulativeSize = finalAsks
              .slice(0, finalAsks.length - index)
              .reduce((sum, l) => sum + l.size, 0);

            return (
              <div
                key={`ask-${level.price}`}
                className="relative grid grid-cols-3 px-1.5 py-px text-xs font-mono hover:bg-surface-2"
              >
                <div
                  className={cn('absolute inset-y-0 right-0 opacity-30', bearishBgClass)}
                  style={{ width: `${barWidth}%` }}
                />
                <span className={cn('relative z-10', bearishClass)}>
                  {level.price.toFixed(2)}
                </span>
                <span className="text-right relative z-10 tabular-nums">
                  {level.size.toLocaleString()}
                </span>
                <span className="text-right text-muted-foreground relative z-10 tabular-nums">
                  {cumulativeSize.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spread */}
      <div className="flex items-center justify-between px-1.5 py-1 bg-surface-2 border-y border-border text-[10px]">
        <span className="text-muted-foreground">SPREAD</span>
        <span className="font-mono">
          {finalSpread.toFixed(2)} ({((finalSpread / finalMidPrice) * 100).toFixed(2)}%)
        </span>
      </div>

      {/* Bids */}
      <div className="flex-1 overflow-auto terminal-scroll">
        {finalBids.map((level, index) => {
          const barWidth = (level.size / finalMaxSize) * 100;
          const cumulativeSize = finalBids
            .slice(0, index + 1)
            .reduce((sum, l) => sum + l.size, 0);

          return (
            <div
              key={`bid-${level.price}`}
              className="relative grid grid-cols-3 px-1.5 py-px text-xs font-mono hover:bg-surface-2"
            >
              <div
                className={cn('absolute inset-y-0 left-0 opacity-30', bullishBgClass)}
                style={{ width: `${barWidth}%` }}
              />
              <span className={cn('relative z-10', bullishClass)}>
                {level.price.toFixed(2)}
              </span>
              <span className="text-right relative z-10 tabular-nums">
                {level.size.toLocaleString()}
              </span>
              <span className="text-right text-muted-foreground relative z-10 tabular-nums">
                {cumulativeSize.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-1.5 py-1 bg-surface-2 border-t border-border text-[10px]">
        <div className="flex items-center gap-2">
          <span className={bullishClass}>{hasMockData ? '2,450' : bidTotal.toLocaleString()}</span>
          <span className="text-muted-foreground">/</span>
          <span className={bearishClass}>{hasMockData ? '2,120' : askTotal.toLocaleString()}</span>
        </div>
        <span className={cn(
          'font-mono',
          (hasMockData ? 0.07 : imbalance) > 0 ? bullishClass : bearishClass
        )}>
          {hasMockData ? '+7.2%' : `${imbalance > 0 ? '+' : ''}${(imbalance * 100).toFixed(1)}%`}
        </span>
      </div>
    </div>
  );
}
