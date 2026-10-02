/**
 * The downloaded language model: whether it is on the phone, getting it there,
 * and taking it off again.
 *
 * English is transcribed by the model in the APK and never touches this file.
 * Every other language shares one multilingual model that is too big to ship — the APK has five megabytes of headroom under Play's 150 — so it
 * is downloaded once, when somebody first picks one of those languages and says
 * yes to the size. One file is not a shortcut: whisper's multilingual weights
 * are one set for every language it knows, so a "Spanish model" would be this
 * same 874 MB again.
 *
 * Which model is `reports/Multilingual Whisper model for Android.md`'s answer:
 * large-v3-turbo at q8_0, the only file a phone can plausibly run that is under
 * about 6.5% word error on read speech in the four languages it was chosen for.
 * The four added since were chosen against it — see `src/domain/language.ts`. Its speed on the
 * A54 is the open question, which is why the whisper.rn patch builds a dotprod
 * variant for it to run on.
 *
 * It lives in `language-models/`, not `models/`. `pruneDownloadedModels` empties
 * `models/` on every launch, because that is where builds before the models
 * moved into the APK downloaded to.
 */
import { Directory, File, FileMode, Paths } from 'expo-file-system';

import * as ForegroundService from '../native/foreground-service';

export interface DownloadedModel {
  fileName: string;
  url: string;
  /** Exact, from Hugging Face's own listing. A file of any other size is not this model. */
  bytes: number;
  /**
   * The whole file's MD5, taken from the published file on 2026-09-30 (its
   * SHA-256 is 317eb69c…e259a1). A download is joined from ranges, and a range
   * the right length with the wrong bytes in it would otherwise load into
   * whisper as a model and produce nonsense.
   */
  md5: string;
  /** whisper.cpp's alignment-head preset for these weights. It must match them. */
  dtwPreset: 'large-v3-turbo';
}

export const MULTILINGUAL_MODEL: DownloadedModel = {
  fileName: 'ggml-large-v3-turbo-q8_0.bin',
  url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3-turbo-q8_0.bin',
  bytes: 874_188_075,
  md5: '55f3ab32bb2fc8941d0a250319cb526a',
  dtwPreset: 'large-v3-turbo',
};

/**
 * The least physical memory the model is offered on.
 *
 * whisper.cpp in this build reads the whole file into RAM — nothing is mapped —
 * so the 874 MB model plus its working buffers peaks around 1.5 to 2 GB. On a
 * 2 GB emulator the system killed every app on the device the moment the model
 * loaded, Wordburn included.
 *
 * The line is drawn between 4 GB and 6 GB phones, on what they *report*: the
 * kernel keeps some, so a 6 GB device says 5.3 to 5.8 GiB (the 6 GB test
 * emulator said 5.79) and a 4 GB one about 3.6. 4.5 GiB keeps the smaller
 * A54 in and a 4 GB phone out; a line at 5.5 would have shut out some of the
 * phones it was meant to admit.
 */
export const MIN_MEMORY_BYTES = 4.5 * 1024 * 1024 * 1024;

/** Whether this phone has the memory to run the downloaded model at all. */
export function canRunModel(): boolean {
  const total = ForegroundService.totalMemory();
  return total === null || total >= MIN_MEMORY_BYTES;
}

/** Room kept free beyond the model itself, so a download never fills the phone. */
const HEADROOM_BYTES = 300 * 1024 * 1024;

export type ModelState =
  | { kind: 'absent' }
  | { kind: 'downloading'; fraction: number }
  | { kind: 'ready' }
  | { kind: 'failed'; message: string };

function modelsDirectory(): Directory {
  return new Directory(Paths.document, 'language-models');
}

export function modelFile(model: DownloadedModel = MULTILINGUAL_MODEL): File {
  return new File(modelsDirectory(), model.fileName);
}

function partFile(model: DownloadedModel): File {
  return new File(modelsDirectory(), `${model.fileName}.part`);
}

/** On the phone and exactly the right size. Anything else is not a model. */
export function isModelReady(model: DownloadedModel = MULTILINGUAL_MODEL): boolean {
  try {
    const file = modelFile(model);
    return file.exists && file.size === model.bytes;
  } catch {
    return false;
  }
}

