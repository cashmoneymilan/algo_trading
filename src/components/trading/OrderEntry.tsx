'use client';

import { useState, useCallback } from 'react';
import { useTradingStore } from '@/stores/tradingStore';
import { useMarketData } from '@/hooks/useMarketData';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

interface OrderEntryProps {
  symbol: string;
  className?: string;
}

type OrderSide = 'buy' | 'sell';
type OrderType = 'market' | 'limit';
type TimeInForce = 'day' | 'gtc' | 'ioc';

export function OrderEntry({ symbol, className }: OrderEntryProps) {
  const [side, setSide] = useState<OrderSide>('buy');
  const [orderType, setOrderType] = useState<OrderType>('limit');
  const [tif, setTif] = useState<TimeInForce>('day');
  const [quantity, setQuantity] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const { submitOrder, isSubmittingOrder, orderSubmitError, clearErrors } = useTradingStore();
  const { quote, latestPrice } = useMarketData({ symbol, fetchBars: false });
  const colorblindMode = useUIStore((state) => state.colorblindMode);

  const bullishClass = colorblindMode ? 'text-bullish-alt' : 'text-bullish';
  const bearishClass = colorblindMode ? 'text-bearish-alt' : 'text-bearish';

  const handleSubmit = useCallback(async () => {
    if (!quantity || (orderType === 'limit' && !limitPrice)) {
      return;
    }

    clearErrors();
    setStatus('idle');

    const order = await submitOrder({
      symbol: symbol.toUpperCase(),
      qty: parseFloat(quantity),
      side,
      type: orderType,
      time_in_force: tif,
      ...(orderType === 'limit' && { limit_price: parseFloat(limitPrice) }),
    });

    if (order) {
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
      setQuantity('');
      setLimitPrice('');
    } else {
      setStatus('error');
    }
  }, [symbol, quantity, limitPrice, side, orderType, tif, submitOrder, clearErrors]);

  // Reference price
  const refPrice = quote
    ? (side === 'buy' ? quote.ask : quote.bid)
    : latestPrice || 0;

  // Estimate order value
  const price = orderType === 'limit' && limitPrice ? parseFloat(limitPrice) : refPrice;
  const qty = quantity ? parseFloat(quantity) : 0;
  const estimatedValue = qty * price;

  return (
    <div className={cn('terminal-panel flex flex-col', className)}>
      {/* Header */}
      <div className="terminal-panel-header flex items-center justify-between">
        <span>Order</span>
        <span className="text-foreground font-mono">{symbol}</span>
      </div>

      {/* Order Form */}
      <div className="p-2 space-y-2">
        {/* Side + Type row */}
        <div className="flex gap-1">
          <button
            onClick={() => setSide('buy')}
            className={cn(
              'terminal-button flex-1',
              side === 'buy' ? 'terminal-button-buy' : 'bg-surface-2 text-muted-foreground hover:bg-surface-3'
            )}
          >
            BUY
          </button>
          <button
            onClick={() => setSide('sell')}
            className={cn(
              'terminal-button flex-1',
              side === 'sell' ? 'terminal-button-sell' : 'bg-surface-2 text-muted-foreground hover:bg-surface-3'
            )}
          >
            SELL
          </button>
        </div>

        {/* Order Type */}
        <div className="flex gap-1">
          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value as OrderType)}
            className="terminal-select flex-1"
          >
            <option value="market">MKT</option>
            <option value="limit">LMT</option>
          </select>
          <select
            value={tif}
            onChange={(e) => setTif(e.target.value as TimeInForce)}
            className="terminal-select flex-1"
          >
            <option value="day">DAY</option>
            <option value="gtc">GTC</option>
            <option value="ioc">IOC</option>
          </select>
        </div>

        {/* Quantity */}
        <div className="form-row">
          <label className="form-label">QTY</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
            min="1"
            step="1"
            className="terminal-input flex-1 text-right"
          />
        </div>

        {/* Limit Price - only show for limit orders */}
        {orderType === 'limit' && (
          <div className="form-row">
            <label className="form-label">PRICE</label>
            <input
              type="number"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              placeholder={refPrice?.toFixed(2) || '0.00'}
              step="0.01"
              min="0.01"
              className="terminal-input flex-1 text-right"
            />
          </div>
        )}

        {/* Reference Price */}
        <div className="flex justify-between text-[10px] text-muted-foreground px-1">
          <span>{side === 'buy' ? 'ASK' : 'BID'}</span>
          <span className={cn('font-mono', side === 'buy' ? bearishClass : bullishClass)}>
            {refPrice > 0 ? refPrice.toFixed(2) : '--'}
          </span>
        </div>

        {/* Divider */}
        <div className="panel-divider-h" />

        {/* Order Summary */}
        <div className="space-y-1 text-[10px]">
          <div className="flex justify-between">
            <span className="text-muted-foreground">EST. VALUE</span>
            <span className="font-mono text-foreground">
              {estimatedValue > 0 ? `$${estimatedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '--'}
            </span>
          </div>
        </div>

        {/* Status Messages */}
        {status === 'error' && orderSubmitError && (
          <div className="text-[10px] text-bearish bg-bearish/10 px-2 py-1 border border-bearish/30">
            {orderSubmitError}
          </div>
        )}

        {status === 'success' && (
          <div className="text-[10px] text-bullish bg-bullish/10 px-2 py-1 border border-bullish/30">
            Order submitted
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmittingOrder || !quantity || (orderType === 'limit' && !limitPrice)}
          className={cn(
            'w-full h-7 text-xs font-semibold uppercase tracking-wider transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            side === 'buy'
              ? 'bg-bullish text-white hover:bg-bullish/90'
              : 'bg-bearish text-white hover:bg-bearish/90'
          )}
        >
          {isSubmittingOrder ? 'SENDING...' : `${side.toUpperCase()} ${symbol}`}
        </button>
      </div>
    </div>
  );
}
