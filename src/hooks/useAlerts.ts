'use client';

import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { useAlertStore } from '@/stores/alertStore';
import { useMarketDataStore } from '@/stores/marketDataStore';
import type { Alert, AlertCondition } from '@/types/alerts';
import { ALERT_CONDITION_LABELS } from '@/types/alerts';

interface PriceState {
  lastPrice: number;
  basePrice: number; // For percent change calculations
}

/**
 * Hook to monitor prices and trigger alerts
 */
export function useAlerts() {
  const alerts = useAlertStore((state) => state.alerts);
  const triggerAlert = useAlertStore((state) => state.triggerAlert);
  const notificationPermission = useAlertStore((state) => state.notificationPermission);
  const setNotificationPermission = useAlertStore((state) => state.setNotificationPermission);

  // Track previous prices for cross detection
  const priceStateRef = useRef<Map<string, PriceState>>(new Map());

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    } else {
      setNotificationPermission(Notification.permission);
    }
  }, [setNotificationPermission]);

  // Send browser notification
  const sendBrowserNotification = useCallback(
    (alert: Alert, currentPrice: number) => {
      if (notificationPermission !== 'granted') return;
      if (!('Notification' in window)) return;

      const title = `${alert.symbol} Alert`;
      const body =
        alert.message ||
        `${ALERT_CONDITION_LABELS[alert.condition]}: ${alert.value} (Current: $${currentPrice.toFixed(2)})`;

      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: alert.id, // Prevents duplicate notifications
        });
      } catch {
        // Notification failed, possibly in worker or unsupported context
      }
    },
    [notificationPermission]
  );

  // Show toast notification
  const showToastNotification = useCallback((alert: Alert, currentPrice: number) => {
    const message =
      alert.message ||
      `${ALERT_CONDITION_LABELS[alert.condition]}: ${alert.value}`;

    toast.success(`${alert.symbol} Alert Triggered`, {
      description: `${message} (Current: $${currentPrice.toFixed(2)})`,
      duration: 5000,
      action: {
        label: 'Dismiss',
        onClick: () => {},
      },
    });
  }, []);

  // Check if a condition is met
  const checkCondition = useCallback(
    (
      alert: Alert,
      currentPrice: number,
      previousPrice: number | undefined,
      currentVolume?: number
    ): boolean => {
      const { condition, value } = alert;

      switch (condition) {
        case 'price_above':
          return currentPrice > value;

        case 'price_below':
          return currentPrice < value;

        case 'price_crosses':
          if (previousPrice === undefined) return false;
          // Crossed if price moved from one side to the other
          return (
            (previousPrice < value && currentPrice >= value) ||
            (previousPrice > value && currentPrice <= value)
          );

        case 'percent_change_up': {
          const priceState = priceStateRef.current.get(alert.symbol);
          if (!priceState) return false;
          const percentChange =
            ((currentPrice - priceState.basePrice) / priceState.basePrice) * 100;
          return percentChange >= value;
        }

        case 'percent_change_down': {
          const priceState = priceStateRef.current.get(alert.symbol);
          if (!priceState) return false;
          const percentChange =
            ((priceState.basePrice - currentPrice) / priceState.basePrice) * 100;
          return percentChange >= value;
        }

        case 'volume_above':
          return currentVolume !== undefined && currentVolume > value;

        default:
          return false;
      }
    },
    []
  );

  // Monitor market data and check alerts
  useEffect(() => {
    // Subscribe to market data changes
    const unsubscribe = useMarketDataStore.subscribe(
      (state) => state.quotes,
      (quotes) => {
        const activeAlerts = alerts.filter((a) => a.status === 'active');

        for (const alert of activeAlerts) {
          const quote = quotes[alert.symbol];
          if (!quote) continue;

          // Get current and previous price
          const currentPrice = quote.ask || quote.bid || 0;
          if (currentPrice === 0) continue;

          const priceState = priceStateRef.current.get(alert.symbol);
          const previousPrice = priceState?.lastPrice;

          // Initialize base price for percent calculations
          if (!priceState) {
            priceStateRef.current.set(alert.symbol, {
              lastPrice: currentPrice,
              basePrice: currentPrice,
            });
            continue;
          }

          // Check if alert condition is met
          const isTriggered = checkCondition(
            alert,
            currentPrice,
            previousPrice,
            quote.askSize || quote.bidSize
          );

          if (isTriggered) {
            // Trigger the alert
            triggerAlert(alert.id);

            // Send notifications
            showToastNotification(alert, currentPrice);
            sendBrowserNotification(alert, currentPrice);
          }

          // Update price state
          priceStateRef.current.set(alert.symbol, {
            lastPrice: currentPrice,
            basePrice: priceState.basePrice,
          });
        }
      }
    );

    return () => unsubscribe();
  }, [alerts, triggerAlert, checkCondition, showToastNotification, sendBrowserNotification]);

  // Request permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  return {
    requestNotificationPermission,
    notificationPermission,
  };
}

/**
 * Get condition-appropriate input label
 */
export function getConditionInputLabel(condition: AlertCondition): string {
  switch (condition) {
    case 'price_above':
    case 'price_below':
    case 'price_crosses':
      return 'Target Price ($)';
    case 'percent_change_up':
    case 'percent_change_down':
      return 'Percentage (%)';
    case 'volume_above':
      return 'Volume Threshold';
    default:
      return 'Value';
  }
}

/**
 * Format alert value for display
 */
export function formatAlertValue(condition: AlertCondition, value: number): string {
  switch (condition) {
    case 'price_above':
    case 'price_below':
    case 'price_crosses':
      return `$${value.toFixed(2)}`;
    case 'percent_change_up':
    case 'percent_change_down':
      return `${value}%`;
    case 'volume_above':
      return value.toLocaleString();
    default:
      return String(value);
  }
}
