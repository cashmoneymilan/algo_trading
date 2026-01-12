import type {
  AlpacaAccount,
  AlpacaPosition,
  AlpacaOrder,
  AlpacaBar
} from '@/types/alpaca';
import type { NewsResponse } from '@/types/news';

const ALPACA_API_URL = process.env.ALPACA_PAPER === 'true'
  ? 'https://paper-api.alpaca.markets'
  : 'https://api.alpaca.markets';

const ALPACA_DATA_URL = 'https://data.alpaca.markets';

interface AlpacaClientConfig {
  apiKey: string;
  apiSecret: string;
}

function getConfig(): AlpacaClientConfig {
  const apiKey = process.env.ALPACA_API_KEY_ID;
  const apiSecret = process.env.ALPACA_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('Missing Alpaca API credentials');
  }

  return { apiKey, apiSecret };
}

function getHeaders(): HeadersInit {
  const { apiKey, apiSecret } = getConfig();
  return {
    'APCA-API-KEY-ID': apiKey,
    'APCA-API-SECRET-KEY': apiSecret,
    'Content-Type': 'application/json',
  };
}

async function fetchAlpaca<T>(
  endpoint: string,
  options: RequestInit = {},
  baseUrl: string = ALPACA_API_URL
): Promise<T> {
  const url = `${baseUrl}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `Alpaca API error: ${response.status}`);
  }

  // Handle 204 No Content responses (e.g., DELETE operations)
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T;
  }

  return response.json();
}

// Account endpoints
export async function getAccount(): Promise<AlpacaAccount> {
  return fetchAlpaca<AlpacaAccount>('/v2/account');
}

// Position endpoints
export async function getPositions(): Promise<AlpacaPosition[]> {
  return fetchAlpaca<AlpacaPosition[]>('/v2/positions');
}

export async function getPosition(symbol: string): Promise<AlpacaPosition> {
  return fetchAlpaca<AlpacaPosition>(`/v2/positions/${symbol}`);
}

export async function closePosition(symbol: string): Promise<AlpacaOrder> {
  return fetchAlpaca<AlpacaOrder>(`/v2/positions/${symbol}`, { method: 'DELETE' });
}

export async function closeAllPositions(): Promise<AlpacaOrder[]> {
  return fetchAlpaca<AlpacaOrder[]>('/v2/positions', { method: 'DELETE' });
}

// Order endpoints
export interface CreateOrderParams {
  symbol: string;
  qty?: number;
  notional?: number;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  time_in_force: 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok';
  limit_price?: number;
  stop_price?: number;
  extended_hours?: boolean;
  client_order_id?: string;
}

export async function createOrder(params: CreateOrderParams): Promise<AlpacaOrder> {
  return fetchAlpaca<AlpacaOrder>('/v2/orders', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function getOrders(status: 'open' | 'closed' | 'all' = 'open'): Promise<AlpacaOrder[]> {
  return fetchAlpaca<AlpacaOrder[]>(`/v2/orders?status=${status}`);
}

export async function getOrder(orderId: string): Promise<AlpacaOrder> {
  return fetchAlpaca<AlpacaOrder>(`/v2/orders/${orderId}`);
}

export async function cancelOrder(orderId: string): Promise<void> {
  await fetchAlpaca<void>(`/v2/orders/${orderId}`, { method: 'DELETE' });
}

export async function cancelAllOrders(): Promise<void> {
  await fetchAlpaca<void>('/v2/orders', { method: 'DELETE' });
}

// Market data endpoints
export async function getBars(
  symbol: string,
  timeframe: '1Min' | '5Min' | '15Min' | '1Hour' | '1Day' = '1Day',
  start?: string,
  end?: string,
  limit: number = 100
): Promise<{ bars: AlpacaBar[] }> {
  const params = new URLSearchParams({
    timeframe,
    limit: limit.toString(),
  });

  if (start) params.append('start', start);
  if (end) params.append('end', end);

  // Single stock endpoint returns { bars: [...], next_page_token: ... }
  return fetchAlpaca<{ bars: AlpacaBar[] }>(
    `/v2/stocks/${symbol}/bars?${params.toString()}`,
    {},
    ALPACA_DATA_URL
  );
}

export async function getLatestQuote(symbol: string): Promise<{ quote: Record<string, unknown> }> {
  return fetchAlpaca<{ quote: Record<string, unknown> }>(
    `/v2/stocks/${symbol}/quotes/latest`,
    {},
    ALPACA_DATA_URL
  );
}

export async function getLatestTrade(symbol: string): Promise<{ trade: Record<string, unknown> }> {
  return fetchAlpaca<{ trade: Record<string, unknown> }>(
    `/v2/stocks/${symbol}/trades/latest`,
    {},
    ALPACA_DATA_URL
  );
}

// WebSocket credentials for client-side connection
export function getWebSocketConfig() {
  const config = getConfig();
  return {
    apiKey: config.apiKey,
    apiSecret: config.apiSecret,
    paper: process.env.ALPACA_PAPER === 'true',
  };
}

// News endpoint
export async function getNews(
  symbols?: string[],
  limit: number = 20
): Promise<NewsResponse> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    sort: 'desc',
  });

  if (symbols && symbols.length > 0) {
    params.append('symbols', symbols.join(','));
  }

  return fetchAlpaca<NewsResponse>(
    `/v1beta1/news?${params.toString()}`,
    {},
    ALPACA_DATA_URL
  );
}
