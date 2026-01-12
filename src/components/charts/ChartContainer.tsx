'use client';

import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  UTCTimestamp,
  ColorType,
  CrosshairMode,
  LineSeries,
  CandlestickSeries,
  HistogramSeries,
} from 'lightweight-charts';
import { useMarketData } from '@/hooks/useMarketData';
import { useUIStore } from '@/stores/uiStore';
import { chartTheme, candlestickColors, candlestickColorsColorblind } from '@/config/colors';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ChartToolbar } from './ChartToolbar';
import { CHART_CONFIG } from '@/config/constants';
import {
  calculateSMA,
  calculateEMA,
  calculateBollingerBands,
  calculateVWAP,
  calculateRSI,
  calculateMACD,
  calculateVolume,
} from '@/lib/indicators/calculations';
import type { Bar } from '@/types/trading';

interface ChartContainerProps {
  symbol: string;
  height?: number;
  showToolbar?: boolean;
  className?: string;
}

type ChartType = 'candlestick' | 'heikin-ashi' | 'line';

// Interface for indicator series refs
interface IndicatorSeries {
  sma: ISeriesApi<'Line'>[];
  ema: ISeriesApi<'Line'>[];
  bollingerUpper: ISeriesApi<'Line'> | null;
  bollingerMiddle: ISeriesApi<'Line'> | null;
  bollingerLower: ISeriesApi<'Line'> | null;
  vwap: ISeriesApi<'Line'> | null;
  rsi: ISeriesApi<'Line'> | null;
  macdLine: ISeriesApi<'Line'> | null;
  macdSignal: ISeriesApi<'Line'> | null;
  macdHistogram: ISeriesApi<'Histogram'> | null;
  volume: ISeriesApi<'Histogram'> | null;
}

function convertToHeikinAshi(data: CandlestickData[]): CandlestickData[] {
  if (data.length === 0) return [];

  const result: CandlestickData[] = [];

  for (let i = 0; i < data.length; i++) {
    const current = data[i];
    const previous = i > 0 ? result[i - 1] : current;

    const haClose = (current.open + current.high + current.low + current.close) / 4;
    const haOpen = (previous.open + previous.close) / 2;
    const haHigh = Math.max(current.high, haOpen, haClose);
    const haLow = Math.min(current.low, haOpen, haClose);

    result.push({
      time: current.time,
      open: haOpen,
      high: haHigh,
      low: haLow,
      close: haClose,
    });
  }

  return result;
}

