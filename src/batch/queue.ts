/**
 * The batch queue: one clip after another, in the background, until the list is
 * done or something needs the user.
 *
 * The only caller of `runToEnd` and `runExport` that nobody is watching. It
 * holds the foreground service for the whole batch, so the transcription and
 * the render inside each clip keep the process alive between them as well as
 * during, and it writes `batch.json` every time a job moves.
 *
 * Sequential, never parallel. One whisper context and one hardware encoder are
 * what the phone has; two clips at once would each take twice as long and the
 * second one would be the one the system killed.
 *
 * It stops, rather than fails, for the two things a phone does to a long job:
 * running short of storage, and running hot. Both are said on the Queue screen
 * in so many words. Heat clears by itself, so the queue waits and carries on;
 * storage needs the user, so the queue waits for them.
 */
import { Paths } from 'expo-file-system';

import { runToEnd, subscribe as subscribeRun, cancelRun } from '../asr/runner';
import { track } from '../analytics/events';
import {
  captionedFileName,
  nextJob,
  retryJob,
  summarize,
  updateJob,
  type Batch,
  type BatchJob,
  type MeasureText,
  type PauseReason,
} from '../domain';
import { cancelExport, runExport } from '../export/run';
import * as service from '../native/foreground-service';
import { adoptSource } from '../project/source';
import { createProject, loadProject, saveProject } from '../project/store';
import { makeThumbnail } from '../project/thumbnail';
import { loadBatch, saveBatch } from './store';

/** Below this, a clip is not started: its copy, its audio and its export need room. */
const MIN_FREE_BYTES = 500 * 1024 * 1024;
/** PowerManager.THERMAL_STATUS_SEVERE: the phone is already throttling hard. */
const TOO_HOT = 3;
const COOL_CHECK_MS = 20_000;

type Listener = (batch: Batch | null) => void;
const listeners = new Set<Listener>();

let batch: Batch | null = loadBatch();
let measure: MeasureText | null = null;
let running = false;
let stopRequested = false;

function publish(next: Batch | null): void {
  batch = next;
  saveBatch(next);
  for (const listener of listeners) listener(next);
}

export function subscribeBatch(listener: Listener): () => void {
  listeners.add(listener);
  listener(batch);
  return () => listeners.delete(listener);
}

export function currentBatch(): Batch | null {
  return batch;
}

export function isBatchRunning(): boolean {
  return running;
}

/**
 * The measurer the renders lay captions out with, handed over by `QueueHost`
 * once the caption fonts are loaded. The queue does not start without it: a
 * render laid out against the wrong fonts would disagree with the preview
 * (invariant 2).
 */
export function provideMeasure(next: MeasureText): void {
  measure = next;
}

/** Starts a new batch. Refused while another one still has work in it. */
export function startBatch(next: Batch): boolean {
  if (batch && !summarize(batch).finished) return false;
  track({ name: 'batch_started', count: next.jobs.length });
  publish(next);
  kick();
  return true;
}

/** Carries on: after a pause, after storage was freed, after the app was relaunched. */
export function resumeBatch(): void {
  if (!batch) return;
  publish({ ...batch, paused: undefined });
  kick();
}

/**
 * Stops after the part in flight is abandoned. The job goes back to the front
 * of the queue, not to failed: stopping is not the clip's fault, and its
 * checkpoints are still on disk.
 */
export function pauseBatch(): void {
  if (!batch) return;
  stopRequested = true;
  publish({ ...batch, paused: 'user' });
  cancelRun();
  cancelExport();
}

export function retryBatchJob(id: string): void {
  if (!batch) return;
  publish(retryJob(batch, id));
  kick();
}

/** Forgets a finished batch. Every clip it made stays a project on Home. */
export function clearBatch(): void {
  if (running) return;
  publish(null);
}

function kick(): void {
  if (running || !measure || !batch || batch.paused === 'user' || batch.paused === 'storage') return;
  void loop();
}

