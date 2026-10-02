/**
 * What is about to become a batch, on its way to the setup screen.
 *
 * Twenty picker results do not fit in a route's params, and the setup screen is
 * the only reader, so they wait here for the one navigation between the two.
 */
import type { BatchJob, Ms } from '../domain';

export interface DraftJob {
  /** The gallery's own name for a clip; the output is named after it. */
  name: string;
  durationMs: Ms;
  source: BatchJob['source'];
}

export interface Draft {
  jobs: DraftJob[];
}

let pending: Draft = { jobs: [] };

export function setDraft(draft: Draft): void {
  pending = draft;
}

export function takeDraft(): Draft {
  return pending;
}
