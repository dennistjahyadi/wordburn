/**
 * What is about to become a batch, on its way to the setup screen.
 *
 * Thirty picker results, or ten of auto clip's cuts, do not fit in a route's
 * params, and the setup screen is the only reader, so they wait here for the one
 * navigation between the two.
 */
import type { BatchJob, Language, Ms } from '../domain';

export interface DraftJob {
  /** The gallery's own name for a clip, or the cut's name; the output is named after it. */
  name: string;
  durationMs: Ms;
  source: BatchJob['source'];
}

export interface Draft {
  jobs: DraftJob[];
  /** Set for auto clip's cuts: the language was decided when the long video was read. */
  language?: Language;
}

let pending: Draft = { jobs: [] };

export function setDraft(draft: Draft): void {
  pending = draft;
}

export function takeDraft(): Draft {
  return pending;
}
