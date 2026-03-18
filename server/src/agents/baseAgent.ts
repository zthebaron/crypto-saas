import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config';
import type { AgentRole, AgentContext, AgentOutput } from '@crypto-saas/shared';
import { parseAgentOutput } from './outputParser';

export abstract class BaseAgent {
  protected client: Anthropic;
  abstract role: AgentRole;
  abstract systemPrompt: string;

  constructor() {
    this.client = new Anthropic({ apiKey: config.anthropicApiKey });
  }

  async run(context: AgentContext): Promise<AgentOutput> {
    const userMessage = this.buildUserMessage(context);

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: this.systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const content = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    return parseAgentOutput(content, this.role, context.runId);
  }

  protected buildUserMessage(context: AgentContext): string {
    const parts: string[] = [];

    // Market data summary
    parts.push('## Current Market Data\n');
    parts.push(`Total coins analyzed: ${context.marketData.length}\n`);

    // Global metrics
    const g = context.globalMetrics;
    parts.push('### Global Metrics');
    parts.push(`- Total Market Cap: $${formatLarge(g.totalMarketCap)}`);
    parts.push(`- 24h Volume: $${formatLarge(g.totalVolume24h)}`);
    parts.push(`- BTC Dominance: ${g.btcDominance.toFixed(1)}%`);
    parts.push(`- ETH Dominance: ${g.ethDominance.toFixed(1)}%`);
    parts.push(`- Market Cap 24h Change: ${g.totalMarketCapChange24h.toFixed(2)}%\n`);

    // Top 20 coins
    parts.push('### Top 20 Coins by Market Cap');
    parts.push('| Rank | Symbol | Name | Price | 1h% | 24h% | 7d% | Market Cap | Volume 24h | Vol/MCap |');
    parts.push('|------|--------|------|-------|-----|------|-----|------------|------------|----------|');
    for (const coin of context.marketData.slice(0, 20)) {
      const volMcap = coin.marketCap > 0 ? (coin.volume24h / coin.marketCap).toFixed(4) : '0';
      parts.push(
        `| ${coin.cmcRank} | ${coin.symbol} | ${coin.name} | $${formatPrice(coin.price)} | ${coin.percentChange1h.toFixed(2)}% | ${coin.percentChange24h.toFixed(2)}% | ${coin.percentChange7d.toFixed(2)}% | $${formatLarge(coin.marketCap)} | $${formatLarge(coin.volume24h)} | ${volMcap} |`
      );
    }

    // Notable movers from full list
    parts.push('\n### Notable Movers (>5% in 24h)');
    const movers = context.marketData.filter(c => Math.abs(c.percentChange24h) > 5);
    if (movers.length > 0) {
      for (const coin of movers.slice(0, 20)) {
        const dir = coin.percentChange24h > 0 ? 'UP' : 'DOWN';
        parts.push(`- ${coin.symbol} (${coin.name}): ${dir} ${coin.percentChange24h.toFixed(2)}% | Price: $${formatPrice(coin.price)} | Vol/MCap: ${(coin.volume24h / Math.max(coin.marketCap, 1)).toFixed(4)}`);
      }
    } else {
      parts.push('No coins with >5% 24h change found.');
    }

    // Trending
    parts.push('\n### Top Gainers');
    for (const coin of context.trendingGainers.slice(0, 5)) {
      parts.push(`- ${coin.symbol}: +${coin.percentChange24h.toFixed(2)}% | $${formatPrice(coin.price)}`);
    }
    parts.push('\n### Top Losers');
    for (const coin of context.trendingLosers.slice(0, 5)) {
      parts.push(`- ${coin.symbol}: ${coin.percentChange24h.toFixed(2)}% | $${formatPrice(coin.price)}`);
    }

    // Previous agent reports
    if (context.previousReports.length > 0) {
      parts.push('\n## Previous Agent Reports\n');
      for (const report of context.previousReports) {
        parts.push(`### ${report.agentRole.replace('_', ' ').toUpperCase()} Report`);
        parts.push(report.content);
        parts.push('');
      }
    }

    // Watchlist
    if (context.userWatchlist && context.userWatchlist.length > 0) {
      parts.push(`\n## User Watchlist: ${context.userWatchlist.join(', ')}`);
    }

    return parts.join('\n');
  }
}

function formatLarge(n: number): string {
  if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K';
  return n.toFixed(2);
}

function formatPrice(p: number): string {
  if (p >= 1) return p.toFixed(2);
  if (p >= 0.01) return p.toFixed(4);
  return p.toFixed(8);
}
