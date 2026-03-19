import { getRecentSignals, getTopSignals } from '../models/signalModel';
import { searchDocuments } from '../models/documentModel';
import { runFullPipeline } from '../agents/coordinator';

export interface CommandResult {
  isCommand: boolean;
  context?: string;
  directResponse?: string;
}

const COMMANDS = [
  { command: '/signals', description: 'Show latest trading signals' },
  { command: '/portfolio', description: 'Show portfolio summary' },
  { command: '/compare', description: 'Compare coins (e.g. /compare BTC ETH)' },
  { command: '/knowledge', description: 'Search knowledge base (e.g. /knowledge bitcoin halving)' },
  { command: '/run', description: 'Trigger agent pipeline' },
];

export function getAvailableCommands() {
  return COMMANDS;
}

export async function processCommand(message: string, userId?: string): Promise<CommandResult> {
  const trimmed = message.trim();
  if (!trimmed.startsWith('/')) return { isCommand: false };

  const parts = trimmed.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1).join(' ');

  switch (cmd) {
    case '/signals': {
      const signals = getTopSignals(10);
      if (signals.length === 0) return { isCommand: true, context: 'No signals found. The agent pipeline may not have run yet.' };
      const lines = signals.map(s =>
        `- **${s.coinSymbol}**: ${s.type.toUpperCase()} (${s.confidence}%) — ${s.reasoning.slice(0, 80)}`
      );
      return { isCommand: true, context: `## Latest Top Signals\n${lines.join('\n')}` };
    }

    case '/knowledge': {
      if (!args) return { isCommand: true, context: 'Usage: /knowledge <search query>' };
      const docs = searchDocuments(args, 5);
      if (docs.length === 0) return { isCommand: true, context: `No documents found for "${args}".` };
      const excerpts = docs.map(d => `### ${d.title}\n${d.content.slice(0, 500)}`);
      return { isCommand: true, context: `## Knowledge Base Results for "${args}"\n${excerpts.join('\n\n')}` };
    }

    case '/compare': {
      if (!args) return { isCommand: true, context: 'Usage: /compare BTC ETH SOL' };
      const symbols = args.split(/[\s,]+/).map(s => s.toUpperCase()).slice(0, 4);
      const signals = getRecentSignals(50);
      const relevant = signals.filter(s => symbols.includes(s.coinSymbol));
      const lines = symbols.map(sym => {
        const coinSignals = relevant.filter(s => s.coinSymbol === sym);
        const summary = coinSignals.length > 0
          ? coinSignals.map(s => `${s.type}(${s.confidence}%)`).join(', ')
          : 'No recent signals';
        return `- **${sym}**: ${summary}`;
      });
      return { isCommand: true, context: `## Comparison: ${symbols.join(' vs ')}\n${lines.join('\n')}\n\nFor full comparison with charts, visit the Compare page.` };
    }

    case '/run': {
      try {
        const runId = await runFullPipeline(userId);
        return { isCommand: true, directResponse: `Agent pipeline triggered (run: ${runId.slice(0, 8)}). Results will appear shortly.` };
      } catch (err: any) {
        return { isCommand: true, directResponse: `Failed to trigger pipeline: ${err.message}` };
      }
    }

    default:
      return { isCommand: false };
  }
}
