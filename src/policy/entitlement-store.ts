/**
 * What the user has paid for, on disk.
 *
 * Read on Home before a video is picked, because the free-tier line has to be
 * there before the work starts (invariant 5). This file is the app's memory of
 * what the store said; `store.ts` is the only thing that asks the store.
 */
import { File, Paths } from 'expo-file-system';

import { NEW_ENTITLEMENT, type Entitlement } from './free-tier';
import { applyStoreAnswer, proStatus, recordSubscribed, type PlanId, type ProStatus } from './pro';
import { DEV_TOOLS, NO_OVERRIDE, withOverride, type ProOverride } from './dev-override';
import { askStore } from './store';

function entitlementFile(): File {
  return new File(Paths.document, 'entitlement.json');
}

/**
 * What the app should treat as paid for: the stored record, with a developer
 * override laid over it in debug and QA builds. Every reader uses this.
 */
export function loadEntitlement(): Entitlement {
  const stored = loadStoredEntitlement();
  return DEV_TOOLS ? withOverride(stored, loadProOverride()) : stored;
}

/**
 * The record itself, untouched by any override. Every writer starts from this,
 * so a pretend subscription can never be saved into a real one.
 */
export function loadStoredEntitlement(): Entitlement {
  const file = entitlementFile();
  if (!file.exists) {
    const fresh = { ...NEW_ENTITLEMENT, firstRunAt: new Date().toISOString() };
    saveEntitlement(fresh);
    return fresh;
  }

  try {
    return { ...NEW_ENTITLEMENT, ...(JSON.parse(file.textSync()) as Partial<Entitlement>) };
  } catch {
    return { ...NEW_ENTITLEMENT, firstRunAt: new Date().toISOString() };
  }
}

export function saveEntitlement(entitlement: Entitlement): void {
  entitlementFile().write(JSON.stringify(entitlement));
}

/** What the file says right now: free, lifetime, subscribed or on hold. */
export function loadProStatus(now: Date = new Date()): ProStatus {
  return proStatus(loadEntitlement(), now);
}

/** Writes down a purchase that just completed, ahead of the next query. */
export function markSubscribed(plan: PlanId | null): Entitlement {
  const subscribed = recordSubscribed(loadStoredEntitlement(), plan);
  saveEntitlement(subscribed);
  return subscribed;
}

/**
 * Asks the store what this account owns, and writes the answer down.
 *
 * Runs at launch and when the paywall or Settings opens. It never blocks
 * anything and it never tells the user when the answer is no.
 *
 * When Play cannot be reached nothing is written at all, so the last answer
 * stands and `OFFLINE_GRACE_DAYS` counts from when it was given. When Play does
 * answer, the subscription half is replaced by whatever it said, including by
 * nothing: a subscription that ended has ended. The lifetime half is only ever
 * added to — a legacy unlock is never taken away here, for the reason it never
 * was: a tunnel, a Play Services update and a refund look identical from here.
 *
 * Returns the entitlement only when Play answered, so a caller can redraw on an
 * answer rather than on every launch.
 */
export async function syncEntitlement(): Promise<Entitlement | null> {
  const answer = await askStore();
  if (!answer) return null;

  const next = applyStoreAnswer(loadStoredEntitlement(), answer);
  saveEntitlement(next);
  return DEV_TOOLS ? withOverride(next, loadProOverride()) : next;
}

// ------------------------------------------------------------- developer override

function overrideFile(): File {
  return new File(Paths.document, 'dev-override.json');
}

/** The developer's override, in debug and QA builds; nothing anywhere else. */
export function loadProOverride(): ProOverride {
  if (!DEV_TOOLS) return NO_OVERRIDE;
  try {
    const file = overrideFile();
    return file.exists ? (JSON.parse(file.textSync()) as ProOverride) : NO_OVERRIDE;
  } catch {
    return NO_OVERRIDE;
  }
}

export function saveProOverride(override: ProOverride): void {
  if (!DEV_TOOLS) return;
  const file = overrideFile();
  if (override.kind === 'play') {
    if (file.exists) file.delete();
    return;
  }
  file.write(JSON.stringify(override));
}
