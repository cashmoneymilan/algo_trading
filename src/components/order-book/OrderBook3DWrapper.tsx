'use client';

import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

// Dynamic import for Three.js to avoid SSR issues
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

interface OrderBook3DWrapperProps {
  symbol: string;
  className?: string;
}

export function OrderBook3DWrapper({ symbol, className }: OrderBook3DWrapperProps) {
  return (
    <div className={cn('terminal-panel flex flex-col', className)}>
      <div className="terminal-panel-header flex items-center justify-between">
        <span>3D Order Book</span>
        <span className="text-[10px] text-muted-foreground">DEMO</span>
      </div>
      <div className="flex-1 min-h-0">
        <Scene symbol={symbol} />
      </div>
    </div>
  );
}
