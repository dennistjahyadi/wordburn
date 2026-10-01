/**
 * A batch: many clips, one language, one look, captioned one after another.
 *
 * Pure TypeScript. No react-native imports belong in this directory.
 *
 * The queue itself — the loop, the foreground service, the renders — is
 * `src/batch/queue.ts`. This file is what the queue is made of and the rules it
 * follows, so that "what happens next" and "what is this file called" can be
 * tested without a phone.
 */
import type { Language } from './language';
import type { Ms } from './types';
import type { StyleOverrides } from './style';

/** Where a job is. `transcribing` and `rendering` are the two slow halves. */
export type JobStatus = 'queued' | 'cutting' | 'transcribing' | 'rendering' | 'done' | 'failed';

/** A kept stretch of a longer video, for auto clip. The source's own timeline. */
export interface SourceRange {
  startMs: Ms;
  endMs: Ms;
}

export interface BatchJob {
  id: string;
  /**
   * What the job starts from. A whole clip from the gallery is transcribed and
   * then rendered; a cut from auto clip already has its words and is cut, then
   * rendered.
   */
  source:
    | { kind: 'file'; uri: string; durationMs: Ms }
    | { kind: 'cut'; projectId: string; segments: SourceRange[]; removedWordIds?: string[] };
  /** The original file's name without its extension, for the output's name. */
  name: string;
  status: JobStatus;
  /** 0..1 within the current status. */
  progress: number;
  /** The project this job made, once it has made one: its editor is one tap away. */
  projectId?: string;
  /** What it was saved to the gallery as. */
  outputName?: string;
  error?: string;
}

export type PauseReason = 'user' | 'storage' | 'heat';

export interface Batch {
  id: string;
  createdAt: string;
  language: Language;
  styleId: string;
  styleOverrides: StyleOverrides;
  jobs: BatchJob[];
  /** Set while the queue is stopped and waiting for something. */
  paused?: PauseReason;
}

/**
 * The most a batch takes at once. Twenty: about forty minutes of short clips,
 * which a phone can work through in one sitting without the queue outlasting
 * the battery or the user's patience with a hot phone in their pocket.
 */
export const MAX_BATCH_CLIPS = 20;

const ACTIVE: readonly JobStatus[] = ['cutting', 'transcribing', 'rendering'];

/**
 * The job to work on next: one that was interrupted mid-way first, then the
 * first still queued. A job interrupted by the app being killed is picked up
 * again rather than skipped — its checkpoints are on disk (invariant 3).
 */
export function nextJob(batch: Batch): BatchJob | null {
  return (
    batch.jobs.find((job) => ACTIVE.includes(job.status)) ??
    batch.jobs.find((job) => job.status === 'queued') ??
    null
  );
}

export function updateJob(batch: Batch, id: string, change: Partial<BatchJob>): Batch {
  return { ...batch, jobs: batch.jobs.map((job) => (job.id === id ? { ...job, ...change } : job)) };
}

/** Back in the queue, with the error and the half-made project forgotten. */
export function retryJob(batch: Batch, id: string): Batch {
  return updateJob(batch, id, { status: 'queued', progress: 0, error: undefined });
}

export interface BatchSummary {
  total: number;
  done: number;
  failed: number;
  remaining: number;
  /** 0..1 across the whole batch, counting each job's own progress. */
  fraction: number;
  finished: boolean;
}

/**
 * Where the whole batch stands. A job's two slow halves are weighted evenly;
 * the true split depends on the clip and the phone, and a bar that is roughly
 * right and never goes backwards is better than one that is precise and jumps.
 */
export function summarize(batch: Batch): BatchSummary {
  const total = batch.jobs.length;
  const done = batch.jobs.filter((job) => job.status === 'done').length;
  const failed = batch.jobs.filter((job) => job.status === 'failed').length;

  const weight = (job: BatchJob): number => {
    switch (job.status) {
      case 'done':
      case 'failed':
        return 1;
      case 'cutting':
      case 'transcribing':
        return job.progress * 0.5;
      case 'rendering':
        return 0.5 + job.progress * 0.5;
      default:
        return 0;
    }
  };

  const fraction = total === 0 ? 1 : batch.jobs.reduce((sum, job) => sum + weight(job), 0) / total;
  return { total, done, failed, remaining: total - done - failed, fraction, finished: done + failed === total };
}

/**
 * `<original>_captioned`, and `<original>_captioned 2` when that is taken.
 *
 * The original's name, because a batch of twenty named by timestamp is a batch
 * nobody can match back to what they shot. Characters a gallery or a share
 * sheet chokes on are replaced, and a name that is nothing but those becomes
 * "clip". `taken` is every name already used in this batch; the gallery itself
 * copes with a clash by renaming, but two files in one batch should never
 * depend on that.
 */
export function captionedFileName(original: string, taken: ReadonlySet<string>): string {
  const withoutExtension = original.replace(/\.[A-Za-z0-9]{1,5}$/, '');
  const cleaned = withoutExtension
    .replace(/[\\/:*?"<>|\u0000-\u001f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80)
    .trim();
  const stem = `${cleaned === '' ? 'clip' : cleaned}_captioned`;

  if (!taken.has(stem)) return stem;
  for (let n = 2; ; n += 1) {
    const candidate = `${stem} ${n}`;
    if (!taken.has(candidate)) return candidate;
  }
}

/**
 * What to call a picked clip, when there is nothing better than what the picker
 * said.
 *
 * Android's photo picker does not hand over a file's own name. It hands over
 * the media id — `39.mp4` — which is no name at all, and a batch of twenty of
 * those is a gallery nobody can match back to what they shot. So a name that is
 * only a number, or a long opaque id, becomes the day and the clip's place in
 * the batch; a real name is kept as it is.
 */
export function pickedClipName(
  fileName: string | null | undefined,
  index: number | null,
  at: Date
): string {
  const stem = (fileName ?? '').replace(/\.[A-Za-z0-9]{1,5}$/, '').trim();
  // A bare number (the photo picker's media id), a UUID anywhere at the start
  // (Samsung's picker: "bbe0eba4-7fe8-4dc4-8b4b-…", sometimes with a suffix), or
  // any long run of hex: none of them is a name a person gave a video.
  const opaque =
    stem === '' ||
    /^\d+$/.test(stem) ||
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-/i.test(stem) ||
    /^[0-9a-f-]{20,}$/i.test(stem);
  if (!opaque) return stem;

  const pad = (value: number) => String(value).padStart(2, '0');
  const day = `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}`;
  // A single video — auto clip's long one — is just the day; its cuts add the minute.
  return index === null ? day : `${day} clip ${pad(index + 1)}`;
}

/** A cut's name: the source's name and where in it the cut starts, "podcast 12m04s". */
export function cutName(sourceName: string, startMs: Ms): string {
  const seconds = Math.floor(startMs / 1000);
  const label = `${Math.floor(seconds / 60)}m${String(seconds % 60).padStart(2, '0')}s`;
  return `${sourceName} ${label}`;
}
