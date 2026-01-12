// Color tokens for programmatic access (matching globals.css)
// Use these when you need colors in JavaScript/TypeScript

export const colors = {
  dark: {
    background: {
      base: '#16161e',
      surface1: '#1e1e28',
      surface2: '#262632',
      surface3: '#2e2e3c',
      overlay: '#363646',
    },
    text: {
      primary: '#fafafa',
      secondary: '#a1a1aa',
      muted: '#71717a',
    },
    market: {
      bullish: '#22c55e',
      bearish: '#ef4444',
      bullishAlt: '#3b82f6', // Colorblind-safe blue
      bearishAlt: '#f59e0b', // Colorblind-safe orange
      neutral: '#a1a1aa',
    },
    accent: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      info: '#0ea5e9',
      warning: '#f59e0b',
      error: '#ef4444',
      success: '#22c55e',
    },
    chart: {
      color1: '#60a5fa',
      color2: '#34d399',
      color3: '#fbbf24',
      color4: '#f472b6',
      color5: '#a78bfa',
    },
    border: '#3f3f50',
  },
  light: {
    background: {
      base: '#fafafa',
      surface1: '#f5f5f5',
      surface2: '#ebebeb',
      surface3: '#e0e0e0',
      overlay: '#ffffff',
    },
    text: {
      primary: '#18181b',
      secondary: '#52525b',
      muted: '#a1a1aa',
    },
    market: {
      bullish: '#16a34a',
      bearish: '#dc2626',
      bullishAlt: '#2563eb',
      bearishAlt: '#d97706',
      neutral: '#71717a',
    },
    accent: {
      primary: '#4f46e5',
      secondary: '#7c3aed',
      info: '#0284c7',
      warning: '#d97706',
      error: '#dc2626',
      success: '#16a34a',
    },
    chart: {
      color1: '#3b82f6',
      color2: '#10b981',
      color3: '#f59e0b',
      color4: '#ec4899',
      color5: '#8b5cf6',
    },
    border: '#e5e5e5',
  },
} as const;

// Lightweight Charts theme configurations
export const chartTheme = {
  dark: {
    layout: {
      background: { color: colors.dark.background.surface1 },
      textColor: colors.dark.text.secondary,
    },
    grid: {
      vertLines: { color: colors.dark.background.surface3 },
      horzLines: { color: colors.dark.background.surface3 },
    },
    crosshair: {
      vertLine: {
        labelBackgroundColor: colors.dark.accent.primary,
      },
      horzLine: {
        labelBackgroundColor: colors.dark.accent.primary,
      },
    },
    timeScale: {
      borderColor: colors.dark.border,
    },
    rightPriceScale: {
      borderColor: colors.dark.border,
    },
  },
  light: {
    layout: {
      background: { color: colors.light.background.surface1 },
      textColor: colors.light.text.secondary,
    },
    grid: {
      vertLines: { color: colors.light.background.surface3 },
      horzLines: { color: colors.light.background.surface3 },
    },
    crosshair: {
      vertLine: {
        labelBackgroundColor: colors.light.accent.primary,
      },
      horzLine: {
        labelBackgroundColor: colors.light.accent.primary,
      },
    },
    timeScale: {
      borderColor: colors.light.border,
    },
    rightPriceScale: {
      borderColor: colors.light.border,
    },
  },
} as const;

// Candlestick colors
export const candlestickColors = {
  dark: {
    upColor: colors.dark.market.bullish,
    downColor: colors.dark.market.bearish,
    borderUpColor: colors.dark.market.bullish,
    borderDownColor: colors.dark.market.bearish,
    wickUpColor: colors.dark.market.bullish,
    wickDownColor: colors.dark.market.bearish,
  },
  light: {
    upColor: colors.light.market.bullish,
    downColor: colors.light.market.bearish,
    borderUpColor: colors.light.market.bullish,
    borderDownColor: colors.light.market.bearish,
    wickUpColor: colors.light.market.bullish,
    wickDownColor: colors.light.market.bearish,
  },
} as const;

// Colorblind-safe candlestick colors
export const candlestickColorsColorblind = {
  dark: {
    upColor: colors.dark.market.bullishAlt,
    downColor: colors.dark.market.bearishAlt,
    borderUpColor: colors.dark.market.bullishAlt,
    borderDownColor: colors.dark.market.bearishAlt,
    wickUpColor: colors.dark.market.bullishAlt,
    wickDownColor: colors.dark.market.bearishAlt,
  },
  light: {
    upColor: colors.light.market.bullishAlt,
    downColor: colors.light.market.bearishAlt,
    borderUpColor: colors.light.market.bullishAlt,
    borderDownColor: colors.light.market.bearishAlt,
    wickUpColor: colors.light.market.bullishAlt,
    wickDownColor: colors.light.market.bearishAlt,
  },
} as const;
