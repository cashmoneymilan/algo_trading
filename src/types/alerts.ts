// Alert condition types
export type AlertCondition =
  | 'price_above'
  | 'price_below'
  | 'price_crosses'
  | 'percent_change_up'
  | 'percent_change_down'
  | 'volume_above';

// Alert status
export type AlertStatus = 'active' | 'triggered' | 'expired' | 'disabled';

// Single alert configuration
export interface Alert {
  id: string;
  symbol: string;
  condition: AlertCondition;
  value: number;
  status: AlertStatus;
  message?: string;
  createdAt: number;
  triggeredAt?: number;
  expiresAt?: number;
  repeatOnce: boolean; // If true, alert disables after triggering once
}

// Alert creation input (without generated fields)
export interface CreateAlertInput {
  symbol: string;
  condition: AlertCondition;
  value: number;
  message?: string;
  expiresAt?: number;
  repeatOnce?: boolean;
}

// Alert notification payload
export interface AlertNotification {
  id: string;
  alert: Alert;
  currentPrice: number;
  timestamp: number;
}

// Condition display labels
export const ALERT_CONDITION_LABELS: Record<AlertCondition, string> = {
  price_above: 'Price Above',
  price_below: 'Price Below',
  price_crosses: 'Price Crosses',
  percent_change_up: '% Change Up',
  percent_change_down: '% Change Down',
  volume_above: 'Volume Above',
};

// Condition descriptions
export const ALERT_CONDITION_DESCRIPTIONS: Record<AlertCondition, string> = {
  price_above: 'Triggers when price goes above the target',
  price_below: 'Triggers when price goes below the target',
  price_crosses: 'Triggers when price crosses the target (either direction)',
  percent_change_up: 'Triggers when price increases by the percentage',
  percent_change_down: 'Triggers when price decreases by the percentage',
  volume_above: 'Triggers when volume exceeds the target',
};
