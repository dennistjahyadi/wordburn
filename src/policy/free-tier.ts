/**
 * What the free tier allows.
 *
 * Pure TypeScript, no platform imports.
 *
 * Invariant 5: whatever the limit is, the user sees it on Home before they pick
 * a video, and the Export screen never introduces a new wall. Discovering a
 * paywall after the work is done is the loudest complaint in this whole market.
 *
 * The policy is one object so the three candidates stay a one-line change.
 *
 * Who escapes it is `pro.ts`'s question, not this file's: a lifetime purchase or
 * a live subscription, and nothing else.
 */
import { isPro, proStatus, type SubscriptionRecord } from './pro';

export type FreeTierPolicy =
  | { kind: 'exports'; freeExports: number }
  | { kind: 'watermark' }
  | { kind: 'trial'; trialDays: number };

/**
 * The policy in force. Change this line, not the code that reads it.
 *
 * Unlimited exports, full quality, carrying a small mark. It was three clean
 * exports until it was not, and the argument that moved it is that **three was a
 * wall in front of the wrong thing**. Checking that the captions match the audio
 * never needed an export: the editor plays the real overlay through the real
 * layout, free and unlimited, which is invariant 2 doing its second job. What the
 * counter actually rationed was finished files — and it charged again for every
 * re-export after a style tweak, so three went in an afternoon.
 *
 * A mark trades that wall for a visible one. Nobody is stopped, the thing being
 * evaluated is still the real thing, and the unlock buys back the frame.
 * `layoutWatermark` holds where it goes and why it is small.
 */
export const FREE_TIER: FreeTierPolicy = { kind: 'watermark' };

/**
 * How many videos a free user may caption, on top of the policy above.
 *
 * A video is counted when it is picked on Home and its project is made — the
 * transcription is the work, so that is where the limit sits, and it is on Home
 * before the picker (invariant 5). Retrying a failed project, editing and
 * re-exporting a counted one are all free: they are the same video. Deleting a
 * project gives nothing back, or delete-and-repick would be unlimited.
 *
 * `null` turns it off.
 */
export const FREE_CAPTIONS: number | null = 3;

export interface Entitlement {
  /**
   * True once the legacy one-time purchase, `captions_unlock_v1`, is restored or
   * bought. It is Pro for life. The field kept its name because every
   * `entitlement.json` already on a phone spells it this way.
   */
  unlocked: boolean;
  /** The subscription as Play last described it, or null when it has none. */
  subscription?: SubscriptionRecord | null;
  /** Clean exports already taken on the free tier. */
  exportsUsed: number;
  /**
   * Videos captioned on the free tier, against `FREE_CAPTIONS`. Optional because
   * every `entitlement.json` written before the limit lacks it; absent is zero.
   */
  captionsUsed?: number;
  /** ISO date of first launch, which a trial policy counts from. */
  firstRunAt: string;
  /** ISO date the purchase was first seen on this phone. Settings shows it. */
  unlockedAt?: string;
}

export const NEW_ENTITLEMENT: Entitlement = {
  unlocked: false,
  exportsUsed: 0,
  captionsUsed: 0,
  firstRunAt: '',
};

