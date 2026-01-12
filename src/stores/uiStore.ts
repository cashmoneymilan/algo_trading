import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DEFAULT_INDICATOR_SETTINGS, type IndicatorSettings } from '@/types/indicators';

type Theme = 'dark' | 'light' | 'system';

// Hotkey configuration
export interface HotkeyBindings {
  help: string;
  quickBuy: string;
  quickSell: string;
  cancelAll: string;
  openOrderEntry: string;
  toggleNews: string;
  toggleWatchlist: string;
  toggleChart: string;
  focusSymbol: string;
}

export const DEFAULT_HOTKEYS: HotkeyBindings = {
  help: '?',
  quickBuy: 'b',
  quickSell: 's',
  cancelAll: 'shift+x',
  openOrderEntry: 'o',
  toggleNews: 'n',
  toggleWatchlist: '1',
  toggleChart: '2',
  focusSymbol: '/',
};

interface UIState {
  // Theme
  theme: Theme;
  colorblindMode: boolean;

  // Layout
  sidebarCollapsed: boolean;
  sidebarWidth: number;

  // Chart preferences
  defaultChartType: 'candlestick' | 'heikin-ashi' | 'line';
  defaultTimeframe: '1Min' | '5Min' | '15Min' | '1Hour' | '1Day';
  showVolume: boolean;
  showGrid: boolean;

  // Indicator settings
  indicators: IndicatorSettings;

  // Order book preferences
  orderBookView: '2d' | '3d';
  orderBookAggregation: number;

  // Hotkeys
  hotkeys: HotkeyBindings;
  hotkeysEnabled: boolean;

  // Notifications
  soundEnabled: boolean;
  notificationsEnabled: boolean;

  // News panel
  showNewsPanel: boolean;

  // Modals
  activeModal: string | null;

  // Actions
  setTheme: (theme: Theme) => void;
  toggleColorblindMode: () => void;
  toggleSidebar: () => void;
  setSidebarWidth: (width: number) => void;
  setDefaultChartType: (type: UIState['defaultChartType']) => void;
  setDefaultTimeframe: (timeframe: UIState['defaultTimeframe']) => void;
  toggleVolume: () => void;
  toggleGrid: () => void;
  setOrderBookView: (view: '2d' | '3d') => void;
  setOrderBookAggregation: (aggregation: number) => void;
  toggleSound: () => void;
  toggleNotifications: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;

  // Indicator actions
  updateIndicators: (indicators: Partial<IndicatorSettings>) => void;
  toggleIndicator: (
    indicator: keyof IndicatorSettings,
    enabled?: boolean
  ) => void;
  resetIndicators: () => void;

  // Hotkey actions
  setHotkey: (action: keyof HotkeyBindings, key: string) => void;
  toggleHotkeys: () => void;
  resetHotkeys: () => void;

  // News panel
  toggleNewsPanel: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Defaults
      theme: 'dark',
      colorblindMode: false,
      sidebarCollapsed: false,
      sidebarWidth: 280,
      defaultChartType: 'candlestick',
      defaultTimeframe: '1Day',
      showVolume: true,
      showGrid: true,
      indicators: DEFAULT_INDICATOR_SETTINGS,
      orderBookView: '2d',
      orderBookAggregation: 0.01,
      hotkeys: DEFAULT_HOTKEYS,
      hotkeysEnabled: true,
      soundEnabled: false,
      notificationsEnabled: true,
      showNewsPanel: false,
      activeModal: null,

      // Actions
      setTheme: (theme) => set({ theme }),

      toggleColorblindMode: () =>
        set((state) => ({ colorblindMode: !state.colorblindMode })),

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarWidth: (sidebarWidth) => set({ sidebarWidth }),

      setDefaultChartType: (defaultChartType) => set({ defaultChartType }),

      setDefaultTimeframe: (defaultTimeframe) => set({ defaultTimeframe }),

      toggleVolume: () => set((state) => ({ showVolume: !state.showVolume })),

      toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),

      setOrderBookView: (orderBookView) => set({ orderBookView }),

      setOrderBookAggregation: (orderBookAggregation) =>
        set({ orderBookAggregation }),

      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

      toggleNotifications: () =>
        set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),

      openModal: (activeModal) => set({ activeModal }),

      closeModal: () => set({ activeModal: null }),

      // Indicator actions
      updateIndicators: (updates) =>
        set((state) => ({
          indicators: {
            ...state.indicators,
            ...updates,
          },
        })),

      toggleIndicator: (indicator, enabled) =>
        set((state) => ({
          indicators: {
            ...state.indicators,
            [indicator]: {
              ...state.indicators[indicator],
              enabled:
                enabled !== undefined
                  ? enabled
                  : !state.indicators[indicator].enabled,
            },
          },
        })),

      resetIndicators: () => set({ indicators: DEFAULT_INDICATOR_SETTINGS }),

      // Hotkey actions
      setHotkey: (action, key) =>
        set((state) => ({
          hotkeys: {
            ...state.hotkeys,
            [action]: key,
          },
        })),

      toggleHotkeys: () =>
        set((state) => ({ hotkeysEnabled: !state.hotkeysEnabled })),

      resetHotkeys: () => set({ hotkeys: DEFAULT_HOTKEYS }),

      // News panel
      toggleNewsPanel: () =>
        set((state) => ({ showNewsPanel: !state.showNewsPanel })),
    }),
    {
      name: 'trading-ui-preferences',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist user preferences, not transient state
        theme: state.theme,
        colorblindMode: state.colorblindMode,
        sidebarCollapsed: state.sidebarCollapsed,
        sidebarWidth: state.sidebarWidth,
        defaultChartType: state.defaultChartType,
        defaultTimeframe: state.defaultTimeframe,
        showVolume: state.showVolume,
        showGrid: state.showGrid,
        indicators: state.indicators,
        orderBookView: state.orderBookView,
        orderBookAggregation: state.orderBookAggregation,
        hotkeys: state.hotkeys,
        hotkeysEnabled: state.hotkeysEnabled,
        soundEnabled: state.soundEnabled,
        notificationsEnabled: state.notificationsEnabled,
        showNewsPanel: state.showNewsPanel,
      }),
    }
  )
);

// Selectors
export const selectTheme = (state: UIState) => state.theme;
export const selectColorblindMode = (state: UIState) => state.colorblindMode;
export const selectSidebarCollapsed = (state: UIState) => state.sidebarCollapsed;
export const selectIndicators = (state: UIState) => state.indicators;
export const selectHotkeys = (state: UIState) => state.hotkeys;
export const selectHotkeysEnabled = (state: UIState) => state.hotkeysEnabled;
