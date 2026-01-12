'use client';

import { useUIStore, type HotkeyBindings, DEFAULT_HOTKEYS } from '@/stores/uiStore';
import { useHotkeyContext } from './HotkeyProvider';

interface HotkeyItem {
  action: keyof HotkeyBindings;
  label: string;
  description: string;
}

const HOTKEY_ITEMS: HotkeyItem[] = [
  { action: 'help', label: 'Help', description: 'Show this help overlay' },
  { action: 'quickBuy', label: 'Quick Buy', description: 'Open buy order entry' },
  { action: 'quickSell', label: 'Quick Sell', description: 'Open sell order entry' },
  { action: 'cancelAll', label: 'Cancel All', description: 'Cancel all open orders' },
  { action: 'openOrderEntry', label: 'Order Entry', description: 'Open order entry panel' },
  { action: 'toggleNews', label: 'Toggle News', description: 'Show/hide news panel' },
  { action: 'toggleWatchlist', label: 'Watchlist', description: 'Focus watchlist panel' },
  { action: 'toggleChart', label: 'Chart', description: 'Focus chart panel' },
  { action: 'focusSymbol', label: 'Search', description: 'Focus symbol search' },
];

function formatKey(key: string): string {
  return key
    .split('+')
    .map((part) => {
      switch (part.toLowerCase()) {
        case 'ctrl':
          return 'Ctrl';
        case 'alt':
          return 'Alt';
        case 'shift':
          return 'Shift';
        case 'esc':
          return 'Esc';
        case 'space':
          return 'Space';
        default:
          return part.toUpperCase();
      }
    })
    .join(' + ');
}

export function HotkeyHelpModal() {
  const { showHelp, setShowHelp } = useHotkeyContext();
  const hotkeys = useUIStore((state) => state.hotkeys);
  const hotkeysEnabled = useUIStore((state) => state.hotkeysEnabled);
  const toggleHotkeys = useUIStore((state) => state.toggleHotkeys);
  const resetHotkeys = useUIStore((state) => state.resetHotkeys);

  if (!showHelp) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setShowHelp(false)}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg terminal-panel">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="text-sm font-medium">Keyboard Shortcuts</span>
          </div>
          <button
            onClick={() => setShowHelp(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            {HOTKEY_ITEMS.map((item) => (
              <div
                key={item.action}
                className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
              >
                <div>
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
                <div className="flex items-center gap-1">
                  {hotkeys[item.action].split('+').map((key, i) => (
                    <span key={i}>
                      {i > 0 && <span className="text-muted-foreground mx-1">+</span>}
                      <kbd className="px-2 py-1 text-xs font-mono bg-surface-3 border border-border rounded">
                        {formatKey(key)}
                      </kbd>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-surface-2/50">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleHotkeys}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <span
                className={`w-8 h-4 rounded-full transition-colors relative ${
                  hotkeysEnabled ? 'bg-primary' : 'bg-surface-3'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${
                    hotkeysEnabled ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </span>
              <span>{hotkeysEnabled ? 'Enabled' : 'Disabled'}</span>
            </button>

            <button
              onClick={resetHotkeys}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Reset to defaults
            </button>
          </div>

          <div className="text-xs text-muted-foreground">
            Press <kbd className="px-1 py-0.5 bg-surface-3 border border-border rounded text-[10px]">Esc</kbd> to close
          </div>
        </div>
      </div>
    </div>
  );
}
