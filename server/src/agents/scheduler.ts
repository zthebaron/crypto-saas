import cron from 'node-cron';
import { runFullPipeline, runSingleAgent } from './coordinator';

let fullPipelineJob: cron.ScheduledTask | null = null;
let quickScanJob: cron.ScheduledTask | null = null;

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

  console.log('[Scheduler] Scheduled: full pipeline every 4h, market scan every 1h');
}

export function stopScheduler() {
  fullPipelineJob?.stop();
  quickScanJob?.stop();
  console.log('[Scheduler] Stopped');
}
