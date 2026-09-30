/**
 * The downloaded language model: whether it is on the phone, getting it there,
 * and taking it off again.
 *
 * English is transcribed by the model in the APK and never touches this file.
 * Spanish, German, Dutch and Indonesian share one multilingual model that is too
 * big to ship — the APK has five megabytes of headroom under Play's 150 — so it
 * is downloaded once, when somebody first picks one of those languages and says
 * yes to the size.
 *
 * Which model is `reports/Multilingual Whisper model for Android.md`'s answer:
 * large-v3-turbo at q8_0, the only file a phone can plausibly run that is under
 * about 6.5% word error on read speech in all four languages. Its speed on the
 * A54 is the open question, which is why the whisper.rn patch builds a dotprod
 * variant for it to run on.
 *
 * It lives in `language-models/`, not `models/`. `pruneDownloadedModels` empties
 * `models/` on every launch, because that is where builds before the models
 * moved into the APK downloaded to.
 */
import { Directory, File, Paths } from 'expo-file-system';

import * as ForegroundService from '../native/foreground-service';

export interface DownloadedModel {
  fileName: string;
  url: string;
  /** Exact, from Hugging Face's own listing. A file of any other size is not this model. */
  bytes: number;
  /** whisper.cpp's alignment-head preset for these weights. It must match them. */
  dtwPreset: 'large-v3-turbo';
}

export const MULTILINGUAL_MODEL: DownloadedModel = {
  fileName: 'ggml-large-v3-turbo-q8_0.bin',
  url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3-turbo-q8_0.bin',
  bytes: 874_188_075,
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
 * Downloads the model, once, and resolves true when it is on the phone.
 *
 * A second call while one is running joins it rather than starting another
 * 874 MB. The file is written under `.part` and renamed only when it is
 * exactly the right size, so a model at the real name is always a whole one —
 * the same rule the audio decoder follows for `audio.pcm`.
 *
 * A foreground service holds the process for the length of it. Nobody watches
 * a progress bar for the minutes this takes, and a download killed the moment
 * the user switched apps is one they would have to start again from nothing.
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
    publish({ kind: 'downloading', fraction: 0 });
    ForegroundService.start('Downloading the language model', 0).catch(() => undefined);
    let lastPercent = -1;

    try {
      const directory = modelsDirectory();
      if (!directory.exists) directory.create({ intermediates: true });
      const part = partFile(model);
      if (part.exists) part.delete();

      await File.downloadFileAsync(model.url, part, {
        idempotent: true,
        signal: abort.signal,
        onProgress: ({ bytesWritten }) => {
          const fraction = Math.min(1, bytesWritten / model.bytes);
          const percent = Math.floor(fraction * 100);
          if (percent === lastPercent) return;
          lastPercent = percent;
          publish({ kind: 'downloading', fraction });
          ForegroundService.update(percent).catch(() => undefined);
        },
      });

      if (part.size !== model.bytes) {
        part.delete();
        throw new Error('The download did not arrive whole. Try again, on Wi-Fi if you can.');
      }

      const target = modelFile(model);
      if (target.exists) target.delete();
      part.move(target);
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
      try {
        const part = partFile(model);
        if (part.exists) part.delete();
      } catch {
        // A stray .part is overwritten by the next attempt anyway.
      }
    }
  })();

  running = { abort, promise };
  return promise;
}

/** Stops a download in flight. What was fetched so far is thrown away. */
export function cancelModelDownload(): void {
  running?.abort.abort();
}

/** Takes the model off the phone. Projects already transcribed keep their words. */
export function deleteModel(model: DownloadedModel = MULTILINGUAL_MODEL): void {
  try {
    const file = modelFile(model);
    if (file.exists) file.delete();
  } finally {
    publish({ kind: 'absent' });
  }
}

export const NOT_ENOUGH_MEMORY =
  'This phone does not have enough memory for Spanish, German, Dutch and Indonesian. English still works.';

function describeDownloadFailure(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (/did not arrive whole/.test(message)) return message;
  return 'The download stopped. Check your connection and try again, on Wi-Fi if you can.';
}
