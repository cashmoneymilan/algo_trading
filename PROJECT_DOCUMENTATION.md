# Algo Trading Platform - Complete Project Documentation

> A modern algorithmic trading platform built with Next.js, featuring real-time market data, 3D order book visualization, technical indicators, and a professional terminal-style UI.

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Environment Setup](#4-environment-setup)
5. [Configuration Files](#5-configuration-files)
6. [Design System & Styling](#6-design-system--styling)
7. [State Management (Zustand Stores)](#7-state-management-zustand-stores)
8. [API Layer](#8-api-layer)
9. [Real-time Data (WebSocket)](#9-real-time-data-websocket)
10. [UI Components](#10-ui-components)
11. [Features Implemented](#11-features-implemented)
12. [Challenges & Solutions](#12-challenges--solutions)
13. [Future Directions](#13-future-directions)
14. [Recreation Guide](#14-recreation-guide)

---

## 1. Project Overview

### What It Is
A professional-grade algorithmic trading terminal that connects to Alpaca Markets API for:
- Real-time market data streaming
- Paper trading (buy/sell stocks)
- Portfolio management
- Technical analysis with indicators
- Price alerts with notifications
- News feed integration

### Key Differentiators
- **3D Order Book Visualization** using Three.js/React Three Fiber
- **Terminal-style UI** with dark mode optimized for traders
- **Web Worker architecture** for WebSocket handling (no main thread blocking)
- **Full technical indicator suite** (SMA, EMA, RSI, MACD, Bollinger, VWAP)
- **Global hotkey system** for keyboard-driven trading

---

## 2. Tech Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Framework** | Next.js | 16.1.1 | Full-stack React with App Router |
| **Runtime** | React | 19.2.3 | UI library |
| **Language** | TypeScript | 5.x | Type safety |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS |
| **Components** | shadcn/ui | - | Radix-based UI primitives |
| **State** | Zustand | 5.0.9 | Global state management |
| **2D Charts** | Lightweight Charts | 5.1.0 | TradingView charting |
| **3D Graphics** | Three.js + R3F | 0.182 / 9.5 | WebGL visualization |
| **Icons** | Lucide React | 0.562 | Icon library |
| **Notifications** | Sonner | 2.0.7 | Toast notifications |
| **Layout** | react-resizable-panels | 4.3.3 | Resizable panel system |
| **Theming** | next-themes | 0.4.6 | Dark/light mode |

### Full Dependencies

```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-popover": "^1.1.15",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-separator": "^1.1.8",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-tooltip": "^1.2.8",
    "@react-three/drei": "^10.7.7",
    "@react-three/fiber": "^9.5.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "immer": "^11.1.3",
    "lightweight-charts": "^5.1.0",
    "lucide-react": "^0.562.0",
    "next": "16.1.1",
    "next-themes": "^0.4.6",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "react-resizable-panels": "^4.3.3",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.4.0",
    "three": "^0.182.0",
    "zustand": "^5.0.9"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/three": "^0.182.0",
    "eslint": "^9",
    "eslint-config-next": "16.1.1",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

---

## 3. Project Structure

```
algo_trading/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/alpaca/               # API proxy routes
│   │   │   ├── account/route.ts      # GET account info
│   │   │   ├── positions/route.ts    # GET/DELETE positions
│   │   │   ├── orders/route.ts       # GET/POST/DELETE orders
│   │   │   ├── market-data/route.ts  # GET bars, quotes, trades
│   │   │   ├── news/route.ts         # GET news articles
│   │   │   └── ws-credentials/route.ts # GET WebSocket creds
│   │   ├── globals.css               # Theme & design system
│   │   ├── layout.tsx                # Root layout with fonts
│   │   ├── page.tsx                  # Main trading terminal
│   │   └── providers.tsx             # Context providers
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── ...
│   │   ├── alerts/
│   │   │   ├── AlertConfigModal.tsx  # Create alert form
│   │   │   ├── AlertListPanel.tsx    # Alert management
│   │   │   └── AlertMonitor.tsx      # Background monitor
│   │   ├── charts/
│   │   │   ├── ChartContainer.tsx    # Main chart + indicators
│   │   │   └── ChartToolbar.tsx      # Chart controls
│   │   ├── dashboard/
│   │   │   ├── AccountOverview.tsx   # Account metrics bar
│   │   │   └── Watchlist.tsx         # Symbol watchlist
│   │   ├── hotkeys/
│   │   │   ├── HotkeyProvider.tsx    # Keyboard shortcuts
│   │   │   └── HotkeyHelpModal.tsx   # Help overlay
│   │   ├── news/
│   │   │   ├── NewsFeedPanel.tsx     # News feed
│   │   │   └── NewsItem.tsx          # Single article
│   │   ├── order-book/
│   │   │   ├── OrderBook2D.tsx       # Tabular order book
│   │   │   ├── OrderBook3DWrapper.tsx # 3D wrapper
│   │   │   └── OrderBookPanel.tsx    # 2D/3D toggle
│   │   ├── three/
│   │   │   ├── OrderBookMesh.tsx     # WebGL order book
│   │   │   └── Scene.tsx             # Three.js canvas
│   │   └── trading/
│   │       ├── OrderEntry.tsx        # Buy/sell form
│   │       ├── OrderHistory.tsx      # Order list
│   │       └── PositionList.tsx      # Position table
│   │
│   ├── config/
│   │   ├── colors.ts                 # Color tokens for JS
│   │   └── constants.ts              # API URLs, WS config
│   │
│   ├── hooks/
│   │   ├── useAlerts.ts              # Alert monitoring
│   │   ├── useAlpacaWebSocket.ts     # WebSocket connection
│   │   ├── useMarketData.ts          # Market data fetching
│   │   ├── useNews.ts                # News polling
│   │   └── useReducedMotion.ts       # Accessibility
│   │
│   ├── lib/
│   │   ├── alpaca/
│   │   │   ├── client.ts             # Alpaca API client
│   │   │   └── transforms.ts         # Data transformations
│   │   ├── indicators/
│   │   │   └── calculations.ts       # Technical indicators
│   │   └── utils.ts                  # cn() helper
│   │
│   ├── stores/                       # Zustand stores
│   │   ├── alertStore.ts             # Alert state
│   │   ├── marketDataStore.ts        # Quotes, trades, bars
│   │   ├── newsStore.ts              # News cache
│   │   ├── orderBookStore.ts         # Order book state
│   │   ├── tradingStore.ts           # Account, positions
│   │   └── uiStore.ts                # UI preferences
│   │
│   ├── types/
│   │   ├── alerts.ts
│   │   ├── alpaca.ts
│   │   ├── indicators.ts
│   │   ├── news.ts
│   │   └── trading.ts
│   │
│   └── workers/
│       └── websocket.worker.ts       # WebSocket Web Worker
│
├── public/                           # Static assets
├── .env.local                        # API keys (not committed)
├── .env.example                      # Template for env vars
├── components.json                   # shadcn/ui config
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. Environment Setup

### Required Environment Variables

Create `.env.local` in project root:

```bash
# Alpaca API Configuration
# Get your keys from https://app.alpaca.markets/

ALPACA_API_KEY_ID=your_api_key_here
ALPACA_API_SECRET=your_api_secret_here
ALPACA_PAPER=true  # Use paper trading (recommended)
```

### Getting Alpaca API Keys
1. Sign up at [alpaca.markets](https://alpaca.markets)
2. Navigate to Paper Trading > API Keys
3. Generate new API key pair
4. Copy Key ID and Secret Key to `.env.local`

---

## 5. Configuration Files

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "noEmit": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### components.json (shadcn/ui)
```json
{
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

### postcss.config.mjs
```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

---

## 6. Design System & Styling

### Color Architecture (OKLCH)

The design system uses **OKLCH color space** for perceptually uniform colors.

#### Dark Mode (Default)
```css
/* Layered surfaces - NOT pure black */
--background: oklch(0.11 0.015 280);      /* Deep purple-tinted */
--surface-1: oklch(0.14 0.015 280);
--surface-2: oklch(0.17 0.015 280);
--surface-3: oklch(0.20 0.015 280);

/* Trading colors */
--bullish: oklch(0.72 0.19 145);          /* Bright green */
--bearish: oklch(0.65 0.22 25);           /* Bright red */

/* Colorblind alternatives */
--bullish-alt: oklch(0.65 0.2 255);       /* Blue */
--bearish-alt: oklch(0.75 0.18 75);       /* Orange */

/* Primary accent */
--primary: oklch(0.65 0.2 265);           /* Indigo */
```

### Terminal-Style CSS Classes

```css
.terminal-panel {
  @apply bg-surface-1 border border-border;
}

.terminal-button-buy {
  @apply bg-bullish/20 text-bullish border-bullish/30
         hover:bg-bullish/30;
}

.terminal-button-sell {
  @apply bg-bearish/20 text-bearish border-bearish/30
         hover:bg-bearish/30;
}

.data-table {
  @apply w-full text-[10px];
}

.data-table th {
  @apply text-left text-muted-foreground uppercase
         tracking-wider font-normal px-1 py-0.5;
}
```

### Font Stack
- **Primary**: Geist Sans (variable)
- **Monospace**: Geist Mono (for prices, data)

---

## 7. State Management (Zustand Stores)

### marketDataStore
Real-time quotes, trades, and OHLCV bars.

```typescript
interface MarketDataState {
  quotes: Record<string, Quote>;
  trades: Record<string, Trade[]>;      // Max 1000 per symbol
  bars: Record<string, Bar[]>;          // Max 500 per symbol
  subscribedSymbols: Set<string>;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
}
```

**Key Pattern**: `getMarketDataState()` for non-reactive access (used in Three.js useFrame)

### tradingStore
Account, positions, and orders with API integration.

```typescript
interface TradingState {
  account: Account | null;
  positions: Position[];
  orders: Order[];
  // Loading and error states for each
}
```

### uiStore (Persisted)
User preferences saved to localStorage.

```typescript
interface UIState {
  theme: 'dark' | 'light' | 'system';
  colorblindMode: boolean;
  indicators: IndicatorSettings;
  hotkeys: HotkeyBindings;
  // Chart preferences, layout, etc.
}
```

### alertStore (Persisted)
Price/volume alerts with notification support.

```typescript
interface AlertState {
  alerts: Alert[];
  notificationPermission: NotificationPermission;
}
```

---

## 8. API Layer

### Alpaca Client (`/lib/alpaca/client.ts`)

```typescript
// Account
getAccount(): Promise<AlpacaAccount>

// Positions
getPositions(): Promise<AlpacaPosition[]>
closePosition(symbol): Promise<AlpacaOrder>
closeAllPositions(): Promise<AlpacaOrder[]>

// Orders
createOrder(params): Promise<AlpacaOrder>
getOrders(status): Promise<AlpacaOrder[]>
cancelOrder(orderId): Promise<void>
cancelAllOrders(): Promise<void>

// Market Data
getBars(symbol, timeframe, start?, end?, limit?): Promise<{ bars: Bar[] }>
getLatestQuote(symbol): Promise<Quote>

// News
getNews(symbols?, limit?): Promise<NewsResponse>
```

### API Routes

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/alpaca/account` | GET | Account info |
| `/api/alpaca/positions` | GET, DELETE | Position management |
| `/api/alpaca/orders` | GET, POST, DELETE | Order management |
| `/api/alpaca/market-data` | GET | Bars, quotes, trades |
| `/api/alpaca/news` | GET | News articles |
| `/api/alpaca/ws-credentials` | GET | WebSocket auth |

---

## 9. Real-time Data (WebSocket)

### Architecture
```
React Component
      ↓
useAlpacaWebSocket hook
      ↓
Web Worker (websocket.worker.ts)
      ↓
Alpaca WebSocket (IEX feed)
      ↓
Batched messages (50ms)
      ↓
Zustand store updates
```

### Why Web Worker?
- Keeps main thread free for UI
- Message batching reduces React re-renders
- Handles reconnection logic independently

### WebSocket URLs
- Paper: `wss://stream.data.sandbox.alpaca.markets/v2/iex`
- Live: `wss://stream.data.alpaca.markets/v2/iex`

### Message Types
- `q` (Quote): Real-time bid/ask
- `t` (Trade): Executed trades
- `b` (Bar): OHLCV aggregates

---

## 10. UI Components

### Core Layout (`page.tsx`)
```
┌─────────────────────────────────────────────────────────┐
│ AccountOverview (account metrics bar)                   │
├──────────┬──────────────────────────────┬───────────────┤
│          │                              │               │
│ Watchlist│      ChartContainer          │  OrderEntry   │
│          │      (with toolbar)          │               │
│          │                              ├───────────────┤
│          ├──────────────────────────────┤  PositionList │
│          │                              │               │
│          │      OrderBookPanel          ├───────────────┤
│          │      (2D/3D toggle)          │  Orders/      │
│          │                              │  Alerts/News  │
├──────────┴──────────────────────────────┴───────────────┤
│ StatusBar                                               │
└─────────────────────────────────────────────────────────┘
```

### Component Highlights

**ChartContainer**: Lightweight Charts with 7 technical indicators
- Candlestick, Heikin-Ashi, Line chart types
- SMA, EMA, Bollinger Bands, VWAP (overlays)
- RSI, MACD, Volume (panes)

**OrderBookMesh**: Three.js InstancedMesh
- Single draw call for 50+ price levels
- On-demand rendering (frameloop: demand)
- Direct state access via `getState()` (no React re-renders)

**HotkeyProvider**: Global keyboard shortcuts
- Skips inputs (INPUT, TEXTAREA, SELECT)
- Configurable bindings
- `?` key shows help overlay

---

## 11. Features Implemented

### Phase 1: Foundation ✅
- [x] Next.js 16 + TypeScript setup
- [x] Tailwind CSS v4 with OKLCH colors
- [x] shadcn/ui components (New York style)
- [x] Dark mode with layered surfaces
- [x] Alpaca API proxy routes
- [x] Zustand stores with persistence

### Phase 2: Real-time Data ✅
- [x] WebSocket via Web Worker
- [x] Message batching (50ms)
- [x] Auto-reconnection
- [x] Quote/trade/bar streaming

### Phase 3: Charts ✅
- [x] Lightweight Charts integration
- [x] Candlestick + Heikin-Ashi + Line
- [x] Timeframe selector (1m to 1D)
- [x] Technical indicators (7 total)
- [x] Indicator toggle UI

### Phase 4: 3D Order Book ✅
- [x] React Three Fiber canvas
- [x] InstancedMesh for performance
- [x] OrbitControls (pan/zoom/rotate)
- [x] On-demand rendering
- [x] Demo data fallback

### Phase 5: Trading ✅
- [x] Order entry (market/limit)
- [x] Position list with P&L
- [x] Order history (open/closed)
- [x] Cancel orders
- [x] Close positions

### Phase 6: Dashboard ✅
- [x] Account overview bar
- [x] Watchlist with real-time quotes
- [x] Resizable panels
- [x] Status indicators

### Phase 7: Quick Wins ✅
- [x] Price/volume alerts
- [x] Toast + browser notifications
- [x] Global hotkeys
- [x] News feed (Alpaca API)
- [x] Colorblind mode
- [x] Reduced motion support

---

## 12. Challenges & Solutions

### Challenge 1: Hydration Errors with Mock Data
**Problem**: `Math.random()` generated different values on server vs client.
**Solution**: Use deterministic mock data arrays instead of random generation.

### Challenge 2: react-resizable-panels v4 API Changes
**Problem**: Breaking changes in v4 (exports renamed).
**Solution**:
- `PanelGroup` → `Group`
- `PanelResizeHandle` → `Separator`
- `direction` → `orientation`

### Challenge 3: Three.js Performance in React
**Problem**: React re-renders causing frame drops.
**Solution**:
- Use `getState()` instead of hooks in `useFrame`
- InstancedMesh for repeated geometry
- On-demand rendering (`frameloop: "demand"`)
- `invalidate()` only when data changes

### Challenge 4: WebSocket Message Flood
**Problem**: High-frequency updates causing UI lag.
**Solution**: Web Worker with 50ms message batching before posting to main thread.

### Challenge 5: Quote Type Mismatch
**Problem**: Alert hook used `askPrice`/`bidPrice` but type defined `ask`/`bid`.
**Solution**: Updated hook to use correct property names from Quote interface.

---

## 13. Future Directions

### Short-term Enhancements
- [ ] Portfolio treemap visualization
- [ ] Indicator parameter configuration modal
- [ ] Order confirmation dialogs
- [ ] Sound alerts
- [ ] Workspace save/load

### Medium-term Features
- [ ] Backtesting engine
- [ ] Strategy builder UI
- [ ] Multi-chart layout
- [ ] Options chain viewer
- [ ] Custom indicator builder

### Long-term Vision
- [ ] Algorithmic strategy execution
- [ ] Machine learning predictions
- [ ] Social trading features
- [ ] Mobile companion app
- [ ] Multi-broker support

---

## 14. Recreation Guide

### Step 1: Create Next.js Project
```bash
npx create-next-app@latest algo_trading --typescript --tailwind --eslint --app --src-dir
cd algo_trading
```

### Step 2: Install Dependencies
```bash
# Core UI
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-popover @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slot @radix-ui/react-tabs @radix-ui/react-tooltip

# State & Utilities
npm install zustand immer clsx class-variance-authority tailwind-merge

# Charts & 3D
npm install lightweight-charts three @react-three/fiber @react-three/drei

# UI Extras
npm install lucide-react sonner next-themes react-resizable-panels

# Dev Dependencies
npm install -D @types/three
```

### Step 3: Configure shadcn/ui
```bash
npx shadcn@latest init
# Select: New York style, neutral base color, CSS variables
```

### Step 4: Set Up Environment
```bash
cp .env.example .env.local
# Add your Alpaca API keys
```

### Step 5: Create Directory Structure
Follow the structure in Section 3.

### Step 6: Build in Order
1. **Config**: colors.ts, constants.ts
2. **Types**: trading.ts, alpaca.ts, indicators.ts, alerts.ts, news.ts
3. **Lib**: utils.ts, alpaca/client.ts, alpaca/transforms.ts
4. **Stores**: marketDataStore → tradingStore → uiStore → alertStore → newsStore
5. **Workers**: websocket.worker.ts
6. **Hooks**: useMarketData → useAlpacaWebSocket → useAlerts → useNews
7. **Components**: ui/ → dashboard/ → charts/ → trading/ → order-book/ → alerts/ → hotkeys/ → news/
8. **App**: providers.tsx → layout.tsx → page.tsx → api routes

### Step 7: Run Development Server
```bash
npm run dev
```

---

## Appendix: Key Code Patterns

### Zustand Store with Persistence
```typescript
export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'trading-ui-preferences',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

### Non-reactive State Access (for Three.js)
```typescript
// In component
const { bids, asks } = useOrderBookStore.getState();

// In useFrame (no re-renders)
useFrame(() => {
  const state = useOrderBookStore.getState();
  // Update mesh directly
});
```

### WebSocket Message Batching
```typescript
// In worker
let buffer: Message[] = [];
setInterval(() => {
  if (buffer.length > 0) {
    postMessage({ type: 'BATCH', payload: buffer });
    buffer = [];
  }
}, 50);
```

### Indicator Calculation Pattern
```typescript
export function calculateSMA(bars: Bar[], period: number): IndicatorDataPoint[] {
  if (bars.length < period) return [];

  const result: IndicatorDataPoint[] = [];
  for (let i = period - 1; i < bars.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += bars[i - j].close;
    }
    result.push({
      time: toChartTime(bars[i].timestamp),
      value: sum / period,
    });
  }
  return result;
}
```

---

*Documentation generated for algo_trading v0.1.0*
*Last updated: January 2026*
