/**
 * Keeping the process alive while a clip transcribes.
 *
 * The service does no work. React Native's JS thread keeps running when the app
 * is backgrounded; what it cannot survive is the system deciding the process is
 * idle and freezing or killing it. A foreground service is what says otherwise,
 * and the notification is the price Android charges for saying it.
 *
 * Android only. On iOS the module is null, every call is a no-op and the runner
 * stops cleanly at the end of the current chunk instead, which is v1's stated
 * scope.
 */
import ForegroundService from '../../modules/foreground-service';

/**
 * A batch holds the service for its whole length. While it is held, the start
 * and stop that transcription, export and the model download each make are
 * folded into it: a stop between two clips would let the notification drop and
 * the process with it, for the second it takes the next clip to start.
 */
let held = false;

export async function hold(text: string, percent: number): Promise<void> {
  held = true;
  await startService(text, percent);
}

/** Retitles a held service: "Captioning 3 of 12". */
export async function retitle(text: string, percent: number): Promise<void> {
  if (held) await startService(text, percent);
}

export async function release(): Promise<void> {
  held = false;
  await stop();
}

/** The phone's thermal status, or 0 where there is no way to ask. */
export function thermalStatus(): number {
  if (!ForegroundService) return 0;
  try {
    return ForegroundService.thermalStatus();
  } catch {
    return 0;
  }
}

/** Physical RAM in bytes, or null where there is no way to ask. */
export function totalMemory(): number | null {
  if (!ForegroundService) return null;
  try {
    return ForegroundService.totalMemory();
  } catch {
    return null;
  }
}

export async function start(text: string, percent: number): Promise<void> {
  if (held) return update(percent);
  await startService(text, percent);
}

async function startService(text: string, percent: number): Promise<void> {
  if (!ForegroundService) return;
  try {
    await ForegroundService.start(text, percent);
  } catch {
    // A missing notification permission costs the notification, not the run.
    // Failing the transcription over it would be worse than running quietly.
  }
}

export async function update(percent: number): Promise<void> {
  if (!ForegroundService) return;
  try {
    await ForegroundService.update(percent);
  } catch {
    // As above.
  }
}

export async function stop(): Promise<void> {
  if (!ForegroundService || held) return;
  try {
    await ForegroundService.stop();
  } catch {
    // As above.
  }
}

/** Asks for the notification permission Android 13 and up needs to show progress. */
export async function requestNotifications(): Promise<boolean> {
  if (!ForegroundService) return true;
  try {
    return await ForegroundService.requestNotificationPermission();
  } catch {
    return false;
  }
}
