import { z } from 'zod';
import type { AgentRole, AgentOutput, Signal } from '@crypto-saas/shared';

const SignalSchema = z.object({
  coinSymbol: z.string(),
  coinName: z.string(),
  type: z.enum(['buy', 'sell', 'hold', 'watch']),
  confidence: z.number().min(0).max(100),
  reasoning: z.string(),
  timeframe: z.string(),
});

export function parseAgentOutput(raw: string, agentRole: AgentRole, runId: string): AgentOutput {
  // Extract signals from <signals> tags
  const signalsMatch = raw.match(/<signals>([\s\S]*?)<\/signals>/);
  let parsedSignals: Omit<Signal, 'id' | 'createdAt'>[] = [];

  if (signalsMatch) {
    try {
      const json = JSON.parse(signalsMatch[1].trim());
      const arr = Array.isArray(json) ? json : [json];
      for (const item of arr) {
        const result = SignalSchema.safeParse(item);
        if (result.success) {
          parsedSignals.push({
            ...result.data,
            agentRole,
            runId,
          });
        }
      }
    } catch {
      // Try to extract individual JSON objects
      const jsonMatches = signalsMatch[1].match(/\{[^{}]*\}/g);
      if (jsonMatches) {
        for (const jsonStr of jsonMatches) {
          try {
            const result = SignalSchema.safeParse(JSON.parse(jsonStr));
            if (result.success) {
              parsedSignals.push({ ...result.data, agentRole, runId });
            }
          } catch { /* skip invalid */ }
        }
      }
    }
  }

  // Extract report content (everything outside <signals> tags)
  let reportContent = raw
    .replace(/<signals>[\s\S]*?<\/signals>/g, '')
    .trim();

  // If no content remains, use the full raw output
  if (!reportContent) reportContent = raw;

  // Extract metadata from <metadata> tags if present
  let metadata: Record<string, unknown> = {};
  const metaMatch = raw.match(/<metadata>([\s\S]*?)<\/metadata>/);
  if (metaMatch) {
    try {
      metadata = JSON.parse(metaMatch[1].trim());
      reportContent = reportContent.replace(/<metadata>[\s\S]*?<\/metadata>/g, '').trim();
    } catch { /* ignore */ }
  }

  return {
    report: {
      agentRole,
      content: reportContent,
      signals: parsedSignals as any,
      metadata,
      runId,
    },
    signals: parsedSignals,
  };
}
