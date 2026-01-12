'use client';

import { useAlerts } from '@/hooks/useAlerts';

/**
 * Invisible component that monitors prices and triggers alerts.
 * Rendered at the app root level to ensure alerts work across all pages.
 */
export function AlertMonitor() {
  useAlerts();
  return null;
}
