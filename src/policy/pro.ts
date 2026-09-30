/**
 * Who is Pro, decided from what the store last said.
 *
 * Pure TypeScript, no platform imports. `store.ts` asks Play, `entitlement-store`
 * writes the answer into `entitlement.json`, and everything that has to know
 * whether a feature is available asks `proStatus` of that file.
 *
 * Two ways in, and they are not treated alike:
 *
 * - **Lifetime.** `captions_unlock_v1`, the one-time purchase Wordburn sold before
 *   it sold subscriptions. Anybody who owns it has Pro for good, including every
 *   feature added after they paid. It is never taken away by this app, for the
 *   reason `syncEntitlement` gives: a tunnel, a Play Services update and a refund
 *   look identical from here.
 * - **Subscription.** `wordburn_pro` on one of three base plans. This one *is*
 *   taken away, because ending is the normal life of a subscription rather than
 *   an accident. What the app must not do is take it away because Play could not
 *   be reached, so the last answer is honoured for `OFFLINE_GRACE_DAYS` and then
 *   stops being believed.
 */
import type { Entitlement } from './free-tier';

export type PlanId = 'weekly' | 'monthly' | 'yearly';

export const PLAN_IDS: readonly PlanId[] = ['weekly', 'monthly', 'yearly'];

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === 'string' && (PLAN_IDS as readonly string[]).includes(value);
}

/** What `entitlement.json` remembers about a subscription. */
export interface SubscriptionRecord {
  /** The base plan, when Play named one we know. */
  plan: PlanId | null;
  /**
   * False once the user has cancelled. Play keeps the purchase until the paid
   * period runs out, so a cancelled subscription is still a live one.
   */
  renewing: boolean;
  /**
   * Account hold or paused. Play hands these back only when asked for suspended
   * purchases, and says in so many words that they must not be granted anything.
   */
  suspended: boolean;
  /** The last time Play confirmed any of this. */
  verifiedAt: string;
}

/** What one query of the store came back with. */
export interface StoreAnswer {
  lifetime: boolean;
  subscription: Omit<SubscriptionRecord, 'verifiedAt'> | null;
}

export type ProStatus =
  | { kind: 'free' }
  | { kind: 'lifetime' }
  | {
      kind: 'subscribed';
      plan: PlanId | null;
      renewing: boolean;
      /** True when Play has not answered for a day or more. Nothing is withheld. */
      unverified: boolean;
    }
  /** Paid for, but Play has frozen it: a failed payment, or the user paused it. */
  | { kind: 'suspended'; plan: PlanId | null };

/**
 * How long a subscription survives without Play answering.
 *
 * Two weeks, because the product is used on a phone that is not always online —
 * captions are made on the device, and the only thing that needs the network is
 * this check. Shorter and somebody on a fortnight's trip loses what they are
 * paying for; longer and a lapsed weekly plan keeps working for a month.
 */
export const OFFLINE_GRACE_DAYS = 14;

const DAY_MS = 24 * 60 * 60 * 1000;

export function proStatus(entitlement: Entitlement, now: Date = new Date()): ProStatus {
  if (entitlement.unlocked) return { kind: 'lifetime' };

  const subscription = entitlement.subscription;
  if (!subscription) return { kind: 'free' };
  if (subscription.suspended) return { kind: 'suspended', plan: subscription.plan };

  const verified = Date.parse(subscription.verifiedAt);
  const age = Number.isNaN(verified) ? Number.POSITIVE_INFINITY : now.getTime() - verified;
  if (age > OFFLINE_GRACE_DAYS * DAY_MS) return { kind: 'free' };

  return {
    kind: 'subscribed',
    plan: subscription.plan,
    renewing: subscription.renewing,
    unverified: age >= DAY_MS,
  };
}

/** Everything Pro gives, given. */
export function isPro(status: ProStatus): boolean {
  return status.kind === 'lifetime' || status.kind === 'subscribed';
}

/**
 * Folds one store answer into what the app remembers.
 *
 * Only ever called with an answer the store actually gave. When Play could not
 * be reached there is no answer, and the caller leaves the file alone — which is
 * what lets `OFFLINE_GRACE_DAYS` mean something.
 *
 * A lifetime purchase is recorded and never erased; a subscription is replaced
 * wholesale every time, including by nothing at all.
 */
export function applyStoreAnswer(
  entitlement: Entitlement,
  answer: StoreAnswer,
  now: Date = new Date()
): Entitlement {
  const lifetime =
    answer.lifetime && !entitlement.unlocked
      ? { unlocked: true, unlockedAt: now.toISOString() }
      : {};

  return {
    ...entitlement,
    ...lifetime,
    subscription: answer.subscription
      ? { ...answer.subscription, verifiedAt: now.toISOString() }
      : null,
  };
}

/** Records a purchase that just completed, before the next query confirms it. */
export function recordSubscribed(
  entitlement: Entitlement,
  plan: PlanId | null,
  now: Date = new Date()
): Entitlement {
  return {
    ...entitlement,
    subscription: { plan, renewing: true, suspended: false, verifiedAt: now.toISOString() },
  };
}
