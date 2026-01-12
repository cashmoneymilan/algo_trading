import type { UTCTimestamp } from 'lightweight-charts';

// Base data point for all indicators
export interface IndicatorDataPoint {
  time: UTCTimestamp;
  value: number;
}

// Bollinger Bands data
export interface BollingerBandsData {
  upper: IndicatorDataPoint[];
  middle: IndicatorDataPoint[];
  lower: IndicatorDataPoint[];
}

// MACD data
export interface MACDData {
  macd: IndicatorDataPoint[];
  signal: IndicatorDataPoint[];
  histogram: IndicatorDataPoint[];
}

// Volume data with color
export interface VolumeDataPoint {
  time: UTCTimestamp;
  value: number;
  color: string;
}

// Individual indicator configurations
export interface SMAConfig {
  enabled: boolean;
  periods: number[];
  colors: string[];
}

export interface EMAConfig {
  enabled: boolean;
  periods: number[];
  colors: string[];
}

export interface BollingerConfig {
  enabled: boolean;
  period: number;
  stdDev: number;
  color: string;
}

export interface VWAPConfig {
  enabled: boolean;
  color: string;
}

export interface RSIConfig {
  enabled: boolean;
  period: number;
  overbought: number;
  oversold: number;
  color: string;
}

export interface MACDConfig {
  enabled: boolean;
  fastPeriod: number;
  slowPeriod: number;
  signalPeriod: number;
  colors: {
    macd: string;
    signal: string;
    histogramUp: string;
    histogramDown: string;
  };
}

export interface VolumeConfig {
  enabled: boolean;
  colors: {
    up: string;
    down: string;
  };
}

// Complete indicator settings
export interface IndicatorSettings {
  sma: SMAConfig;
  ema: EMAConfig;
  bollinger: BollingerConfig;
  vwap: VWAPConfig;
  rsi: RSIConfig;
  macd: MACDConfig;
  volume: VolumeConfig;
}

// Default indicator settings
export const DEFAULT_INDICATOR_SETTINGS: IndicatorSettings = {
  sma: {
    enabled: false,
    periods: [20],
    colors: ['#f59e0b'], // Amber
  },
  ema: {
    enabled: false,
    periods: [12, 26],
    colors: ['#8b5cf6', '#ec4899'], // Purple, Pink
  },
  bollinger: {
    enabled: false,
    period: 20,
    stdDev: 2,
    color: '#06b6d4', // Cyan
  },
  vwap: {
    enabled: false,
    color: '#f97316', // Orange
  },
  rsi: {
    enabled: false,
    period: 14,
    overbought: 70,
    oversold: 30,
    color: '#a855f7', // Purple
  },
  macd: {
    enabled: false,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    colors: {
      macd: '#3b82f6', // Blue
      signal: '#ef4444', // Red
      histogramUp: '#22c55e', // Green
      histogramDown: '#ef4444', // Red
    },
  },
  volume: {
    enabled: true, // Volume enabled by default
    colors: {
      up: '#22c55e',
      down: '#ef4444',
    },
  },
};