async function loop(): Promise<void> {
  running = true;
  stopRequested = false;

  try {
    await service.hold(serviceTitle(), 0);

    for (;;) {
      const current = batch;
      if (!current || stopRequested || current.paused === 'user') break;
      const job = nextJob(current);
      if (!job) break;

      // Heat first: it passes on its own, so the queue waits it out.
      if (service.thermalStatus() >= TOO_HOT) {
        publish({ ...current, paused: 'heat' });
        await sleep(COOL_CHECK_MS);
        continue;
      }
      if (current.paused === 'heat') publish({ ...current, paused: undefined });

      if (Paths.availableDiskSpace < MIN_FREE_BYTES) {
        pause('storage');
        break;
      }

      await service.retitle(serviceTitle(), Math.round(summarize(batch!).fraction * 100));
      await runJob(job);
    }
  } finally {
    running = false;
    await service.release();
  }
}

async function runJob(job: BatchJob): Promise<void> {
  try {
    const project = await transcribeFile(job);
    if (!project) return;
    await render(job, project.id);
  } catch (error) {
    if (stopRequested) {
      // Abandoned, not failed: back to the front of the queue as it was.
      move(job.id, { status: 'queued', progress: 0 });
      return;
    }
    move(job.id, { status: 'failed', error: describe(error) });
  }
}

/** A clip from the gallery: its own project, transcribed like any other. */
async function transcribeFile(job: BatchJob): Promise<ReturnType<typeof loadProject>> {
  if (!batch) return null;

  let project = job.projectId ? loadProject(job.projectId) : null;
  if (!project) {
    const created = createProject(job.source.uri, job.source.durationMs, batch.language);
    project = {
      ...created,
      sourceUri: adoptSource(created.id, job.source.uri),
      styleId: batch.styleId,
      styleOverrides: batch.styleOverrides,
    };
    saveProject(project);
    void makeThumbnail(project);
    move(job.id, { projectId: project.id });
  }
  if (project.status === 'ready') return project;

  move(job.id, { status: 'transcribing', progress: 0 });
  const id = project.id;
  const unsubscribe = subscribeRun((state) => {
    if (state.projectId === id) move(job.id, { progress: state.fraction });
  });
  try {
    const ended = await runToEnd(project);
    if (stopRequested) throw new Error('stopped');
    if (!ended || ended.stage !== 'ready') {
      throw new Error(ended?.error ?? 'The transcription did not finish.');
    }
    return ended.project;
  } finally {
    unsubscribe();
  }
}

async function render(job: BatchJob, projectId: string): Promise<void> {
  const project = loadProject(projectId);
  if (!project || !measure || !batch) throw new Error('The project is gone.');

  const taken = new Set(
    batch.jobs.filter((other) => other.id !== job.id && other.outputName).map((other) => other.outputName!)
  );
  const name = job.outputName ?? captionedFileName(job.name, taken);
  move(job.id, { status: 'rendering', progress: 0, outputName: name });

  await runExport({
    project,
    measure,
    resolution: '1080p',
    alsoSrt: false,
    reducedMotion: false,
    kind: 'batch',
    name,
    onProgress: (done) => move(job.id, { progress: done }),
  });
  move(job.id, { status: 'done', progress: 1 });
}

function move(id: string, change: Partial<BatchJob>): void {
  if (!batch) return;
  publish(updateJob(batch, id, change));
  if (change.progress !== undefined || change.status) {
    void service.retitle(serviceTitle(), Math.round(summarize(batch!).fraction * 100));
  }
}

function pause(reason: PauseReason): void {
  if (batch) publish({ ...batch, paused: reason });
}

function serviceTitle(): string {
  if (!batch) return 'Captioning your clips';
  const summary = summarize(batch);
  return `Captioning ${Math.min(summary.done + summary.failed + 1, summary.total)} of ${summary.total}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
