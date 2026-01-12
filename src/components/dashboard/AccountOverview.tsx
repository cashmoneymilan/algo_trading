'use client';

import { useEffect } from 'react';
import { useTradingStore } from '@/stores/tradingStore';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';
import { REFRESH_INTERVALS } from '@/config/constants';

interface AccountOverviewProps {
  className?: string;
}

export function AccountOverview({ className }: AccountOverviewProps) {
  const account = useTradingStore((state) => state.account);
  const isLoading = useTradingStore((state) => state.isLoadingAccount);
  const fetchAccount = useTradingStore((state) => state.fetchAccount);
  const colorblindMode = useUIStore((state) => state.colorblindMode);

  const bullishClass = colorblindMode ? 'text-bullish-alt' : 'text-bullish';
  const bearishClass = colorblindMode ? 'text-bearish-alt' : 'text-bearish';

  useEffect(() => {
    fetchAccount();
    const interval = setInterval(fetchAccount, REFRESH_INTERVALS.ACCOUNT);
    return () => clearInterval(interval);
  }, [fetchAccount]);

  if (isLoading && !account) {
    return (
      <div className={cn('h-7 bg-surface-1 border-b border-border flex items-center px-2', className)}>
        <span className="text-xs text-muted-foreground">Loading account...</span>
      </div>
    );
  }

  if (!account) {
    return null;
  }

  const dayPl = account.equity - account.lastEquity;
  const dayPlPercent = (dayPl / account.lastEquity) * 100;
  const isPositive = dayPl >= 0;

  const formatCurrency = (value: number) =>
    value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className={cn(
      'h-7 bg-surface-1 border-b border-border flex items-center justify-between px-2 text-xs font-mono',
      className
    )}>
      {/* Left side - Account metrics */}
      <div className="flex items-center gap-4">
        {/* Status indicator */}
        <div className="flex items-center gap-1.5">
          <span className={cn(
            'status-dot',
            account.status === 'ACTIVE' ? 'status-dot-connected' : 'status-dot-error'
          )} />
          <span className="text-muted-foreground text-[10px] uppercase">{account.accountNumber}</span>
        </div>

        <div className="panel-divider-v h-4" />

        {/* Equity */}
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">EQ</span>
          <span className="text-foreground tabular-nums">${formatCurrency(account.equity)}</span>
        </div>

        {/* Cash */}
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">CASH</span>
          <span className="text-foreground tabular-nums">${formatCurrency(account.cash)}</span>
        </div>

        {/* Buying Power */}
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">BP</span>
          <span className="text-foreground tabular-nums">${formatCurrency(account.buyingPower)}</span>
        </div>

        <div className="panel-divider-v h-4" />

        {/* Day P&L */}
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">DAY P&L</span>
          <span className={cn('tabular-nums', isPositive ? bullishClass : bearishClass)}>
            {isPositive ? '+' : ''}{formatCurrency(dayPl)}
          </span>
          <span className={cn('text-[10px]', isPositive ? bullishClass : bearishClass)}>
            ({isPositive ? '+' : ''}{dayPlPercent.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* Right side - Additional info */}
      <div className="flex items-center gap-3 text-[10px]">
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">DT</span>
          <span className="text-foreground">{account.daytradeCount}/3</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">MKT</span>
          <span className="text-muted-foreground">CLOSED</span>
        </div>
      </div>
    </div>
  );
}
