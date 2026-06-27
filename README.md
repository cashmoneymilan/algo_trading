# Algo Trading

A professional-grade algorithmic trading terminal built on Next.js — real-time market data, 3D order book visualization, full technical indicator suite, and a keyboard-driven terminal UI. Connects to Alpaca Markets for paper and live trading.

## What This Is

Algo Trading is a self-hosted trading desk. It streams live market data over WebSocket (handled in a Web Worker so the UI never blocks), renders a 3D order book using Three.js, and gives you a full set of technical indicators on TradingView-style charts. Everything is keyboard-driven with a global hotkey system and designed for dark-mode-first extended use.

## Features

- Real-time market data via Alpaca Markets WebSocket
- Paper trading and live order execution
- 3D order book visualization (Three.js + React Three Fiber)
- Technical indicators: SMA, EMA, RSI, MACD, Bollinger Bands, VWAP
- TradingView-style charting (Lightweight Charts)
- Global hotkey system for keyboard-driven trading
- Price alerts with toast notifications
- News feed integration
- Resizable panel layout
- Web Worker architecture — WebSocket off the main thread

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Components | shadcn/ui (Radix) |
| State | Zustand |
| 2D Charts | Lightweight Charts 5 (TradingView) |
| 3D Graphics | Three.js + React Three Fiber |
| Market Data | Alpaca Markets API |
| Notifications | Sonner |

## Getting Started

Requires Node.js 18+ and a free [Alpaca Markets](https://alpaca.markets) account. Paper trading is available with no real money required.

```bash
npm install
cp .env.local.example .env.local
# Add ALPACA_API_KEY and ALPACA_SECRET_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## License

MIT
