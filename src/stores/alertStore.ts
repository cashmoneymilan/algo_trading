import { create } from 'zustand';
import { persist, createJSONStorage, subscribeWithSelector } from 'zustand/middleware';
import type { Alert, CreateAlertInput, AlertStatus } from '@/types/alerts';

interface AlertState {
  // State
  alerts: Alert[];
  notificationPermission: NotificationPermission | 'default';

  // Actions
  addAlert: (input: CreateAlertInput) => string;
  removeAlert: (id: string) => void;
  updateAlert: (id: string, updates: Partial<Alert>) => void;
  triggerAlert: (id: string) => void;
  setAlertStatus: (id: string, status: AlertStatus) => void;
  clearTriggeredAlerts: () => void;
  clearAllAlerts: () => void;
  setNotificationPermission: (permission: NotificationPermission) => void;

  // Selectors (for convenience)
  getActiveAlerts: () => Alert[];
  getAlertsForSymbol: (symbol: string) => Alert[];
}

export const useAlertStore = create<AlertState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state
        alerts: [],
        notificationPermission: 'default',

        // Add a new alert
        addAlert: (input: CreateAlertInput) => {
          const id = crypto.randomUUID();
          const alert: Alert = {
            id,
            symbol: input.symbol.toUpperCase(),
            condition: input.condition,
            value: input.value,
            status: 'active',
            message: input.message,
            createdAt: Date.now(),
            expiresAt: input.expiresAt,
            repeatOnce: input.repeatOnce ?? true,
          };

          set((state) => ({
            alerts: [...state.alerts, alert],
          }));

          return id;
        },

        // Remove an alert
        removeAlert: (id: string) => {
          set((state) => ({
            alerts: state.alerts.filter((a) => a.id !== id),
          }));
        },

        // Update an alert
        updateAlert: (id: string, updates: Partial<Alert>) => {
          set((state) => ({
            alerts: state.alerts.map((a) =>
              a.id === id ? { ...a, ...updates } : a
            ),
          }));
        },

        // Trigger an alert (mark as triggered)
        triggerAlert: (id: string) => {
          set((state) => ({
            alerts: state.alerts.map((a) => {
              if (a.id !== id) return a;
              return {
                ...a,
                status: a.repeatOnce ? 'triggered' : 'active',
                triggeredAt: Date.now(),
              };
            }),
          }));
        },

        // Set alert status
        setAlertStatus: (id: string, status: AlertStatus) => {
          set((state) => ({
            alerts: state.alerts.map((a) =>
              a.id === id ? { ...a, status } : a
            ),
          }));
        },

        // Clear all triggered alerts
        clearTriggeredAlerts: () => {
          set((state) => ({
            alerts: state.alerts.filter((a) => a.status !== 'triggered'),
          }));
        },

        // Clear all alerts
        clearAllAlerts: () => {
          set({ alerts: [] });
        },

        // Set notification permission
        setNotificationPermission: (permission: NotificationPermission) => {
          set({ notificationPermission: permission });
        },

        // Get active alerts only
        getActiveAlerts: () => {
          return get().alerts.filter((a) => a.status === 'active');
        },

        // Get alerts for a specific symbol
        getAlertsForSymbol: (symbol: string) => {
          const upperSymbol = symbol.toUpperCase();
          return get().alerts.filter((a) => a.symbol === upperSymbol);
        },
      }),
      {
        name: 'trading-alerts',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          alerts: state.alerts,
          notificationPermission: state.notificationPermission,
        }),
      }
    )
  )
);

// Selectors
export const selectActiveAlerts = (state: AlertState) =>
  state.alerts.filter((a) => a.status === 'active');

export const selectTriggeredAlerts = (state: AlertState) =>
  state.alerts.filter((a) => a.status === 'triggered');

export const selectAlertsBySymbol = (symbol: string) => (state: AlertState) =>
  state.alerts.filter((a) => a.symbol === symbol.toUpperCase());
