'use client';

import { cn } from '@/lib/utils';
import { useAlertStore } from '@/stores/alertStore';
import { useUIStore } from '@/stores/uiStore';
import { ALERT_CONDITION_LABELS } from '@/types/alerts';
import { formatAlertValue } from '@/hooks/useAlerts';
import type { Alert, AlertStatus } from '@/types/alerts';

const STATUS_COLORS: Record<AlertStatus, string> = {
  active: 'text-bullish',
  triggered: 'text-amber-500',
  expired: 'text-muted-foreground',
  disabled: 'text-muted-foreground',
};

const STATUS_LABELS: Record<AlertStatus, string> = {
  active: 'Active',
  triggered: 'Triggered',
  expired: 'Expired',
  disabled: 'Disabled',
};

function AlertItem({ alert }: { alert: Alert }) {
  const removeAlert = useAlertStore((state) => state.removeAlert);
  const setAlertStatus = useAlertStore((state) => state.setAlertStatus);

  const handleToggle = () => {
    if (alert.status === 'active') {
      setAlertStatus(alert.id, 'disabled');
    } else if (alert.status === 'disabled' || alert.status === 'triggered') {
      setAlertStatus(alert.id, 'active');
    }
  };

  return (
    <div className="px-3 py-2 border-b border-border hover:bg-surface-2/50 transition-colors group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* Symbol and condition */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-medium">{alert.symbol}</span>
            <span className={cn('text-[10px] uppercase', STATUS_COLORS[alert.status])}>
              {STATUS_LABELS[alert.status]}
            </span>
          </div>

          {/* Condition details */}
          <div className="text-xs text-muted-foreground mt-0.5">
            {ALERT_CONDITION_LABELS[alert.condition]}:{' '}
            <span className="text-foreground">
              {formatAlertValue(alert.condition, alert.value)}
            </span>
          </div>

          {/* Custom message */}
          {alert.message && (
            <div className="text-[10px] text-muted-foreground mt-1 truncate">
              &quot;{alert.message}&quot;
            </div>
          )}

          {/* Triggered time */}
          {alert.triggeredAt && (
            <div className="text-[10px] text-amber-500 mt-1">
              Triggered {new Date(alert.triggeredAt).toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Toggle button */}
          <button
            onClick={handleToggle}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            title={alert.status === 'active' ? 'Disable' : 'Enable'}
          >
            {alert.status === 'active' ? (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>

          {/* Delete button */}
          <button
            onClick={() => removeAlert(alert.id)}
            className="p-1 text-muted-foreground hover:text-destructive transition-colors"
            title="Delete"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export function AlertListPanel() {
  const alerts = useAlertStore((state) => state.alerts);
  const clearTriggeredAlerts = useAlertStore((state) => state.clearTriggeredAlerts);
  const openModal = useUIStore((state) => state.openModal);

  const activeAlerts = alerts.filter((a) => a.status === 'active');
  const triggeredAlerts = alerts.filter((a) => a.status === 'triggered');
  const otherAlerts = alerts.filter((a) => a.status === 'disabled' || a.status === 'expired');

  const hasTriggered = triggeredAlerts.length > 0;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          Alerts ({alerts.length})
        </span>
        <div className="flex items-center gap-2">
          {hasTriggered && (
            <button
              onClick={clearTriggeredAlerts}
              className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear Triggered
            </button>
          )}
          <button
            onClick={() => openModal('alert-config')}
            className="flex items-center gap-1 px-2 py-1 text-[10px] uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New
          </button>
        </div>
      </div>

      {/* Alert list */}
      <div className="flex-1 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <svg className="w-8 h-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-xs">No alerts configured</p>
            <button
              onClick={() => openModal('alert-config')}
              className="mt-2 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              Create your first alert
            </button>
          </div>
        ) : (
          <>
            {/* Active alerts */}
            {activeAlerts.length > 0 && (
              <div>
                <div className="px-3 py-1 text-[9px] uppercase tracking-wider text-muted-foreground bg-surface-2">
                  Active ({activeAlerts.length})
                </div>
                {activeAlerts.map((alert) => (
                  <AlertItem key={alert.id} alert={alert} />
                ))}
              </div>
            )}

            {/* Triggered alerts */}
            {triggeredAlerts.length > 0 && (
              <div>
                <div className="px-3 py-1 text-[9px] uppercase tracking-wider text-amber-500 bg-amber-500/10">
                  Triggered ({triggeredAlerts.length})
                </div>
                {triggeredAlerts.map((alert) => (
                  <AlertItem key={alert.id} alert={alert} />
                ))}
              </div>
            )}

            {/* Disabled/Expired alerts */}
            {otherAlerts.length > 0 && (
              <div>
                <div className="px-3 py-1 text-[9px] uppercase tracking-wider text-muted-foreground bg-surface-2">
                  Inactive ({otherAlerts.length})
                </div>
                {otherAlerts.map((alert) => (
                  <AlertItem key={alert.id} alert={alert} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
