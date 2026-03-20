import cron from 'node-cron';
import { runFullPipeline, runSingleAgent } from './coordinator';
import { evaluateOutcomes } from '../services/accuracyService';
import { takeSnapshot } from '../services/portfolioService';
import { getAllUsersWithPositions } from '../models/portfolioModel';

let fullPipelineJob: cron.ScheduledTask | null = null;
let quickScanJob: cron.ScheduledTask | null = null;
let accuracyJob: cron.ScheduledTask | null = null;
let snapshotJob: cron.ScheduledTask | null = null;

export type ScheduleInterval = 'off' | '1h' | '6h' | '12h' | '24h';

const CRON_MAP: Record<Exclude<ScheduleInterval, 'off'>, string> = {
  '1h': '0 * * * *',
  '6h': '0 */6 * * *',
  '12h': '0 */12 * * *',
  '24h': '0 0 * * *',
};

let currentInterval: ScheduleInterval = '1h';

export function getScheduleInterval(): ScheduleInterval {
  return currentInterval;
}

export function setScheduleInterval(interval: ScheduleInterval) {
  // Stop existing pipeline job
  fullPipelineJob?.stop();
  fullPipelineJob = null;
  currentInterval = interval;

  if (interval === 'off') {
    console.log('[Scheduler] Pipeline auto-run disabled');
    return;
  }

  const cronExpr = CRON_MAP[interval];
  fullPipelineJob = cron.schedule(cronExpr, async () => {
    console.log(`[Scheduler] Starting scheduled pipeline run (every ${interval})...`);
    try {
      await runFullPipeline();
    } catch (error: any) {
      console.error('[Scheduler] Full pipeline failed:', error.message);
    }
  });

  console.log(`[Scheduler] Pipeline schedule set to every ${interval} (${cronExpr})`);
}

export function startScheduler() {
  // Full pipeline — default every hour
  setScheduleInterval('1h');

  // Quick market scan every hour
  quickScanJob = cron.schedule('0 * * * *', async () => {
    console.log('[Scheduler] Starting quick market scan...');
    try {
      await runSingleAgent('market_scanner');
    } catch (error: any) {
      console.error('[Scheduler] Quick scan failed:', error.message);
    }
  });

  // Signal accuracy evaluation every 6 hours
  accuracyJob = cron.schedule('30 */6 * * *', async () => {
    console.log('[Scheduler] Running accuracy evaluation...');
    try {
      await evaluateOutcomes();
    } catch (error: any) {
      console.error('[Scheduler] Accuracy evaluation failed:', error.message);
    }
  });

  // Portfolio snapshots daily at midnight
  snapshotJob = cron.schedule('0 0 * * *', async () => {
    console.log('[Scheduler] Taking portfolio snapshots...');
    try {
      const userIds = getAllUsersWithPositions();
      for (const userId of userIds) {
        await takeSnapshot(userId);
      }
      console.log(`[Scheduler] Snapshots taken for ${userIds.length} users`);
    } catch (error: any) {
      console.error('[Scheduler] Snapshot failed:', error.message);
    }
  });

  console.log('[Scheduler] Scheduled: pipeline every 1h, market scan every 1h, accuracy every 6h, snapshots daily');
}

export function stopScheduler() {
  fullPipelineJob?.stop();
  quickScanJob?.stop();
  accuracyJob?.stop();
  snapshotJob?.stop();
  console.log('[Scheduler] Stopped');
}
