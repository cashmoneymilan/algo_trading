'use client';

import { useEffect, useCallback, createContext, useContext, useState, type ReactNode } from 'react';
import { useUIStore, type HotkeyBindings } from '@/stores/uiStore';

interface HotkeyContextValue {
  showHelp: boolean;
  setShowHelp: (show: boolean) => void;
}

const HotkeyContext = createContext<HotkeyContextValue | null>(null);

export function useHotkeyContext() {
  const context = useContext(HotkeyContext);
  if (!context) {
    throw new Error('useHotkeyContext must be used within HotkeyProvider');
  }
  return context;
}

interface HotkeyProviderProps {
  children: ReactNode;
  onQuickBuy?: () => void;
  onQuickSell?: () => void;
  onCancelAll?: () => void;
  onOpenOrderEntry?: () => void;
  onToggleNews?: () => void;
  onToggleWatchlist?: () => void;
  onToggleChart?: () => void;
  onFocusSymbol?: () => void;
}

/**
 * Normalize keyboard event to a combo string like "shift+x" or "ctrl+a"
 */
function normalizeKeyCombo(e: KeyboardEvent): string {
  const parts: string[] = [];

  if (e.ctrlKey || e.metaKey) parts.push('ctrl');
  if (e.altKey) parts.push('alt');
  if (e.shiftKey) parts.push('shift');

  // Get the key, handling special cases
  let key = e.key.toLowerCase();
  if (key === ' ') key = 'space';
  if (key === 'escape') key = 'esc';

  // Don't add modifier keys as the main key
  if (!['control', 'alt', 'shift', 'meta'].includes(key)) {
    parts.push(key);
  }

  return parts.join('+');
}

/**
 * Check if the target element is an input field
 */
function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;

  const tagName = target.tagName.toUpperCase();
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tagName)) return true;
  if (target.isContentEditable) return true;

  return false;
}

export function HotkeyProvider({
  children,
  onQuickBuy,
  onQuickSell,
  onCancelAll,
  onOpenOrderEntry,
  onToggleNews,
  onToggleWatchlist,
  onToggleChart,
  onFocusSymbol,
}: HotkeyProviderProps) {
  const [showHelp, setShowHelp] = useState(false);

  const hotkeys = useUIStore((state) => state.hotkeys);
  const hotkeysEnabled = useUIStore((state) => state.hotkeysEnabled);
  const openModal = useUIStore((state) => state.openModal);
  const toggleNewsPanel = useUIStore((state) => state.toggleNewsPanel);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Skip if hotkeys disabled
      if (!hotkeysEnabled) return;

      // Skip if typing in an input field
      if (isInputElement(e.target)) return;

      const combo = normalizeKeyCombo(e);

      // Match against registered hotkeys
      const actions: Record<keyof HotkeyBindings, () => void> = {
        help: () => setShowHelp(true),
        quickBuy: () => {
          onQuickBuy?.();
          openModal('order-entry-buy');
        },
        quickSell: () => {
          onQuickSell?.();
          openModal('order-entry-sell');
        },
        cancelAll: () => {
          onCancelAll?.();
        },
        openOrderEntry: () => {
          onOpenOrderEntry?.();
          openModal('order-entry');
        },
        toggleNews: () => {
          onToggleNews?.();
          toggleNewsPanel();
        },
        toggleWatchlist: () => {
          onToggleWatchlist?.();
        },
        toggleChart: () => {
          onToggleChart?.();
        },
        focusSymbol: () => {
          onFocusSymbol?.();
          // Focus the symbol search input if it exists
          const searchInput = document.querySelector('[data-symbol-search]') as HTMLInputElement | null;
          if (searchInput) {
            e.preventDefault();
            searchInput.focus();
          }
        },
      };

      // Check if the combo matches any hotkey
      for (const [action, binding] of Object.entries(hotkeys) as [keyof HotkeyBindings, string][]) {
        if (combo === binding.toLowerCase()) {
          e.preventDefault();
          actions[action]?.();
          return;
        }
      }

      // Handle Escape to close help
      if (e.key === 'Escape' && showHelp) {
        e.preventDefault();
        setShowHelp(false);
      }
    },
    [
      hotkeys,
      hotkeysEnabled,
      showHelp,
      openModal,
      toggleNewsPanel,
      onQuickBuy,
      onQuickSell,
      onCancelAll,
      onOpenOrderEntry,
      onToggleNews,
      onToggleWatchlist,
      onToggleChart,
      onFocusSymbol,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <HotkeyContext.Provider value={{ showHelp, setShowHelp }}>
      {children}
    </HotkeyContext.Provider>
  );
}
