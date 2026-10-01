/**
 * Developer builds can pretend to be any customer.
 *
 * Testing a Pro feature used to mean a build on a Play track, a licence-tested
 * account and a test purchase — and testing account hold meant waiting for Play
 * to put a test subscription on hold. Debug builds and `./run.sh --qa` release
 * builds can instead say what the store would have said: free, subscribed on a
 * plan, cancelled but paid up, on hold, or the legacy lifetime unlock.
 *
 * Three rules keep this from ever reaching a customer:
 *
 * - **It does not exist in a Play build.** `DEV_TOOLS` is `__DEV__`, or the
 *   `EXPO_PUBLIC_WORDBURN_QA` flag `./run.sh --qa` bakes into a release bundle;
 *   `scripts/build-aab.sh` refuses to build with that flag set. Metro inlines
 *   both, so in a Play build every branch below is dead code.
 * - **It never writes the purchase record.** The override lives in its own file
 *   and is laid over `entitlement.json` when it is read. Anything that saves the
 *   entitlement reads the stored one, so a pretend subscription cannot be
 *   exported into a real one.
 * - **It is never quiet.** Home says when an override is on.
 */
import type { Entitlement } from './free-tier';
import type { PlanId } from './pro';

export const DEV_TOOLS: boolean = __DEV__ || process.env.EXPO_PUBLIC_WORDBURN_QA === '1';

/** A release build with the developer tools in it. Labelled on Home, never uploaded. */
export const QA_BUILD: boolean = !__DEV__ && process.env.EXPO_PUBLIC_WORDBURN_QA === '1';

/**
 * A string that is in the JS bundle when, and only when, the developer tools
 * are. With the flag off the condition folds to false at build time and the
 * minifier drops the literal, so the build scripts can open the finished APK or
 * AAB and know rather than trust: `run.sh` and `build-aab.sh` both check.
 *
 * Why they have to: Gradle does not count an environment variable as an input,
 * so the first ordinary release after a `--qa` build reused the QA bundle and
 * shipped the Developer screen — caught on the A54 on 2026-10-01.
 */
export const QA_MARKER: string = DEV_TOOLS && !__DEV__ ? 'WORDBURN_QA_DEVELOPER_TOOLS_IN_THIS_BUNDLE' : '';

export type ProOverride =
  /** No override: whatever Play last said. */
  | { kind: 'play' }
  | { kind: 'free' }
  | { kind: 'subscribed'; plan: PlanId }
  /** Cancelled, still inside the period paid for. Pro, and says it is ending. */
  | { kind: 'cancelled'; plan: PlanId }
  /** Account hold or paused. Not Pro; the free tier says how to fix it. */
  | { kind: 'on-hold'; plan: PlanId }
  /** The legacy one-time purchase. */
  | { kind: 'lifetime' };

export const NO_OVERRIDE: ProOverride = { kind: 'play' };

/**
 * The entitlement as the app should see it, given an override.
 *
 * Pure. Everything else — `proStatus`, `freeTierStatus`, the watermark, the
 * dictionary cap, every Pro door — reads the result and cannot tell it from a
 * real answer, which is what makes the override a test of the real paths
 * rather than of a second set of them.
 */
export function withOverride(stored: Entitlement, override: ProOverride, now: Date = new Date()): Entitlement {
  const verifiedAt = now.toISOString();
  switch (override.kind) {
    case 'play':
      return stored;
    case 'free':
      return { ...stored, unlocked: false, subscription: null };
    case 'lifetime':
      return { ...stored, unlocked: true, unlockedAt: stored.unlockedAt ?? verifiedAt, subscription: null };
    case 'subscribed':
      return {
        ...stored,
        unlocked: false,
        subscription: { plan: override.plan, renewing: true, suspended: false, verifiedAt },
      };
    case 'cancelled':
      return {
        ...stored,
        unlocked: false,
        subscription: { plan: override.plan, renewing: false, suspended: false, verifiedAt },
      };
    case 'on-hold':
      return {
        ...stored,
        unlocked: false,
        subscription: { plan: override.plan, renewing: true, suspended: true, verifiedAt },
      };
  }
}

/** A few words for the banner on Home and the row in Settings. */
export function describeOverride(override: ProOverride): string {
  switch (override.kind) {
    case 'play':
      return 'Google Play';
    case 'free':
      return 'Free';
    case 'subscribed':
      return `Subscribed · ${override.plan}`;
    case 'cancelled':
      return `Cancelled · ${override.plan}`;
    case 'on-hold':
      return `On hold · ${override.plan}`;
    case 'lifetime':
      return 'Lifetime unlock';
  }
}
