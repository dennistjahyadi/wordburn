/**
 * The batch on disk: `batch.json`, beside `settings.json`.
 *
 * Written every time a job moves, so a batch survives the app being killed
 * halfway through the tenth clip (invariant 3). One batch at a time — a queue
 * of queues is a thing to manage, and the point of this one is not having to.
 */
import { File, Paths } from 'expo-file-system';

import type { Batch } from '../domain';

function batchFile(): File {
  return new File(Paths.document, 'batch.json');
}

export function loadBatch(): Batch | null {
  const file = batchFile();
  if (!file.exists) return null;
  try {
    return JSON.parse(file.textSync()) as Batch;
  } catch {
    // A half-written file loses the queue, not the projects: every clip that
    // finished is already its own project on Home.
    return null;
  }
}

export function saveBatch(batch: Batch | null): void {
  const file = batchFile();
  if (batch === null) {
    if (file.exists) file.delete();
    return;
  }
  file.write(JSON.stringify(batch));
}
