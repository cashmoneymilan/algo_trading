'use client';

import { useState, useCallback, useEffect } from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { AccountOverview } from '@/components/dashboard/AccountOverview';
import { Watchlist } from '@/components/dashboard/Watchlist';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { OrderBookPanel } from '@/components/order-book/OrderBookPanel';
import { OrderEntry } from '@/components/trading/OrderEntry';
import { PositionList } from '@/components/trading/PositionList';
import { OrderHistory } from '@/components/trading/OrderHistory';
import { AlertListPanel } from '@/components/alerts/AlertListPanel';
import { AlertConfigModal } from '@/components/alerts/AlertConfigModal';
import { NewsFeedPanel } from '@/components/news/NewsFeedPanel';
import { cn } from '@/lib/utils';

function StatusBar() {
  const [time, setTime] = useState<string>('--:--:--');

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-5 bg-surface-2 border-t border-border flex items-center justify-between px-2 text-[10px] text-muted-foreground">
      <div className="flex items-center gap-3">
        <span>ALPACA PAPER</span>
        <span className="text-foreground">•</span>
        <span>IEX</span>
      </div>
      <div className="flex items-center gap-3">
        <span>v0.1.0</span>
        <span className="font-mono">{time}</span>
      </div>
    </div>
  );
}

type BottomTab = 'orders' | 'alerts' | 'news';

export default function TradingTerminal() {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [bottomTab, setBottomTab] = useState<BottomTab>('orders');

  const handleSelectSymbol = useCallback((symbol: string) => {
    setSelectedSymbol(symbol);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top Bar - Account Overview */}
      <AccountOverview />

      {/* Main Content - Resizable panels */}
      <Group orientation="horizontal" className="flex-1">
        {/* Left Panel - Watchlist */}
        <Panel id="watchlist" defaultSize="15%" minSize="10%" maxSize="25%">
          <Watchlist
            onSelectSymbol={handleSelectSymbol}
            selectedSymbol={selectedSymbol}
            className="h-full"
          />
        </Panel>

        <Separator className="w-1 bg-border hover:bg-primary/50 transition-colors cursor-col-resize" />

        {/* Center Panel - Chart + Order Book */}
        <Panel id="center" defaultSize="55%" minSize="30%">
          <Group orientation="vertical" className="h-full">
            {/* Chart */}
            <Panel id="chart" defaultSize="70%" minSize="30%">
              <div className="h-full flex flex-col border-r border-border">
                {/* Symbol header */}
                <div className="h-7 bg-surface-1 border-b border-border flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-sm">{selectedSymbol}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">NASDAQ</span>
                  </div>
                </div>

                {/* Chart */}
                <ChartContainer
                  symbol={selectedSymbol}
                  className="flex-1 min-h-0"
                />
              </div>
            </Panel>

            <Separator className="h-1 bg-border hover:bg-primary/50 transition-colors cursor-row-resize" />

            {/* Order Book (2D/3D toggle) */}
            <Panel id="orderbook" defaultSize="30%" minSize="15%" maxSize="50%">
              <OrderBookPanel symbol={selectedSymbol} className="h-full border-r border-border" />
            </Panel>
          </Group>
        </Panel>

        <Separator className="w-1 bg-border hover:bg-primary/50 transition-colors cursor-col-resize" />

        {/* Right Panel - Trading */}
        <Panel id="trading" defaultSize="30%" minSize="20%" maxSize="40%">
          <Group orientation="vertical" className="h-full">
            {/* Order Entry */}
            <Panel id="order-entry" defaultSize="35%" minSize="25%" maxSize="50%">
              <OrderEntry symbol={selectedSymbol} className="h-full" />
            </Panel>

            <Separator className="h-1 bg-border hover:bg-primary/50 transition-colors cursor-row-resize" />

            {/* Positions */}
            <Panel id="positions" defaultSize="30%" minSize="15%">
              <PositionList
                onSelectSymbol={handleSelectSymbol}
                className="h-full"
              />
            </Panel>

            <Separator className="h-1 bg-border hover:bg-primary/50 transition-colors cursor-row-resize" />

            {/* Orders / Alerts / News Tabs */}
            <Panel id="orders" defaultSize="35%" minSize="15%">
              <div className="h-full flex flex-col terminal-panel">
                {/* Tab header */}
                <div className="h-6 bg-surface-2 border-b border-border flex items-center gap-0.5 px-1">
                  <button
                    onClick={() => setBottomTab('orders')}
                    className={cn(
                      'px-2 py-0.5 text-[10px] uppercase tracking-wider transition-colors',
                      bottomTab === 'orders'
                        ? 'text-foreground bg-surface-3'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Orders
                  </button>
                  <button
                    onClick={() => setBottomTab('alerts')}
                    className={cn(
                      'px-2 py-0.5 text-[10px] uppercase tracking-wider transition-colors',
                      bottomTab === 'alerts'
                        ? 'text-foreground bg-surface-3'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Alerts
                  </button>
                  <button
                    onClick={() => setBottomTab('news')}
                    className={cn(
                      'px-2 py-0.5 text-[10px] uppercase tracking-wider transition-colors',
                      bottomTab === 'news'
                        ? 'text-foreground bg-surface-3'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    News
                  </button>
                </div>
                {/* Tab content */}
                <div className="flex-1 min-h-0 overflow-hidden">
                  {bottomTab === 'orders' && <OrderHistory className="h-full" />}
                  {bottomTab === 'alerts' && <AlertListPanel />}
                  {bottomTab === 'news' && (
                    <NewsFeedPanel
                      symbol={selectedSymbol}
                      onSymbolClick={handleSelectSymbol}
                    />
                  )}
                </div>
              </div>
            </Panel>
          </Group>
        </Panel>
      </Group>

      {/* Bottom Status Bar */}
      <StatusBar />

      {/* Modals */}
      <AlertConfigModal symbol={selectedSymbol} />
    </div>
  );
}
