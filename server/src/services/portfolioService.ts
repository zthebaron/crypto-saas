import type { PortfolioSummary, CoinData } from '@crypto-saas/shared';
import { getPositions, createSnapshot } from '../models/portfolioModel';
import * as cmcService from './cmcService';

export async function getPortfolioSummary(userId: string): Promise<PortfolioSummary> {
  const positions = getPositions(userId, 'open');
  if (positions.length === 0) {
    return { positions: [], totalValue: 0, totalPnl: 0, totalPnlPercent: 0, allocation: [] };
  }

  // Fetch current prices
  const symbols = [...new Set(positions.map(p => p.coinSymbol))];
  let priceMap: Record<string, number> = {};

  try {
    const quotes = await cmcService.getQuotesLatest(symbols);
    for (const coin of quotes) {
      priceMap[coin.symbol] = coin.price;
    }
  } catch {
    // Fallback to listings
    const listings = await cmcService.getListingsLatest(100);
    for (const coin of listings) {
      if (symbols.includes(coin.symbol)) {
        priceMap[coin.symbol] = coin.price;
      }
    }
  }

  const enriched = positions.map(p => {
    const currentPrice = priceMap[p.coinSymbol] || p.entryPrice;
    const value = currentPrice * p.quantity;
    const cost = p.entryPrice * p.quantity;
    const pnl = value - cost;
    const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0;
    return { ...p, currentPrice, pnl, pnlPercent };
  });

  const totalValue = enriched.reduce((sum, p) => sum + p.currentPrice * p.quantity, 0);
  const totalCost = enriched.reduce((sum, p) => sum + p.entryPrice * p.quantity, 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  const allocation = enriched.map(p => ({
    symbol: p.coinSymbol,
    value: p.currentPrice * p.quantity,
    percentage: totalValue > 0 ? ((p.currentPrice * p.quantity) / totalValue) * 100 : 0,
  }));

  return { positions: enriched, totalValue, totalPnl, totalPnlPercent, allocation };
}

export async function takeSnapshot(userId: string): Promise<void> {
  const summary = await getPortfolioSummary(userId);
  if (summary.positions.length > 0) {
    createSnapshot(userId, summary.totalValue, summary.totalPnl, JSON.stringify(summary.allocation));
  }
}
