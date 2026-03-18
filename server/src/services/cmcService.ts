import axios from 'axios';
import { config } from '../config';
import { getDb } from '../models/database';
import { CMC_API_BASE, CACHE_TTL } from '@crypto-saas/shared';
import type { CoinData, GlobalMetrics, TrendingCoin } from '@crypto-saas/shared';

const cmcClient = axios.create({
  baseURL: CMC_API_BASE,
  headers: { 'X-CMC_PRO_API_KEY': config.cmcApiKey },
  timeout: 15000,
});

// Simple token bucket rate limiter: 30 requests per minute
let tokenBucket = 30;
let lastRefill = Date.now();

function acquireToken(): Promise<void> {
  return new Promise((resolve) => {
    const now = Date.now();
    const elapsed = now - lastRefill;
    tokenBucket = Math.min(30, tokenBucket + (elapsed / 60000) * 30);
    lastRefill = now;

    if (tokenBucket >= 1) {
      tokenBucket -= 1;
      resolve();
    } else {
      const waitMs = ((1 - tokenBucket) / 30) * 60000;
      setTimeout(() => { tokenBucket -= 1; resolve(); }, waitMs);
    }
  });
}

function getCached(cacheKey: string): any | null {
  try {
    const db = getDb();
    const row = db.prepare(
      "SELECT data FROM cmc_cache WHERE cache_key = ? AND expires_at > datetime('now')"
    ).get(cacheKey) as any;
    if (row) return JSON.parse(row.data);
  } catch { /* ignore cache errors */ }
  return null;
}

function setCache(cacheKey: string, data: any, ttlSeconds: number): void {
  try {
    const db = getDb();
    db.prepare(
      `INSERT OR REPLACE INTO cmc_cache (cache_key, data, expires_at)
       VALUES (?, ?, datetime('now', '+' || ? || ' seconds'))`
    ).run(cacheKey, JSON.stringify(data), ttlSeconds);
  } catch { /* ignore cache errors */ }
}

async function cachedFetch<T>(cacheKey: string, url: string, params: Record<string, any>, ttl: number): Promise<T> {
  const cached = getCached(cacheKey);
  if (cached) return cached as T;

  await acquireToken();
  const response = await cmcClient.get(url, { params });
  const data = response.data;
  setCache(cacheKey, data, ttl);
  return data as T;
}

export async function getListingsLatest(limit = 100): Promise<CoinData[]> {
  const raw = await cachedFetch<any>(
    `listings_${limit}`,
    '/v1/cryptocurrency/listings/latest',
    { limit, convert: 'USD' },
    CACHE_TTL.listings
  );

  return (raw.data || []).map((coin: any): CoinData => {
    const quote = coin.quote?.USD || {};
    return {
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      slug: coin.slug,
      price: quote.price || 0,
      percentChange1h: quote.percent_change_1h || 0,
      percentChange24h: quote.percent_change_24h || 0,
      percentChange7d: quote.percent_change_7d || 0,
      marketCap: quote.market_cap || 0,
      volume24h: quote.volume_24h || 0,
      circulatingSupply: coin.circulating_supply || 0,
      maxSupply: coin.max_supply || null,
      cmcRank: coin.cmc_rank,
      lastUpdated: coin.last_updated,
    };
  });
}

export async function getQuotesLatest(symbols: string[]): Promise<CoinData[]> {
  if (symbols.length === 0) return [];
  const symbolStr = symbols.join(',');
  const raw = await cachedFetch<any>(
    `quotes_${symbolStr}`,
    '/v2/cryptocurrency/quotes/latest',
    { symbol: symbolStr, convert: 'USD' },
    CACHE_TTL.quotes
  );

  const results: CoinData[] = [];
  if (raw.data) {
    for (const [, entries] of Object.entries(raw.data) as any) {
      const coins = Array.isArray(entries) ? entries : [entries];
      for (const coin of coins) {
        const quote = coin.quote?.USD || {};
        results.push({
          id: coin.id,
          symbol: coin.symbol,
          name: coin.name,
          slug: coin.slug || '',
          price: quote.price || 0,
          percentChange1h: quote.percent_change_1h || 0,
          percentChange24h: quote.percent_change_24h || 0,
          percentChange7d: quote.percent_change_7d || 0,
          marketCap: quote.market_cap || 0,
          volume24h: quote.volume_24h || 0,
          circulatingSupply: coin.circulating_supply || 0,
          maxSupply: coin.max_supply || null,
          cmcRank: coin.cmc_rank || 0,
          lastUpdated: coin.last_updated,
        });
      }
    }
  }
  return results;
}

export async function getGlobalMetrics(): Promise<GlobalMetrics> {
  const raw = await cachedFetch<any>(
    'global_metrics',
    '/v1/global-metrics/quotes/latest',
    { convert: 'USD' },
    CACHE_TTL.globalMetrics
  );

  const data = raw.data || {};
  const quote = data.quote?.USD || {};
  return {
    totalMarketCap: quote.total_market_cap || 0,
    totalVolume24h: quote.total_volume_24h || 0,
    btcDominance: data.btc_dominance || 0,
    ethDominance: data.eth_dominance || 0,
    activeCryptocurrencies: data.active_cryptocurrencies || 0,
    totalMarketCapChange24h: quote.total_market_cap_yesterday_percentage_change || 0,
  };
}

export async function getTrendingGainersLosers(): Promise<{ gainers: TrendingCoin[]; losers: TrendingCoin[] }> {
  const mapTrending = (coins: any[]): TrendingCoin[] =>
    (coins || []).slice(0, 10).map((coin: any) => {
      const quote = coin.quote?.USD || {};
      return {
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        price: quote.price || 0,
        percentChange24h: quote.percent_change_24h || 0,
        volume24h: quote.volume_24h || 0,
        marketCap: quote.market_cap || 0,
      };
    });

  try {
    const [gainersRaw, losersRaw] = await Promise.all([
      cachedFetch<any>(
        'trending_gainers',
        '/v1/cryptocurrency/trending/gainers-losers',
        { limit: 10, time_period: '24h', sort_dir: 'desc', convert: 'USD' },
        CACHE_TTL.trending
      ),
      cachedFetch<any>(
        'trending_losers',
        '/v1/cryptocurrency/trending/gainers-losers',
        { limit: 10, time_period: '24h', sort_dir: 'asc', convert: 'USD' },
        CACHE_TTL.trending
      ),
    ]);
    return {
      gainers: mapTrending(gainersRaw.data),
      losers: mapTrending(losersRaw.data),
    };
  } catch {
    // Trending endpoint may not be available on free tier - fallback to listings
    const listings = await getListingsLatest(100);
    const sorted = [...listings].sort((a, b) => b.percentChange24h - a.percentChange24h);
    return {
      gainers: sorted.slice(0, 10).map(c => ({
        id: c.id, symbol: c.symbol, name: c.name, price: c.price,
        percentChange24h: c.percentChange24h, volume24h: c.volume24h, marketCap: c.marketCap,
      })),
      losers: sorted.slice(-10).reverse().map(c => ({
        id: c.id, symbol: c.symbol, name: c.name, price: c.price,
        percentChange24h: c.percentChange24h, volume24h: c.volume24h, marketCap: c.marketCap,
      })),
    };
  }
}

export function clearExpiredCache(): void {
  try {
    const db = getDb();
    db.prepare("DELETE FROM cmc_cache WHERE expires_at <= datetime('now')").run();
  } catch { /* ignore */ }
}