export function ChartContainer({
  symbol,
  height,
  showToolbar = true,
  className = '',
}: ChartContainerProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | ISeriesApi<'Line'> | null>(null);
  const indicatorSeriesRef = useRef<IndicatorSeries>({
    sma: [],
    ema: [],
    bollingerUpper: null,
    bollingerMiddle: null,
    bollingerLower: null,
    vwap: null,
    rsi: null,
    macdLine: null,
    macdSignal: null,
    macdHistogram: null,
    volume: null,
  });

  const [chartType, setChartType] = useState<ChartType>('candlestick');
  const [timeframe, setTimeframe] = useState<typeof CHART_CONFIG.TIMEFRAMES[number]>('1Day');

  // Use the hook that fetches data
  const { bars } = useMarketData({ symbol, timeframe, limit: 200 });
  const theme = useUIStore((state) => state.theme);
  const colorblindMode = useUIStore((state) => state.colorblindMode);
  const showGrid = useUIStore((state) => state.showGrid);
  const indicators = useUIStore((state) => state.indicators);
  const prefersReducedMotion = useReducedMotion();

  // Get theme-appropriate colors
  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const currentTheme = isDark ? chartTheme.dark : chartTheme.light;
  const candleColors = colorblindMode
    ? (isDark ? candlestickColorsColorblind.dark : candlestickColorsColorblind.light)
    : (isDark ? candlestickColors.dark : candlestickColors.light);

  // Get the actual height (use container height if not specified)
  const getChartHeight = useCallback(() => {
    if (height !== undefined) return height;
    return chartContainerRef.current?.clientHeight || 400;
  }, [height]);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chartHeight = getChartHeight();
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartHeight,
      layout: {
        background: { type: ColorType.Solid, color: currentTheme.layout.background.color },
        textColor: currentTheme.layout.textColor,
        fontFamily: 'Inter, system-ui, sans-serif',
      },
      grid: {
        vertLines: {
          color: showGrid ? currentTheme.grid.vertLines.color : 'transparent',
        },
        horzLines: {
          color: showGrid ? currentTheme.grid.horzLines.color : 'transparent',
        },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          labelBackgroundColor: currentTheme.crosshair.vertLine.labelBackgroundColor,
        },
        horzLine: {
          labelBackgroundColor: currentTheme.crosshair.horzLine.labelBackgroundColor,
        },
      },
      timeScale: {
        borderColor: currentTheme.timeScale.borderColor,
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: currentTheme.rightPriceScale.borderColor,
      },
      handleScroll: !prefersReducedMotion,
      handleScale: !prefersReducedMotion,
    });

    chartRef.current = chart;

    // Create initial series based on chart type
    if (chartType === 'line') {
      seriesRef.current = chart.addSeries(LineSeries, {
        color: candleColors.upColor,
        lineWidth: 2,
      });
    } else {
      seriesRef.current = chart.addSeries(CandlestickSeries, {
        ...candleColors,
      });
    }

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: getChartHeight(),
        });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      // Reset indicator series refs
      indicatorSeriesRef.current = {
        sma: [],
        ema: [],
        bollingerUpper: null,
        bollingerMiddle: null,
        bollingerLower: null,
        vwap: null,
        rsi: null,
        macdLine: null,
        macdSignal: null,
        macdHistogram: null,
        volume: null,
      };
    };
  }, [height, currentTheme, candleColors, showGrid, prefersReducedMotion, chartType, getChartHeight]);

  // Update chart when theme changes
  useEffect(() => {
    if (!chartRef.current) return;

    chartRef.current.applyOptions({
      layout: {
        background: { type: ColorType.Solid, color: currentTheme.layout.background.color },
        textColor: currentTheme.layout.textColor,
      },
      grid: {
        vertLines: {
          color: showGrid ? currentTheme.grid.vertLines.color : 'transparent',
        },
        horzLines: {
          color: showGrid ? currentTheme.grid.horzLines.color : 'transparent',
        },
      },
    });

    // Update series colors
    if (seriesRef.current && chartType !== 'line') {
      (seriesRef.current as ISeriesApi<'Candlestick'>).applyOptions(candleColors);
    }
  }, [currentTheme, candleColors, showGrid, chartType]);

  // Update main series data when bars change
  useEffect(() => {
    if (!seriesRef.current || bars.length === 0) return;

    const chartData: CandlestickData[] = bars.map((bar: Bar) => ({
      time: (bar.timestamp / 1000) as UTCTimestamp,
      open: bar.open,
      high: bar.high,
      low: bar.low,
      close: bar.close,
    }));

    let dataToDisplay = chartData;

    if (chartType === 'heikin-ashi') {
      dataToDisplay = convertToHeikinAshi(chartData);
    }

    if (chartType === 'line') {
      const lineData = dataToDisplay.map((d) => ({
        time: d.time,
        value: d.close,
      }));
      (seriesRef.current as ISeriesApi<'Line'>).setData(lineData);
    } else {
      (seriesRef.current as ISeriesApi<'Candlestick'>).setData(dataToDisplay);
    }

    chartRef.current?.timeScale().fitContent();
  }, [bars, chartType]);

  // Manage indicator series
  useEffect(() => {
    if (!chartRef.current || bars.length === 0) return;

    const chart = chartRef.current;
    const refs = indicatorSeriesRef.current;

    // SMA
    if (indicators.sma.enabled) {
      // Remove excess series
      while (refs.sma.length > indicators.sma.periods.length) {
        const series = refs.sma.pop();
        if (series) chart.removeSeries(series);
      }
      // Add/update series for each period
      indicators.sma.periods.forEach((period, i) => {
        if (!refs.sma[i]) {
          refs.sma[i] = chart.addSeries(LineSeries, {
            color: indicators.sma.colors[i] || '#f59e0b',
            lineWidth: 1,
            priceScaleId: 'right',
          });
        }
        const data = calculateSMA(bars, period);
        refs.sma[i].setData(data);
      });
    } else {
      refs.sma.forEach((s) => chart.removeSeries(s));
      refs.sma = [];
    }

    // EMA
    if (indicators.ema.enabled) {
      while (refs.ema.length > indicators.ema.periods.length) {
        const series = refs.ema.pop();
        if (series) chart.removeSeries(series);
      }
      indicators.ema.periods.forEach((period, i) => {
        if (!refs.ema[i]) {
          refs.ema[i] = chart.addSeries(LineSeries, {
            color: indicators.ema.colors[i] || '#8b5cf6',
            lineWidth: 1,
            priceScaleId: 'right',
          });
        }
        const data = calculateEMA(bars, period);
        refs.ema[i].setData(data);
      });
    } else {
      refs.ema.forEach((s) => chart.removeSeries(s));
      refs.ema = [];
    }

    // Bollinger Bands
    if (indicators.bollinger.enabled) {
      const bb = calculateBollingerBands(bars, indicators.bollinger.period, indicators.bollinger.stdDev);

      if (!refs.bollingerUpper) {
        refs.bollingerUpper = chart.addSeries(LineSeries, {
          color: indicators.bollinger.color,
          lineWidth: 1,
          lineStyle: 2, // Dashed
          priceScaleId: 'right',
        });
      }
      refs.bollingerUpper.setData(bb.upper);

      if (!refs.bollingerMiddle) {
        refs.bollingerMiddle = chart.addSeries(LineSeries, {
          color: indicators.bollinger.color,
          lineWidth: 1,
          priceScaleId: 'right',
        });
      }
      refs.bollingerMiddle.setData(bb.middle);

      if (!refs.bollingerLower) {
        refs.bollingerLower = chart.addSeries(LineSeries, {
          color: indicators.bollinger.color,
          lineWidth: 1,
          lineStyle: 2,
          priceScaleId: 'right',
        });
      }
      refs.bollingerLower.setData(bb.lower);
    } else {
      if (refs.bollingerUpper) { chart.removeSeries(refs.bollingerUpper); refs.bollingerUpper = null; }
      if (refs.bollingerMiddle) { chart.removeSeries(refs.bollingerMiddle); refs.bollingerMiddle = null; }
      if (refs.bollingerLower) { chart.removeSeries(refs.bollingerLower); refs.bollingerLower = null; }
    }

    // VWAP
    if (indicators.vwap.enabled) {
      if (!refs.vwap) {
        refs.vwap = chart.addSeries(LineSeries, {
          color: indicators.vwap.color,
          lineWidth: 2,
          priceScaleId: 'right',
        });
      }
      const data = calculateVWAP(bars);
      refs.vwap.setData(data);
    } else {
      if (refs.vwap) { chart.removeSeries(refs.vwap); refs.vwap = null; }
    }

    // Volume (as histogram at bottom)
    if (indicators.volume.enabled) {
      if (!refs.volume) {
        refs.volume = chart.addSeries(HistogramSeries, {
          priceScaleId: 'volume',
          priceFormat: { type: 'volume' },
        });
        chart.priceScale('volume').applyOptions({
          scaleMargins: { top: 0.8, bottom: 0 },
        });
      }
      const data = calculateVolume(bars, indicators.volume.colors.up, indicators.volume.colors.down);
      refs.volume.setData(data);
    } else {
      if (refs.volume) { chart.removeSeries(refs.volume); refs.volume = null; }
    }

    // RSI (separate pane would require multiple charts - simplified to overlay for now)
    if (indicators.rsi.enabled) {
      if (!refs.rsi) {
        refs.rsi = chart.addSeries(LineSeries, {
          color: indicators.rsi.color,
          lineWidth: 1,
          priceScaleId: 'rsi',
        });
        chart.priceScale('rsi').applyOptions({
          scaleMargins: { top: 0.85, bottom: 0.05 },
          visible: false,
        });
      }
      const data = calculateRSI(bars, indicators.rsi.period);
      // Normalize RSI to price scale (0-100 -> price range)
      const priceRange = bars.length > 0 ? Math.max(...bars.map(b => b.high)) - Math.min(...bars.map(b => b.low)) : 100;
      const minPrice = bars.length > 0 ? Math.min(...bars.map(b => b.low)) : 0;
      const normalizedData = data.map(d => ({
        time: d.time,
        value: minPrice + (d.value / 100) * priceRange * 0.15, // Scale to bottom 15%
      }));
      refs.rsi.setData(normalizedData);
    } else {
      if (refs.rsi) { chart.removeSeries(refs.rsi); refs.rsi = null; }
    }

    // MACD (simplified - would need separate pane for proper implementation)
    if (indicators.macd.enabled) {
      const macd = calculateMACD(bars, indicators.macd.fastPeriod, indicators.macd.slowPeriod, indicators.macd.signalPeriod);

      if (!refs.macdLine) {
        refs.macdLine = chart.addSeries(LineSeries, {
          color: indicators.macd.colors.macd,
          lineWidth: 1,
          priceScaleId: 'macd',
        });
        chart.priceScale('macd').applyOptions({
          scaleMargins: { top: 0.9, bottom: 0.02 },
          visible: false,
        });
      }
      // Normalize MACD to bottom of chart
      const priceRange = bars.length > 0 ? Math.max(...bars.map(b => b.high)) - Math.min(...bars.map(b => b.low)) : 100;
      const minPrice = bars.length > 0 ? Math.min(...bars.map(b => b.low)) : 0;
      const maxMacd = Math.max(...macd.macd.map(d => Math.abs(d.value)), 1);

      refs.macdLine.setData(macd.macd.map(d => ({
        time: d.time,
        value: minPrice + ((d.value / maxMacd + 1) / 2) * priceRange * 0.1,
      })));

      if (!refs.macdSignal) {
        refs.macdSignal = chart.addSeries(LineSeries, {
          color: indicators.macd.colors.signal,
          lineWidth: 1,
          priceScaleId: 'macd',
        });
      }
      refs.macdSignal.setData(macd.signal.map(d => ({
        time: d.time,
        value: minPrice + ((d.value / maxMacd + 1) / 2) * priceRange * 0.1,
      })));
    } else {
      if (refs.macdLine) { chart.removeSeries(refs.macdLine); refs.macdLine = null; }
      if (refs.macdSignal) { chart.removeSeries(refs.macdSignal); refs.macdSignal = null; }
      if (refs.macdHistogram) { chart.removeSeries(refs.macdHistogram); refs.macdHistogram = null; }
    }

  }, [bars, indicators]);

  const handleChartTypeChange = useCallback((type: ChartType) => {
    setChartType(type);
  }, []);

  const handleTimeframeChange = useCallback((tf: typeof CHART_CONFIG.TIMEFRAMES[number]) => {
    setTimeframe(tf);
  }, []);

  return (
    <div className={`flex flex-col ${className}`}>
      {showToolbar && (
        <ChartToolbar
          symbol={symbol}
          chartType={chartType}
          timeframe={timeframe}
          onChartTypeChange={handleChartTypeChange}
          onTimeframeChange={handleTimeframeChange}
        />
      )}
      <div
        ref={chartContainerRef}
        className="w-full flex-1 overflow-hidden"
        style={height !== undefined ? { height } : undefined}
        role="img"
        aria-label={`Price chart for ${symbol}`}
      />
    </div>
  );
}
