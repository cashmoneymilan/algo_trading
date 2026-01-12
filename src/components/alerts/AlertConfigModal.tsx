'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAlertStore } from '@/stores/alertStore';
import { useUIStore } from '@/stores/uiStore';
import type { AlertCondition, CreateAlertInput } from '@/types/alerts';
import { ALERT_CONDITION_LABELS, ALERT_CONDITION_DESCRIPTIONS } from '@/types/alerts';
import { getConditionInputLabel } from '@/hooks/useAlerts';

const CONDITIONS: AlertCondition[] = [
  'price_above',
  'price_below',
  'price_crosses',
  'percent_change_up',
  'percent_change_down',
  'volume_above',
];

interface AlertConfigModalProps {
  symbol?: string;
  onClose?: () => void;
}

export function AlertConfigModal({ symbol: initialSymbol, onClose }: AlertConfigModalProps) {
  const activeModal = useUIStore((state) => state.activeModal);
  const closeModal = useUIStore((state) => state.closeModal);
  const addAlert = useAlertStore((state) => state.addAlert);

  const isOpen = activeModal === 'alert-config';

  const [symbol, setSymbol] = useState(initialSymbol || '');
  const [condition, setCondition] = useState<AlertCondition>('price_above');
  const [value, setValue] = useState('');
  const [message, setMessage] = useState('');
  const [repeatOnce, setRepeatOnce] = useState(true);
  const [error, setError] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSymbol(initialSymbol || '');
      setCondition('price_above');
      setValue('');
      setMessage('');
      setRepeatOnce(true);
      setError('');
    }
  }, [isOpen, initialSymbol]);

  const handleClose = () => {
    closeModal();
    onClose?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!symbol.trim()) {
      setError('Symbol is required');
      return;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      setError('Please enter a valid positive number');
      return;
    }

    const input: CreateAlertInput = {
      symbol: symbol.trim().toUpperCase(),
      condition,
      value: numValue,
      message: message.trim() || undefined,
      repeatOnce,
    };

    addAlert(input);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md terminal-panel">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Create Alert
          </span>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Symbol input */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">
              Symbol
            </label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="AAPL"
              className="w-full px-3 py-2 bg-surface-2 border border-border text-sm font-mono focus:outline-none focus:border-primary"
              autoFocus
            />
          </div>

          {/* Condition selector */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">
              Condition
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CONDITIONS.map((cond) => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => setCondition(cond)}
                  className={cn(
                    'px-3 py-2 text-xs text-left border transition-colors',
                    condition === cond
                      ? 'bg-primary/20 border-primary text-foreground'
                      : 'bg-surface-2 border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                  )}
                >
                  {ALERT_CONDITION_LABELS[cond]}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {ALERT_CONDITION_DESCRIPTIONS[condition]}
            </p>
          </div>

          {/* Value input */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">
              {getConditionInputLabel(condition)}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0.00"
              step="any"
              min="0"
              className="w-full px-3 py-2 bg-surface-2 border border-border text-sm font-mono focus:outline-none focus:border-primary"
            />
          </div>

          {/* Message input */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">
              Custom Message <span className="text-muted-foreground/50">(optional)</span>
            </label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Alert triggered!"
              className="w-full px-3 py-2 bg-surface-2 border border-border text-sm focus:outline-none focus:border-primary"
            />
          </div>

          {/* Repeat option */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRepeatOnce(!repeatOnce)}
              className={cn(
                'w-4 h-4 border flex items-center justify-center transition-colors',
                repeatOnce
                  ? 'bg-primary border-primary'
                  : 'bg-surface-2 border-border'
              )}
            >
              {repeatOnce && (
                <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <span className="text-xs text-muted-foreground">
              Trigger only once (disable after triggered)
            </span>
          </div>

          {/* Error message */}
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-xs uppercase tracking-wider bg-surface-2 border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-xs uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Create Alert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
