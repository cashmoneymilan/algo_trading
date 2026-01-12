'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';
import type { IndicatorSettings } from '@/types/indicators';

type ChartType = 'candlestick' | 'heikin-ashi' | 'line';
type Timeframe = '1Min' | '5Min' | '15Min' | '1Hour' | '1Day';

interface ChartToolbarProps {
  symbol: string;
  chartType: ChartType;
  timeframe: Timeframe;
  onChartTypeChange: (type: ChartType) => void;
  onTimeframeChange: (timeframe: Timeframe) => void;
}

const TIMEFRAMES: { value: Timeframe; label: string }[] = [
  { value: '1Min', label: '1m' },
  { value: '5Min', label: '5m' },
  { value: '15Min', label: '15m' },
  { value: '1Hour', label: '1H' },
  { value: '1Day', label: '1D' },
];

const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: 'candlestick', label: 'OHLC' },
  { value: 'heikin-ashi', label: 'HA' },
  { value: 'line', label: 'LINE' },
];

const INDICATOR_OPTIONS: { key: keyof IndicatorSettings; label: string; group: 'overlay' | 'pane' }[] = [
  { key: 'sma', label: 'SMA', group: 'overlay' },
  { key: 'ema', label: 'EMA', group: 'overlay' },
  { key: 'bollinger', label: 'Bollinger', group: 'overlay' },
  { key: 'vwap', label: 'VWAP', group: 'overlay' },
  { key: 'rsi', label: 'RSI', group: 'pane' },
  { key: 'macd', label: 'MACD', group: 'pane' },
  { key: 'volume', label: 'Volume', group: 'pane' },
];

export function ChartToolbar({
  chartType,
  timeframe,
  onChartTypeChange,
  onTimeframeChange,
}: ChartToolbarProps) {
  const [showIndicatorMenu, setShowIndicatorMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const indicators = useUIStore((state) => state.indicators);
  const toggleIndicator = useUIStore((state) => state.toggleIndicator);

  // Count active indicators
  const activeCount = INDICATOR_OPTIONS.filter(
    (opt) => indicators[opt.key].enabled
  ).length;

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowIndicatorMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="h-6 flex items-center justify-between px-2 bg-surface-2 border-b border-border text-[10px]">
      {/* Left side: Timeframe selector */}
      <div className="flex items-center gap-0.5">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf.value}
            className={cn(
              'px-1.5 py-0.5 uppercase tracking-wider transition-colors',
              timeframe === tf.value
                ? 'text-foreground bg-surface-3'
                : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => onTimeframeChange(tf.value)}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* Right side: Chart type + Indicators */}
      <div className="flex items-center gap-2">
        {/* Indicator dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            className={cn(
              'px-1.5 py-0.5 uppercase tracking-wider transition-colors flex items-center gap-1',
              showIndicatorMenu || activeCount > 0
                ? 'text-foreground bg-surface-3'
                : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => setShowIndicatorMenu(!showIndicatorMenu)}
          >
            <span>IND</span>
            {activeCount > 0 && (
              <span className="text-[8px] bg-primary text-primary-foreground px-1 rounded">
                {activeCount}
              </span>
            )}
          </button>

          {/* Dropdown menu */}
          {showIndicatorMenu && (
            <div className="absolute right-0 top-full mt-1 z-50 bg-surface-1 border border-border shadow-lg min-w-[140px]">
              {/* Overlay indicators */}
              <div className="px-2 py-1 text-[9px] text-muted-foreground uppercase tracking-wider bg-surface-2 border-b border-border">
                Overlays
              </div>
              {INDICATOR_OPTIONS.filter((opt) => opt.group === 'overlay').map((opt) => (
                <button
                  key={opt.key}
                  className="w-full px-2 py-1 flex items-center justify-between hover:bg-surface-2 transition-colors"
                  onClick={() => toggleIndicator(opt.key)}
                >
                  <span>{opt.label}</span>
                  <span
                    className={cn(
                      'w-3 h-3 border rounded-sm flex items-center justify-center',
                      indicators[opt.key].enabled
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-muted-foreground'
                    )}
                  >
                    {indicators[opt.key].enabled && (
                      <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                </button>
              ))}

              {/* Pane indicators */}
              <div className="px-2 py-1 text-[9px] text-muted-foreground uppercase tracking-wider bg-surface-2 border-y border-border">
                Panes
              </div>
              {INDICATOR_OPTIONS.filter((opt) => opt.group === 'pane').map((opt) => (
                <button
                  key={opt.key}
                  className="w-full px-2 py-1 flex items-center justify-between hover:bg-surface-2 transition-colors"
                  onClick={() => toggleIndicator(opt.key)}
                >
                  <span>{opt.label}</span>
                  <span
                    className={cn(
                      'w-3 h-3 border rounded-sm flex items-center justify-center',
                      indicators[opt.key].enabled
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-muted-foreground'
                    )}
                  >
                    {indicators[opt.key].enabled && (
                      <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-3 bg-border" />

        {/* Chart type selector */}
        <div className="flex items-center gap-0.5">
          {CHART_TYPES.map((type) => (
            <button
              key={type.value}
              className={cn(
                'px-1.5 py-0.5 uppercase tracking-wider transition-colors',
                chartType === type.value
                  ? 'text-foreground bg-surface-3'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              onClick={() => onChartTypeChange(type.value)}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
