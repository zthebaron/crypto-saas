import type { AgentRole, AgentContext, AgentReport, WsEvent } from '@crypto-saas/shared';
import { AGENT_ROLES, AGENT_LABELS } from '@crypto-saas/shared';
import * as cmcService from '../services/cmcService';
import { createReport } from '../models/reportModel';
import { createSignal } from '../models/signalModel';
import { createAgentRun, completeAgentRun } from '../models/runModel';
import { MarketScannerAgent } from './marketScannerAgent';
import { SentimentAnalystAgent } from './sentimentAnalystAgent';
import { RiskAssessorAgent } from './riskAssessorAgent';
import { OpportunityScoutAgent } from './opportunityScoutAgent';
import { PortfolioAdvisorAgent } from './portfolioAdvisorAgent';
import { BaseAgent } from './baseAgent';
import { evaluateSignals } from '../services/notificationService';
import { evaluateSignalRules, evaluatePriceRules } from '../services/ruleEngine';
import { createOutcome } from '../models/outcomeModel';

type BroadcastFn = (event: WsEvent) => void;

const agentInstances: Record<AgentRole, BaseAgent> = {
  market_scanner: new MarketScannerAgent(),
  sentiment_analyst: new SentimentAnalystAgent(),
  risk_assessor: new RiskAssessorAgent(),
  opportunity_scout: new OpportunityScoutAgent(),
  portfolio_advisor: new PortfolioAdvisorAgent(),
};

const agentStatuses: Record<AgentRole, string> = {} as any;
for (const role of AGENT_ROLES) agentStatuses[role] = 'idle';

let broadcast: BroadcastFn = () => {};

export function setBroadcast(fn: BroadcastFn) {
  broadcast = fn;
}

export function getAgentStatuses() {
  return { ...agentStatuses };
}

function emit(type: WsEvent['type'], payload: unknown) {
  broadcast({ type, payload, timestamp: new Date().toISOString() });
}

export async function runFullPipeline(userId?: string, watchlist?: string[]): Promise<string> {
  const run = createAgentRun(userId);
  const runId = run.id;

  console.log(`[Pipeline] Starting full pipeline run ${runId}`);

  try {
    // Fetch market data once
    const [marketData, globalMetrics, trending] = await Promise.all([
      cmcService.getListingsLatest(100),
      cmcService.getGlobalMetrics(),
      cmcService.getTrendingGainersLosers(),
    ]);

    const completedReports: AgentReport[] = [];

    // Run agents sequentially
    for (const role of AGENT_ROLES) {
      agentStatuses[role] = 'running';
      emit('agent_status', { role, status: 'running', runId, label: AGENT_LABELS[role] });

      console.log(`[Pipeline] Running ${AGENT_LABELS[role]}...`);

      const context: AgentContext = {
        marketData,
        globalMetrics,
        trendingGainers: trending.gainers,
        trendingLosers: trending.losers,
        previousReports: completedReports,
        userWatchlist: watchlist,
        runId,
      };

      try {
        const agent = agentInstances[role];
        const output = await agent.run(context);

        // Save report
        const savedReport = createReport({
          agentRole: output.report.agentRole,
          content: output.report.content,
          metadata: output.report.metadata,
          runId: output.report.runId,
        });

        // Save signals
        const savedSignals = [];
        for (const signal of output.signals) {
          const saved = createSignal(signal);
          savedSignals.push(saved);
        }

        savedReport.signals = savedSignals;
        completedReports.push(savedReport);

        agentStatuses[role] = 'completed';
        emit('report_complete', {
          role,
          reportId: savedReport.id,
          signalCount: savedSignals.length,
          runId,
          label: AGENT_LABELS[role],
        });

        console.log(`[Pipeline] ${AGENT_LABELS[role]} completed with ${savedSignals.length} signals`);
      } catch (error: any) {
        console.error(`[Pipeline] ${AGENT_LABELS[role]} error:`, error.message);
        agentStatuses[role] = 'error';
        emit('agent_status', {
          role,
          status: 'error',
          error: error.message,
          runId,
          label: AGENT_LABELS[role],
        });
      }
    }

    // Collect all signals from this run for post-processing
    const allSavedSignals = completedReports.flatMap(r => r.signals);

    // Create outcome records for accuracy tracking
    for (const signal of allSavedSignals) {
      const coinPrice = marketData.find(c => c.symbol === signal.coinSymbol)?.price;
      if (coinPrice) {
        createOutcome(signal.id, signal.coinSymbol, signal.type, signal.agentRole, coinPrice);
      }
    }

    // Evaluate notification thresholds and alert rules
    try { await evaluateSignals(allSavedSignals); } catch (e) { console.error('[Pipeline] Notification eval error:', e); }
    try { evaluateSignalRules(allSavedSignals); } catch (e) { console.error('[Pipeline] Rule eval error:', e); }
    try { evaluatePriceRules(marketData); } catch (e) { console.error('[Pipeline] Price rule eval error:', e); }

    completeAgentRun(runId, 'completed');
    emit('pipeline_complete', { runId, status: 'completed' });

    // Reset statuses to idle
    for (const role of AGENT_ROLES) {
      if (agentStatuses[role] !== 'error') agentStatuses[role] = 'idle';
    }

    console.log(`[Pipeline] Run ${runId} completed`);
    return runId;
  } catch (error: any) {
    console.error(`[Pipeline] Fatal error:`, error.message);
    completeAgentRun(runId, 'error');
    for (const role of AGENT_ROLES) agentStatuses[role] = 'idle';
    throw error;
  }
}

export async function runSingleAgent(role: AgentRole, userId?: string): Promise<string> {
  const run = createAgentRun(userId);
  const runId = run.id;

  agentStatuses[role] = 'running';
  emit('agent_status', { role, status: 'running', runId });

  try {
    const [marketData, globalMetrics, trending] = await Promise.all([
      cmcService.getListingsLatest(100),
      cmcService.getGlobalMetrics(),
      cmcService.getTrendingGainersLosers(),
    ]);

    const context: AgentContext = {
      marketData,
      globalMetrics,
      trendingGainers: trending.gainers,
      trendingLosers: trending.losers,
      previousReports: [],
      runId,
    };

    const agent = agentInstances[role];
    const output = await agent.run(context);

    const savedReport = createReport({
      agentRole: output.report.agentRole,
      content: output.report.content,
      metadata: output.report.metadata,
      runId: output.report.runId,
    });

    for (const signal of output.signals) {
      createSignal(signal);
    }

    agentStatuses[role] = 'completed';
    emit('report_complete', { role, reportId: savedReport.id, signalCount: output.signals.length, runId });

    completeAgentRun(runId, 'completed');

    setTimeout(() => { agentStatuses[role] = 'idle'; }, 5000);
    return runId;
  } catch (error: any) {
    agentStatuses[role] = 'error';
    emit('agent_status', { role, status: 'error', error: error.message, runId });
    completeAgentRun(runId, 'error');
    throw error;
  }
}
