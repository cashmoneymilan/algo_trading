'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { OrderBook2D } from './OrderBook2D';

// Dynamic import for 3D to avoid SSR issues
const Scene = dynamic(
  () => import('@/components/three/Scene').then((mod) => mod.Scene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-surface-1">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 mx-auto border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Loading 3D...</p>
        </div>
      </div>
    ),
  }
);

interface OrderBookPanelProps {
  symbol: string;
  className?: string;
}

export function OrderBookPanel({ symbol, className }: OrderBookPanelProps) {
  const [view, setView] = useState<'2d' | '3d'>('2d');

  return (
    <div className={cn('terminal-panel flex flex-col', className)}>
      {/* Header with view toggle */}
      <div className="terminal-panel-header flex items-center justify-between">
        <span>Order Book</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setView('2d')}
            className={cn(
              'px-1.5 py-0.5 text-[10px] uppercase tracking-wider transition-colors',
              view === '2d'
                ? 'text-foreground bg-surface-3'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            2D
          </button>
          <button
            onClick={() => setView('3d')}
            className={cn(
              'px-1.5 py-0.5 text-[10px] uppercase tracking-wider transition-colors',
              view === '3d'
                ? 'text-foreground bg-surface-3'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            3D
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {view === '2d' ? (
          <OrderBook2DContent symbol={symbol} />
        ) : (
          <Scene symbol={symbol} />
        )}
      </div>
    </div>
  );
}

// Simplified 2D content without the header (since panel already has one)
function OrderBook2DContent({ symbol }: { symbol: string }) {
  return <OrderBook2D symbol={symbol} className="h-full [&>.terminal-panel-header]:hidden" />;
}
