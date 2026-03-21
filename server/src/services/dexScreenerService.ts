import axios from 'axios';

const dexClient = axios.create({
  baseURL: 'https://api.dexscreener.com',
  timeout: 15000,
});

// Simple in-memory cache (60s TTL for search, 30s for boosted/trending)
const cache = new Map<string, { data: any; expires: number }>();

function getCached(key: string): any | null {
  const entry = cache.get(key);
  if (entry && entry.expires > Date.now()) return entry.data;
  cache.delete(key);
  return null;
}

function setCache(key: string, data: any, ttlMs: number): void {
  cache.set(key, { data, expires: Date.now() + ttlMs });
  // Cleanup old entries periodically
  if (cache.size > 200) {
    const now = Date.now();
    for (const [k, v] of cache) {
      if (v.expires < now) cache.delete(k);
    }
  }
}

export async function searchPairs(query: string) {
  const key = `search:${query}`;
  const cached = getCached(key);
  if (cached) return cached;

  const { data } = await dexClient.get('/latest/dex/search', { params: { q: query } });
  const result = data.pairs || [];
  setCache(key, result, 60_000);
  return result;
}

export async function getTopBoostedTokens() {
  const key = 'boosted:top';
  const cached = getCached(key);
  if (cached) return cached;

  const { data } = await dexClient.get('/token-boosts/top/v1');
  setCache(key, data, 30_000);
  return data;
}

export async function getLatestBoostedTokens() {
  const key = 'boosted:latest';
  const cached = getCached(key);
  if (cached) return cached;

  const { data } = await dexClient.get('/token-boosts/latest/v1');
  setCache(key, data, 30_000);
  return data;
}

export async function getLatestTokenProfiles() {
  const key = 'profiles:latest';
  const cached = getCached(key);
  if (cached) return cached;

  const { data } = await dexClient.get('/token-profiles/latest/v1');
  setCache(key, data, 30_000);
  return data;
}

export async function getPairsByChain(chainId: string, pairId: string) {
  const key = `pair:${chainId}:${pairId}`;
  const cached = getCached(key);
  if (cached) return cached;

  const { data } = await dexClient.get(`/latest/dex/pairs/${chainId}/${pairId}`);
  const result = data.pairs || [];
  setCache(key, result, 30_000);
  return result;
}

export async function getTokenPairs(chainId: string, tokenAddress: string) {
  const key = `token-pairs:${chainId}:${tokenAddress}`;
  const cached = getCached(key);
  if (cached) return cached;

  const { data } = await dexClient.get(`/token-pairs/v1/${chainId}/${tokenAddress}`);
  setCache(key, data, 60_000);
  return data;
}
