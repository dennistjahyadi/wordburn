/**
 * What the app remembers about how it is used, on the phone and nowhere else.
 *
 * There is no analytics SDK and there will not be one from this file: nothing
 * here touches the network, and the privacy policy's "nothing is collected"
 * stays true. Events are appended to `events.jsonl` in the app's own storage,
 * where the only way out is the user choosing to send it.
 *
 * No event carries content. Not a word of a transcript, not a file name, not a
 * duration precise enough to identify a clip — only what happened and how many.
 * The union below is the whole vocabulary, so a new field has to be argued for
 * here rather than slipped in at a call site.
 */
import { File, Paths } from 'expo-file-system';

import type { PlanId } from '../policy/pro';

export type AnalyticsEvent =
  | { name: 'paywall_shown'; from: string }
  | { name: 'plan_selected'; plan: PlanId }
  | { name: 'trial_started'; plan: PlanId }
  | { name: 'subscribed'; plan: PlanId }
  | { name: 'batch_started'; count: number }
  | { name: 'autoclip_run'; duration_min: number; clips_found: number }
  | { name: 'language_selected'; language: string }
  | { name: 'export_done'; kind: 'single' | 'batch' | 'autoclip' };

/** Enough to see a month of heavy use; trimmed to this once it grows past it. */
export const MAX_EVENTS = 2000;
const TRIM_AT = MAX_EVENTS + 500;

function logFile(): File {
  return new File(Paths.document, 'events.jsonl');
}

/**
 * Appends one event. Never throws and never awaits anything: an event log that
 * could fail a purchase or an export would be the tail wagging the product.
 */
export function track(event: AnalyticsEvent, now: Date = new Date()): void {
  try {
    const file = logFile();
    const line = `${JSON.stringify({ ...event, at: now.toISOString() })}\n`;
    const existing = file.exists ? file.textSync() : '';
    file.write(trimLog(existing + line));
  } catch {
    // The product works whether or not this was written down.
  }
}

/** Keeps the newest `MAX_EVENTS` lines once the log passes `TRIM_AT`. */
export function trimLog(text: string): string {
  const lines = text.split('\n').filter((line) => line !== '');
  if (lines.length <= TRIM_AT) return text;
  return `${lines.slice(-MAX_EVENTS).join('\n')}\n`;
}

/** Every event still on the phone, oldest first. For Settings and for tests. */
export function readEvents(): (AnalyticsEvent & { at: string })[] {
  try {
    const file = logFile();
    if (!file.exists) return [];
    return file
      .textSync()
      .split('\n')
      .filter((line) => line !== '')
      .map((line) => JSON.parse(line) as AnalyticsEvent & { at: string });
  } catch {
    return [];
  }
}
