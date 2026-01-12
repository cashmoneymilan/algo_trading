import { NextResponse } from 'next/server';
import { getBars, getLatestQuote, getLatestTrade } from '@/lib/alpaca/client';
import { transformBar } from '@/lib/alpaca/transforms';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const type = searchParams.get('type') || 'bars';
    const timeframe = (searchParams.get('timeframe') as '1Min' | '5Min' | '15Min' | '1Hour' | '1Day') || '1Day';
    const start = searchParams.get('start') || undefined;
    const end = searchParams.get('end') || undefined;
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter is required' },
        { status: 400 }
      );
    }

    const upperSymbol = symbol.toUpperCase();

    switch (type) {
      case 'bars': {
        const data = await getBars(upperSymbol, timeframe, start, end, limit);
        const bars = (data.bars || []).map((bar) => transformBar(bar, upperSymbol));
        return NextResponse.json({ symbol: upperSymbol, bars });
      }

      case 'quote': {
        const data = await getLatestQuote(upperSymbol);
        return NextResponse.json({ symbol: upperSymbol, quote: data.quote });
      }

      case 'trade': {
        const data = await getLatestTrade(upperSymbol);
        return NextResponse.json({ symbol: upperSymbol, trade: data.trade });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid type. Use: bars, quote, or trade' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error fetching market data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}
