import type { Signal, CoinData, AlertRule } from '@crypto-saas/shared';
import { getEnabledRules, setLastTriggered } from '../models/alertRuleModel';
import { createNotification } from '../models/notificationModel';

const ONE_HOUR = 60 * 60 * 1000;

function wasRecentlyTriggered(rule: AlertRule): boolean {
  if (!rule.lastTriggeredAt) return false;
  return Date.now() - new Date(rule.lastTriggeredAt).getTime() < ONE_HOUR;
}

export function evaluateSignalRules(signals: Signal[]): void {
  const rules = getEnabledRules();

  for (const rule of rules) {
    if (wasRecentlyTriggered(rule)) continue;

    const config = rule.conditionConfig;

    if (rule.conditionType === 'signal_confidence') {
      const threshold = config.threshold ?? 80;
      const matching = signals.filter(s => s.confidence >= threshold);
      if (config.coinSymbol) {
        const coin = matching.find(s => s.coinSymbol === config.coinSymbol);
        if (coin) triggerRule(rule, `${coin.type.toUpperCase()} signal for ${coin.coinSymbol} (${coin.confidence}%)`);
      } else if (matching.length > 0) {
        triggerRule(rule, `${matching.length} high-confidence signal(s) detected`);
      }
    }

    if (rule.conditionType === 'new_signal_type') {
      const matching = signals.filter(s => s.type === config.signalType);
      if (config.coinSymbol) {
        const coin = matching.find(s => s.coinSymbol === config.coinSymbol);
        if (coin) triggerRule(rule, `New ${coin.type} signal for ${coin.coinSymbol}`);
      } else if (matching.length > 0) {
        triggerRule(rule, `${matching.length} new ${config.signalType} signal(s)`);
      }
    }
  }
}

export function evaluatePriceRules(marketData: CoinData[]): void {
  const rules = getEnabledRules();
  const priceMap: Record<string, CoinData> = {};
  for (const coin of marketData) priceMap[coin.symbol] = coin;

  for (const rule of rules) {
    if (wasRecentlyTriggered(rule)) continue;

    const config = rule.conditionConfig;
    if (!config.coinSymbol) continue;

    const coin = priceMap[config.coinSymbol];
    if (!coin) continue;

    if (rule.conditionType === 'price_above' && config.threshold && coin.price > config.threshold) {
      triggerRule(rule, `${coin.symbol} price $${coin.price.toFixed(2)} is above $${config.threshold}`);
    }

    if (rule.conditionType === 'price_below' && config.threshold && coin.price < config.threshold) {
      triggerRule(rule, `${coin.symbol} price $${coin.price.toFixed(2)} is below $${config.threshold}`);
    }

    if (rule.conditionType === 'price_change_pct' && config.threshold) {
      if (Math.abs(coin.percentChange24h) >= config.threshold) {
        triggerRule(rule, `${coin.symbol} moved ${coin.percentChange24h.toFixed(1)}% in 24h`);
      }
    }

    if (rule.conditionType === 'volume_spike' && config.threshold) {
      const volRatio = coin.volume24h / coin.marketCap;
      if (volRatio >= config.threshold / 100) {
        triggerRule(rule, `${coin.symbol} volume spike: ${(volRatio * 100).toFixed(1)}% of market cap`);
      }
    }
  }
}

function triggerRule(rule: AlertRule, message: string): void {
  setLastTriggered(rule.id);
  const title = rule.name;
  const body = rule.actionConfig.message || message;
  createNotification(rule.userId, 'price_alert', title, body);
}