/** Megabytes the way a storage screen writes them: 874 MB. */
export function modelSizeLabel(model: DownloadedModel = MULTILINGUAL_MODEL): string {
  return `${Math.round(model.bytes / 1_000_000)} MB`;
}

// ------------------------------------------------------------------ state

let state: ModelState = { kind: 'absent' };
const listeners = new Set<(next: ModelState) => void>();
let running: { abort: AbortController; promise: Promise<boolean> } | null = null;

function publish(next: ModelState): void {
  state = next;
  for (const listener of listeners) listener(next);
}

/** What the model is doing right now. A finished download is read off the disk. */
export function modelState(): ModelState {
  if (state.kind === 'downloading' || state.kind === 'failed') return state;
  return isModelReady() ? { kind: 'ready' } : { kind: 'absent' };
}

export function subscribeModelState(listener: (next: ModelState) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * How the download is cut up. 874 MB in one request is lost to one dropped
 * connection — on the test emulator it died 340 MB in and started again from
 * nothing. In 64 MB ranges, a failure costs at most one range, a range is
 * retried before the user hears about it, and ranges already on the phone are
 * kept across a Try again, a Stop, and the app being killed.
 */
const SEGMENT_BYTES = 64 * 1024 * 1024;
const SEGMENT_ATTEMPTS = 4;
const RETRY_DELAYS_MS = [2_000, 5_000, 10_000];
/** How much of a finished range is copied into the model at a time. */
const JOIN_CHUNK_BYTES = 8 * 1024 * 1024;

function partsDirectory(): Directory {
  return new Directory(modelsDirectory(), 'parts');
}

function segmentFile(index: number): File {
  return new File(partsDirectory(), `segment-${String(index).padStart(3, '0')}.bin`);
}

/** The byte ranges, inclusive, that make up the model. */
export function segmentRanges(bytes: number, size: number = SEGMENT_BYTES): { start: number; end: number }[] {
  const ranges: { start: number; end: number }[] = [];
  for (let start = 0; start < bytes; start += size) {
    ranges.push({ start, end: Math.min(bytes, start + size) - 1 });
  }
  return ranges;
}

/**
 * Downloads the model, once, and resolves true when it is on the phone.
 *
 * A second call while one is running joins it rather than starting another
 * 874 MB. Each range lands in its own file and counts only at exactly its own
 * length; when every range is there they are joined into the model under
 * `.part` and renamed, so a model at the real name is always a whole one —
 * the same rule the audio decoder follows for `audio.pcm`.
 *
 * A foreground service holds the process for the length of it. Nobody watches
 * a progress bar for the minutes this takes.
 */
export function downloadModel(model: DownloadedModel = MULTILINGUAL_MODEL): Promise<boolean> {
  if (running) return running.promise;
  if (isModelReady(model)) {
    publish({ kind: 'ready' });
    return Promise.resolve(true);
  }

  if (!canRunModel()) {
    publish({ kind: 'failed', message: NOT_ENOUGH_MEMORY });
    return Promise.resolve(false);
  }

  if (Paths.availableDiskSpace < model.bytes + HEADROOM_BYTES) {
    publish({
      kind: 'failed',
      message: `This needs ${modelSizeLabel(model)} free, and a little more for your videos. Free up some space and try again.`,
    });
    return Promise.resolve(false);
  }

  const abort = new AbortController();
  const promise = (async () => {
    ForegroundService.start('Downloading languages', 0).catch(() => undefined);
    const ranges = segmentRanges(model.bytes);
    let lastPercent = -1;

    const report = (bytesOnPhone: number) => {
      const fraction = Math.min(1, bytesOnPhone / model.bytes);
      const percent = Math.floor(fraction * 100);
      if (percent === lastPercent) return;
      lastPercent = percent;
      publish({ kind: 'downloading', fraction });
      ForegroundService.update(percent).catch(() => undefined);
    };

    try {
      const parts = partsDirectory();
      if (!parts.exists) parts.create({ intermediates: true });

      const lengthOf = (range: { start: number; end: number }) => range.end - range.start + 1;
      const onPhone = (index: number) => {
        const file = segmentFile(index);
        return file.exists && file.size === lengthOf(ranges[index]);
      };
      let done = ranges.reduce((sum, range, index) => sum + (onPhone(index) ? lengthOf(range) : 0), 0);
      publish({ kind: 'downloading', fraction: done / model.bytes });

      for (let index = 0; index < ranges.length; index += 1) {
        if (onPhone(index)) continue;
        const range = ranges[index];
        await fetchRange(model.url, range, segmentFile(index), abort.signal, (written) => report(done + written));
        if (!onPhone(index)) throw new Error('The download did not arrive whole. Try again, on Wi-Fi if you can.');
        done += lengthOf(range);
        report(done);
      }

      joinSegments(ranges.length, partFile(model));
      const part = partFile(model);
      // Hashed natively, once: a few seconds for 874 MB, against a model that
      // would load and quietly produce nonsense if one range were corrupt.
      if (part.size !== model.bytes || part.info({ md5: true }).md5 !== model.md5) {
        clearSegments();
        part.delete();
        throw new Error('The download did not arrive whole. Try again, on Wi-Fi if you can.');
      }

      const target = modelFile(model);
      if (target.exists) target.delete();
      part.move(target);
      clearSegments();
      publish({ kind: 'ready' });
      return true;
    } catch (error) {
      if (abort.signal.aborted) {
        publish({ kind: 'absent' });
        return false;
      }
      publish({ kind: 'failed', message: describeDownloadFailure(error) });
      return false;
    } finally {
      ForegroundService.stop().catch(() => undefined);
      running = null;
    }
  })();

  running = { abort, promise };
  return promise;
}

/**
 * One range, retried before it is allowed to fail the download. A range is
 * fetched whole or not at all: a half-written one is deleted, because the next
 * attempt overwrites it from its start anyway.
 */
async function fetchRange(
  url: string,
  range: { start: number; end: number },
  target: File,
  signal: AbortSignal,
  onBytes: (written: number) => void
): Promise<void> {
  let lastError: unknown = null;
  for (let attempt = 0; attempt < SEGMENT_ATTEMPTS; attempt += 1) {
    if (signal.aborted) throw new Error('aborted');
    try {
      if (target.exists) target.delete();
      await File.downloadFileAsync(url, target, {
        idempotent: true,
        signal,
        headers: { Range: `bytes=${range.start}-${range.end}` },
        onProgress: ({ bytesWritten }) => onBytes(bytesWritten),
      });
      return;
    } catch (error) {
      lastError = error;
      if (signal.aborted) throw error;
      if (target.exists) target.delete();
      const delay = RETRY_DELAYS_MS[attempt];
      if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

/** Appends every range, in order, into one file. Nothing is held in memory but one chunk. */
function joinSegments(count: number, target: File): void {
  if (target.exists) target.delete();
  target.create();
  const out = target.open(FileMode.Append);
  try {
    for (let index = 0; index < count; index += 1) {
      const segment = segmentFile(index);
      const input = segment.open(FileMode.ReadOnly);
      try {
        let left = segment.size ?? 0;
        while (left > 0) {
          const chunk = input.readBytes(Math.min(JOIN_CHUNK_BYTES, left));
          if (chunk.length === 0) break;
          out.writeBytes(chunk);
          left -= chunk.length;
        }
      } finally {
        input.close();
      }
    }
  } finally {
    out.close();
  }
}

function clearSegments(): void {
  try {
    const parts = partsDirectory();
    if (parts.exists) parts.delete();
  } catch {
    // Left-over ranges are cleared by the next delete or the next download.
  }
}

/** Stops a download in flight. Finished ranges stay, so the next one carries on. */
export function cancelModelDownload(): void {
  running?.abort.abort();
}

/** Takes the model off the phone. Projects already transcribed keep their words. */
export function deleteModel(model: DownloadedModel = MULTILINGUAL_MODEL): void {
  try {
    const file = modelFile(model);
    if (file.exists) file.delete();
    clearSegments();
  } finally {
    publish({ kind: 'absent' });
  }
}

export const NOT_ENOUGH_MEMORY =
  'This phone does not have enough memory for the languages beyond English. English still works.';

function describeDownloadFailure(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (/did not arrive whole/.test(message)) return message;
  return 'The download stopped. Check your connection and try again, on Wi-Fi if you can.';
}
