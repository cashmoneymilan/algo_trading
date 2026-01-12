# Claude Context Document

> This document provides context for Claude Code sessions. Keep it updated as the project evolves.

---

## Project Summary

**Algo Trading Platform** - A professional-grade algorithmic trading terminal built with Next.js 16, TypeScript, and Alpaca Markets API. Features real-time market data, 3D order book visualization, technical indicators, and a terminal-style UI.

---

## Current State (v0.1.0)

### Completed Features
- Real-time market data via WebSocket (Web Worker architecture)
- Candlestick charts with 7 technical indicators (SMA, EMA, RSI, MACD, Bollinger, VWAP, Volume)
- 3D order book visualization (Three.js/React Three Fiber)
- Order entry (market/limit orders)
- Position management with P&L tracking
- Price/volume alerts with toast + browser notifications
- Global hotkeys (press `?` for help)
- News feed from Alpaca API
- Resizable panel layout
- Dark mode with colorblind support

### Tech Stack
- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript 5.x (strict mode)
- **Styling**: Tailwind CSS 4.x + shadcn/ui (New York style)
- **State**: Zustand 5.x with persistence
- **Charts**: Lightweight Charts 5.1.0
- **3D**: Three.js 0.182 + React Three Fiber 9.5
- **Notifications**: Sonner 2.0.7

---

## Key Files & Patterns

### Entry Points
- `src/app/page.tsx` - Main trading terminal layout
- `src/app/providers.tsx` - Context providers (theme, hotkeys, alerts, toasts)
- `src/app/globals.css` - Design system with OKLCH colors

### State Management (Zustand)
- `src/stores/marketDataStore.ts` - Quotes, trades, bars
- `src/stores/tradingStore.ts` - Account, positions, orders
- `src/stores/uiStore.ts` - UI preferences (persisted)
- `src/stores/alertStore.ts` - Price alerts (persisted)
- `src/stores/newsStore.ts` - News cache
- `src/stores/orderBookStore.ts` - Order book data

### API Layer
- `src/lib/alpaca/client.ts` - Alpaca API client functions
- `src/lib/alpaca/transforms.ts` - Data transformations
- `src/app/api/alpaca/*/route.ts` - API proxy routes

### Real-time Data
- `src/workers/websocket.worker.ts` - WebSocket Web Worker
- `src/hooks/useAlpacaWebSocket.ts` - WebSocket hook

### Key Components
- `src/components/charts/ChartContainer.tsx` - Main chart with indicators
- `src/components/three/OrderBookMesh.tsx` - 3D order book (InstancedMesh)
- `src/components/trading/OrderEntry.tsx` - Order form
- `src/components/alerts/AlertConfigModal.tsx` - Alert creation
- `src/components/hotkeys/HotkeyProvider.tsx` - Keyboard shortcuts

---

## Important Patterns

### 1. Non-reactive State for Three.js
```typescript
// Use getState() in useFrame to avoid React re-renders
useFrame(() => {
  const state = useOrderBookStore.getState();
  // Update mesh directly
});
```

### 2. WebSocket Message Batching
Messages are batched in the Web Worker every 50ms before posting to main thread.

### 3. Persisted Stores
Use Zustand's `persist` middleware with `createJSONStorage(() => localStorage)`.

### 4. Deterministic Mock Data
Avoid `Math.random()` in components to prevent hydration errors.

---

## Environment Variables

```bash
ALPACA_API_KEY_ID=xxx      # Alpaca API key
ALPACA_API_SECRET=xxx      # Alpaca API secret
ALPACA_PAPER=true          # Paper trading mode
```

---

## Common Commands

```bash
npm run dev      # Start dev server (usually port 3001)
npm run build    # Production build
npm run lint     # ESLint check
npx tsc --noEmit # TypeScript check
```

---

## Known Issues & Gotchas

1. **react-resizable-panels v4**: Uses `Group`/`Separator` instead of `PanelGroup`/`PanelResizeHandle`
2. **Lightweight Charts v5**: API changes from v4 - check migration guide
3. **Port 3000 conflicts**: Dev server may run on 3001 if 3000 is occupied
4. **Quote types**: Use `bid`/`ask` not `bidPrice`/`askPrice`

---

## Session History

### Session 1 (Initial Build)
- Set up Next.js project with Tailwind CSS
- Created Alpaca API integration
- Built WebSocket streaming with Web Workers
- Implemented trading components

### Session 2 (UI Polish)
- Fixed hydration errors
- Added resizable panels (react-resizable-panels v4)
- Terminal-style UI redesign
- 3D order book demo data

### Session 3 (Phase 2 Features)
- Technical indicators (SMA, EMA, RSI, MACD, Bollinger, VWAP, Volume)
- Price/volume alert system with notifications
- Global hotkey system
- News feed from Alpaca API
- Project documentation

---

## Future Work

### Short-term
- [ ] Portfolio treemap
- [ ] Indicator parameter modal
- [ ] Order confirmations
- [ ] Sound alerts
- [ ] Workspace save/load

### Medium-term
- [ ] Backtesting engine
- [ ] Strategy builder
- [ ] Options chain
- [ ] Multi-chart layout

### Long-term
- [ ] Algorithmic execution
- [ ] ML predictions
- [ ] Multi-broker support

---

## Documentation

See `PROJECT_DOCUMENTATION.md` for complete project documentation including:
- Full tech stack details
- Complete project structure
- Design system specifications
- All component documentation
- Recreation guide

---

*Last updated: January 2026*
