import type { SignalType } from '@crypto-saas/shared';
import * as cmcService from './cmcService';
import * as outcomeModel from '../models/outcomeModel';

function isAccurate(signalType: string, entryPrice: number, currentPrice: number): boolean {
  const change = (currentPrice - entryPrice) / entryPrice;
  switch (signalType) {
    case 'buy': return currentPrice > entryPrice;
    case 'sell': return currentPrice < entryPrice;
    case 'hold': return Math.abs(change) <= 0.05;
    case 'watch': return true; // watch signals are informational
    default: return false;
  }
}

export async function evaluateOutcomes(): Promise<void> {
  console.log('[Accuracy] Starting evaluation...');

  // Get all symbols we need prices for
  const unevaluated24h = outcomeModel.getUnevaluated24h();
  const unevaluated7d = outcomeModel.getUnevaluated7d();
  const unevaluated30d = outcomeModel.getUnevaluated30d();

  const allSymbols = new Set<string>();
  for (const o of [...unevaluated24h, ...unevaluated7d, ...unevaluated30d]) {
    allSymbols.add(o.coinSymbol);
  }

  if (allSymbols.size === 0) {
    console.log('[Accuracy] No outcomes to evaluate');
    return;
  }

  // Fetch current prices
  let priceMap: Record<string, number> = {};
  try {
    const symbols = [...allSymbols];
    // Fetch in batches of 20
    for (let i = 0; i < symbols.length; i += 20) {
      const batch = symbols.slice(i, i + 20);
      const quotes = await cmcService.getQuotesLatest(batch);
      for (const coin of quotes) {
        priceMap[coin.symbol] = coin.price;
      }
    }
  } catch (err: any) {
    console.error('[Accuracy] Failed to fetch prices:', err.message);
    // Fallback to listings
    try {
      const listings = await cmcService.getListingsLatest(100);
      for (const coin of listings) priceMap[coin.symbol] = coin.price;
    } catch { return; }
  }

  // Evaluate 24h outcomes
  for (const outcome of unevaluated24h) {
    const price = priceMap[outcome.coinSymbol];
    if (!price) continue;
    const pnl = ((price - outcome.entryPrice) / outcome.entryPrice) * 100;
    const accurate = isAccurate(outcome.signalType, outcome.entryPrice, price);
    outcomeModel.updateOutcome24h(outcome.signalId, price, pnl, accurate);
  }

  // Evaluate 7d outcomes
  for (const outcome of unevaluated7d) {
    const price = priceMap[outcome.coinSymbol];
    if (!price) continue;
    const pnl = ((price - outcome.entryPrice) / outcome.entryPrice) * 100;
    const accurate = isAccurate(outcome.signalType, outcome.entryPrice, price);
    outcomeModel.updateOutcome7d(outcome.signalId, price, pnl, accurate);
  }

  // Evaluate 30d outcomes
  for (const outcome of unevaluated30d) {
    const price = priceMap[outcome.coinSymbol];
    if (!price) continue;
    const pnl = ((price - outcome.entryPrice) / outcome.entryPrice) * 100;
    const accurate = isAccurate(outcome.signalType, outcome.entryPrice, price);
    outcomeModel.updateOutcome30d(outcome.signalId, price, pnl, accurate);
  }

  console.log(`[Accuracy] Evaluated: ${unevaluated24h.length} 24h, ${unevaluated7d.length} 7d, ${unevaluated30d.length} 30d`);
}
