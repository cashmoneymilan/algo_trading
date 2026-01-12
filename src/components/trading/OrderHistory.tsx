'use client';

import { useEffect, useState } from 'react';
import { useTradingStore } from '@/stores/tradingStore';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';
import { REFRESH_INTERVALS } from '@/config/constants';
import type { Order, OrderStatus } from '@/types/trading';

interface OrderHistoryProps {
  className?: string;
}

function getStatusColor(status: OrderStatus): string {
  switch (status) {
    case 'filled':
      return 'text-bullish';
    case 'canceled':
    case 'expired':
    case 'rejected':
      return 'text-bearish';
    case 'new':
    case 'accepted':
    case 'pending_new':
      return 'text-warning';
    case 'partially_filled':
      return 'text-info';
    default:
      return 'text-muted-foreground';
  }
}

function getStatusAbbrev(status: OrderStatus): string {
  switch (status) {
    case 'filled': return 'FILL';
    case 'canceled': return 'CXLD';
    case 'expired': return 'EXP';
    case 'rejected': return 'REJ';
    case 'new': return 'NEW';
    case 'accepted': return 'ACPT';
    case 'pending_new': return 'PEND';
    case 'partially_filled': return 'PART';
    default: return status.slice(0, 4).toUpperCase();
  }
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function OrderHistory({ className }: OrderHistoryProps) {
  const [activeTab, setActiveTab] = useState<'open' | 'history'>('open');
  const orders = useTradingStore((state) => state.orders);
  const orderHistory = useTradingStore((state) => state.orderHistory);
  const isLoading = useTradingStore((state) => state.isLoadingOrders);
  const fetchOrders = useTradingStore((state) => state.fetchOrders);
  const cancelOrder = useTradingStore((state) => state.cancelOrder);
  const colorblindMode = useUIStore((state) => state.colorblindMode);

  const bullishClass = colorblindMode ? 'text-bullish-alt' : 'text-bullish';
  const bearishClass = colorblindMode ? 'text-bearish-alt' : 'text-bearish';

  useEffect(() => {
    fetchOrders('open');
    const interval = setInterval(() => fetchOrders('open'), REFRESH_INTERVALS.ORDERS);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  useEffect(() => {
    if (activeTab === 'history' && orderHistory.length === 0) {
      fetchOrders('closed');
    }
  }, [activeTab, orderHistory.length, fetchOrders]);

  const handleCancel = async (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await cancelOrder(orderId);
  };

  const displayOrders = activeTab === 'open' ? orders : orderHistory;

  return (
    <div className={cn('terminal-panel flex flex-col', className)}>
      {/* Header with tabs */}
      <div className="terminal-panel-header flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('open')}
            className={cn(
              'text-[10px] uppercase',
              activeTab === 'open' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Open ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              'text-[10px] uppercase',
              activeTab === 'history' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            History
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto terminal-scroll">
        {isLoading && displayOrders.length === 0 ? (
          <div className="p-2 text-[10px] text-muted-foreground">Loading...</div>
        ) : displayOrders.length === 0 ? (
          <div className="p-2 text-[10px] text-muted-foreground">
            {activeTab === 'open' ? 'No open orders' : 'No history'}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>TIME</th>
                <th>SYM</th>
                <th className="text-center">SIDE</th>
                <th className="text-right">QTY</th>
                <th className="text-right">PRC</th>
                <th className="text-center">STS</th>
                {activeTab === 'open' && <th className="w-4"></th>}
              </tr>
            </thead>
            <tbody>
              {displayOrders.map((order) => {
                const isOpen = ['new', 'accepted', 'pending_new', 'partially_filled'].includes(order.status);

                return (
                  <tr key={order.id} className="group">
                    <td className="text-muted-foreground text-[10px]">
                      {formatTime(order.submittedAt)}
                    </td>
                    <td className="font-semibold">{order.symbol}</td>
                    <td className={cn(
                      'text-center text-[10px] uppercase',
                      order.side === 'buy' ? bullishClass : bearishClass
                    )}>
                      {order.side === 'buy' ? 'B' : 'S'}
                    </td>
                    <td className="text-right">{order.qty}</td>
                    <td className="text-right">
                      {order.type === 'limit' && order.limitPrice
                        ? order.limitPrice.toFixed(2)
                        : order.filledAvgPrice
                          ? order.filledAvgPrice.toFixed(2)
                          : 'MKT'}
                    </td>
                    <td className={cn('text-center text-[10px]', getStatusColor(order.status))}>
                      {getStatusAbbrev(order.status)}
                    </td>
                    {activeTab === 'open' && (
                      <td>
                        {isOpen && (
                          <button
                            onClick={(e) => handleCancel(order.id, e)}
                            className="text-muted-foreground hover:text-bearish text-[10px] opacity-0 group-hover:opacity-100"
                          >
                            ×
                          </button>
                        )}
                      </td>
                    )}
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
