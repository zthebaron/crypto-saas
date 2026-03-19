import cron from 'node-cron';
import { runFullPipeline, runSingleAgent } from './coordinator';
import { evaluateOutcomes } from '../services/accuracyService';
import { takeSnapshot } from '../services/portfolioService';
import { getAllUsersWithPositions } from '../models/portfolioModel';

let fullPipelineJob: cron.ScheduledTask | null = null;
let quickScanJob: cron.ScheduledTask | null = null;
let accuracyJob: cron.ScheduledTask | null = null;
let snapshotJob: cron.ScheduledTask | null = null;

export function startScheduler() {
  // Full pipeline every 4 hours
  fullPipelineJob = cron.schedule('0 */4 * * *', async () => {
    console.log('[Scheduler] Starting full pipeline run...');
    try {
      await runFullPipeline();
    } catch (error: any) {
      console.error('[Scheduler] Full pipeline failed:', error.message);
    }
  });

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

  console.log('[Scheduler] Scheduled: full pipeline every 4h, market scan every 1h, accuracy every 6h, snapshots daily');
}

export function stopScheduler() {
  fullPipelineJob?.stop();
  quickScanJob?.stop();
  accuracyJob?.stop();
  snapshotJob?.stop();
  console.log('[Scheduler] Stopped');
}
