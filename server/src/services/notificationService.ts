import type { Signal } from '@crypto-saas/shared';
import { getDb } from '../models/database';
import { createNotification, getPreferences, getPushSubscriptions } from '../models/notificationModel';

export async function evaluateSignals(signals: Signal[]): Promise<void> {
  const db = getDb();
  // Get all users with notification preferences
  const allPrefs = db.prepare(
    'SELECT * FROM notification_preferences WHERE push_enabled = 1 OR email_enabled = 1'
  ).all() as any[];

  for (const pref of allPrefs) {
    const threshold = pref.signal_confidence_threshold || 80;
    const highConfidence = signals.filter(s => s.confidence >= threshold);

    if (highConfidence.length > 0) {
      const top = highConfidence[0];
      const title = `${top.type.toUpperCase()} Signal: ${top.coinSymbol}`;
      const body = `${top.confidence}% confidence — ${top.reasoning.slice(0, 100)}`;
      createNotification(pref.user_id, 'signal', title, body);
    }
  }
}

export async function notifyPipelineComplete(runId: string, signalCount: number): Promise<void> {
  const db = getDb();
  const allPrefs = db.prepare(
    'SELECT user_id FROM notification_preferences WHERE push_enabled = 1 OR email_enabled = 1'
  ).all() as any[];

  for (const pref of allPrefs) {
    createNotification(
      pref.user_id,
      'pipeline_complete',
      'Agent Pipeline Complete',
      `Pipeline run finished with ${signalCount} new signals.`
    );
  }
}
