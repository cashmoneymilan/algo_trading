import { NextResponse } from 'next/server';
import { getNews } from '@/lib/alpaca/client';
import { transformNewsArticle } from '@/types/news';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get('symbols');
    const limitParam = searchParams.get('limit');

    const symbols = symbolsParam ? symbolsParam.split(',').filter(Boolean) : undefined;
    const limit = limitParam ? parseInt(limitParam, 10) : 20;

    const response = await getNews(symbols, limit);

    // Transform to our format
    const news = response.news.map(transformNewsArticle);

    return NextResponse.json({ news });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