export interface FreeTierStatus {
  /** The line under the New video button. Empty once the user has unlocked. */
  line: string;
  /** True when the next export needs an unlock first. */
  blocked: boolean;
  /** True when the next video needs Pro before it can be picked. Exports of videos already captioned are not affected. */
  captionBlocked: boolean;
  /** True when the next export carries a watermark. */
  watermark: boolean;
  /** Set when a subscription is on account hold or paused, so the link fixes it rather than sells it. */
  onHold?: true;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function freeTierStatus(
  entitlement: Entitlement,
  now: Date = new Date(),
  policy: FreeTierPolicy = FREE_TIER,
  freeCaptions: number | null = FREE_CAPTIONS
): FreeTierStatus {
  const status = proStatus(entitlement, now);
  if (isPro(status)) return { line: '', blocked: false, captionBlocked: false, watermark: false };

  const captionsLeft = freeCaptions === null ? null : Math.max(0, freeCaptions - (entitlement.captionsUsed ?? 0));
  const captionBlocked = captionsLeft === 0;

  // Somebody who is paying and whose card failed is not a free user who needs
  // selling to. They need to be told where to fix it, on the same line every
  // screen already reads, and the free tier applies until they do.
  if (status.kind === 'suspended') {
    return {
      line: 'Pro is on hold: update your payment in Google Play',
      blocked: false,
      captionBlocked,
      watermark: true,
      onHold: true,
    };
  }

  const exports = exportStatus(entitlement, now, policy);

  // The limit on videos is the louder fact, so it leads, and the mark rides
  // along: Home is the one place both have to be said before the picker. An
  // export wall, under a policy that has one, outranks it once it is up.
  if (captionsLeft === null || exports.blocked) return { ...exports, captionBlocked };
  if (captionsLeft === 0) return { ...exports, line: 'Free videos used', captionBlocked };
  const videos = captionsLeft === 1 ? '1 free video' : `${captionsLeft} free videos`;
  const mark = exports.watermark ? ' · watermarked exports' : '';
  return { ...exports, line: `${videos} left${mark}`, captionBlocked };
}

/** The export half of the status: what the next export costs a free user under each policy. */
function exportStatus(
  entitlement: Entitlement,
  now: Date,
  policy: FreeTierPolicy
): Omit<FreeTierStatus, 'captionBlocked'> {
  if (policy.kind === 'watermark') {
    return { line: 'Free exports carry a small watermark', blocked: false, watermark: true };
  }

  if (policy.kind === 'trial') {
    const left = daysLeft(entitlement.firstRunAt, now, policy.trialDays);
    if (left <= 0) return { line: 'Your trial has ended', blocked: true, watermark: false };
    return {
      line: left === 1 ? 'Last day of your trial' : `${left} days left in your trial`,
      blocked: false,
      watermark: false,
    };
  }

  const left = Math.max(0, policy.freeExports - entitlement.exportsUsed);
  // The spec's words for this state, and the only ones: Home, Export, Saved and
  // Settings all read this line, so a second phrasing anywhere would be the app
  // describing the same fact two ways on two screens.
  if (left === 0) return { line: 'Free exports used', blocked: true, watermark: false };
  return {
    line: left === 1 ? '1 free export left' : `${left} free exports left`,
    blocked: false,
    watermark: false,
  };
}

/** Records an export against the free tier. Pro users are never counted. */
export function recordExport(entitlement: Entitlement, now: Date = new Date()): Entitlement {
  if (isPro(proStatus(entitlement, now))) return entitlement;
  return { ...entitlement, exportsUsed: entitlement.exportsUsed + 1 };
}

/** Records a video captioned on the free tier. Pro users are never counted. */
export function recordCaption(entitlement: Entitlement, now: Date = new Date()): Entitlement {
  if (isPro(proStatus(entitlement, now))) return entitlement;
  return { ...entitlement, captionsUsed: (entitlement.captionsUsed ?? 0) + 1 };
}

/**
 * Records what the store said this account owns.
 *
 * `exportsUsed` is left exactly where it was. "Your free exports stay yours
 * either way" is on the Unlock screen, and a refund that put someone back on the
 * free tier must not hand them three more than they had. The date is kept from
 * the first time the unlock was seen, so reinstalling does not restart it.
 */
export function recordUnlock(entitlement: Entitlement, at: Date = new Date()): Entitlement {
  if (entitlement.unlocked) return entitlement;
  return { ...entitlement, unlocked: true, unlockedAt: at.toISOString() };
}

function daysLeft(firstRunAt: string, now: Date, trialDays: number): number {
  const started = Date.parse(firstRunAt);
  if (Number.isNaN(started)) return trialDays;
  const elapsed = Math.floor((now.getTime() - started) / DAY_MS);
  return Math.max(0, trialDays - elapsed);
}
