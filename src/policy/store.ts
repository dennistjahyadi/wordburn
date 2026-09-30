/**
 * The only place the store is called.
 *
 * Every screen that sells or restores the unlock goes through here, the way
 * `src/asr` is the only caller of whisper and `src/export/run.ts` the only caller
 * of the burn-in. What is awkward about billing is stated once: the connection is
 * lazy and never throws, a purchase arrives on an event rather than as a return
 * value, and Play will hand back a purchase that has not been acknowledged yet
 * and refund it three days later if nobody does.
 *
 * This is also the one part of the app that touches the network, and it is why
 * invariant 9 says "after the model is on disk" rather than "never". Nothing here
 * is ever awaited on a path that leads to a caption: the launch check is fire and
 * forget, and everywhere else the user asked for it and is watching a spinner.
 *
 * There is no receipt validation. It would need a server, this app has none by
 * design, and Play's own answer to `getAvailablePurchases` is the source of
 * truth. That is also why the subscription states are read the way Play Billing
 * reports them to a client: a purchase Play returns is live (grace period and
 * cancelled-but-paid-up included), a purchase Play returns as suspended is on
 * account hold or paused, and one it does not return has ended.
 */
import { Platform } from 'react-native';
import {
  deepLinkToSubscriptions,
  ErrorCode,
  fetchProducts,
  finishTransaction,
  getAvailablePurchases,
  initConnection,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
  restorePurchases,
  type ProductSubscription,
  type Purchase,
} from 'expo-iap';

import { plansFromOffers, type OfferInput, type Plan } from './plans';
import { isPlanId, type PlanId, type StoreAnswer } from './pro';

/**
 * The subscription, with three base plans: `weekly`, `monthly` and `yearly`.
 * The free trial is an offer on `yearly`, configured in Play Console.
 */
export const PRO_PRODUCT_ID = 'wordburn_pro';

/**
 * The one-time unlock Wordburn sold before it sold subscriptions.
 *
 * Nothing sells it any more, and it must stay here anyway: it is queried on every
 * launch alongside the subscription, and anybody who owns it has Pro for life,
 * every later feature included. Deleting this line would silently take a paid
 * product away from everybody who bought it. Deactivating it in Play Console
 * stops new sales without touching existing owners, which is the only change it
 * should ever get.
 */
export const LEGACY_UNLOCK_PRODUCT_ID = 'captions_unlock_v1';

const PACKAGE_NAME = 'com.wordburn.app';

export type PurchaseOutcome =
  /** Play says this account now has the plan. Write it down and move on. */
  | { kind: 'subscribed'; plan: PlanId }
  /** Play's "pending" state: cash, a parent's approval, a bank that is thinking. */
  | { kind: 'pending' }
  /** The user backed out of the sheet. Not a failure and never an alert. */
  | { kind: 'cancelled' }
  | { kind: 'failed'; message: string };

/**
 * The connection, opened once and reused.
 *
 * A rejection is cached as `false` rather than thrown: a phone with no Play
 * Services, a build the store has never heard of and a plane with no signal all
 * arrive here, and none of them is an error the user can act on. Every caller
 * checks the boolean. A failure is not cached forever, though — somebody who was
 * offline at launch and opens the paywall later deserves a second try.
 */
let connection: Promise<boolean> | null = null;

export function connectToStore(): Promise<boolean> {
  connection ??= initConnection()
    .then((ready) => ready !== false)
    .catch(() => false)
    .then((ready) => {
      if (!ready) connection = null;
      return ready;
    });
  return connection;
}

/**
 * What the plans cost, and why there are none when there are none.
 *
 * Three answers, because the two failures are not the same failure and the user
 * is owed the difference: a phone that cannot reach the store at all, and a store
 * that answered and has nothing to sell this account.
 */
export type PlansLookup =
  | { kind: 'priced'; plans: Plan[] }
  /** The store answered. It does not offer this product to this account. */
  | { kind: 'unavailable' }
  /** No answer at all: no connection, no Play Services, no store. */
  | { kind: 'offline' };

/**
 * The three plans, as Play prices them for this account.
 *
 * An empty price is treated as no product. Play Billing 8 stopped omitting a SKU
 * it cannot find and returns one with the fields blank instead, which the A54
 * showed as a button reading "Unlock for " with nothing after it.
 */
export async function loadPlans(): Promise<PlansLookup> {
  if (!(await connectToStore())) return { kind: 'offline' };

  try {
    const products = (await fetchProducts({ skus: [PRO_PRODUCT_ID], type: 'subs' })) ?? [];
    const product = products.find((candidate) => candidate.id === PRO_PRODUCT_ID) as
      | ProductSubscription
      | undefined;

    const plans = plansFromOffers(offersOf(product)).filter((plan) => plan.price.trim() !== '');
    return plans.length > 0 ? { kind: 'priced', plans } : { kind: 'unavailable' };
  } catch {
    return { kind: 'offline' };
  }
}

/** Play's offers, in the shape `plans.ts` reads. Only Android has them. */
function offersOf(product: ProductSubscription | undefined): OfferInput[] {
  if (!product || product.platform !== 'android') return [];

  return (product.subscriptionOffers ?? []).flatMap((offer) => {
    const token = offer.offerTokenAndroid;
    const basePlanId = offer.basePlanIdAndroid;
    const phases = offer.pricingPhasesAndroid?.pricingPhaseList ?? [];
    if (!token || !basePlanId || phases.length === 0) return [];

    return [
      {
        basePlanId,
        // expo-iap reports the base plan's own offer with the base plan id
        // standing in for an offer id Play leaves empty.
        offerId: offer.id && offer.id !== basePlanId ? offer.id : null,
        offerToken: token,
        phases: phases.map((phase) => ({
          billingPeriod: phase.billingPeriod,
          priceAmountMicros: Number(phase.priceAmountMicros),
          formattedPrice: phase.formattedPrice,
          currencyCode: phase.priceCurrencyCode,
          recurrenceMode: phase.recurrenceMode,
        })),
      },
    ];
  });
}

/**
 * Subscribes to one plan, and resolves with what actually happened.
 *
 * `requestPurchase` returns as soon as the sheet is up; the answer comes back on
 * a listener. Both listeners are attached before the sheet opens, because a
 * purchase that completes while nothing is listening is a user who paid and saw
 * nothing happen.
 */
export async function subscribe(plan: Plan): Promise<PurchaseOutcome> {
  if (!(await connectToStore())) {
    return { kind: 'failed', message: storeUnreachable() };
  }

  return new Promise<PurchaseOutcome>((resolve) => {
    let settled = false;

    const done = (outcome: PurchaseOutcome) => {
      if (settled) return;
      settled = true;
      updates.remove();
      errors.remove();
      resolve(outcome);
    };

    const updates = purchaseUpdatedListener((purchase) => {
      if (purchase.productId !== PRO_PRODUCT_ID) return;

      if (purchase.purchaseState === 'pending') {
        done({ kind: 'pending' });
        return;
      }

      // Acknowledged before the promise resolves. Play refunds an unacknowledged
      // purchase after three days, and there is no server here to do it later.
      void acknowledge(purchase);
      done({ kind: 'subscribed', plan: plan.id });
    });

    const errors = purchaseErrorListener((error) => {
      if (error.code === ErrorCode.UserCancelled) {
        done({ kind: 'cancelled' });
        return;
      }
      // Somebody already subscribed who lost the local record has not failed at
      // anything; they have restored it.
      if (error.code === ErrorCode.AlreadyOwned) {
        done({ kind: 'subscribed', plan: plan.id });
        return;
      }
      done({ kind: 'failed', message: error.message || 'The store did not finish that.' });
    });

    requestPurchase({
      type: 'subs',
      request: {
        google: {
          skus: [PRO_PRODUCT_ID],
          subscriptionOffers: [{ sku: PRO_PRODUCT_ID, offerToken: plan.offerToken }],
        },
        apple: { sku: PRO_PRODUCT_ID },
      },
    }).catch((error: unknown) => {
      done({ kind: 'failed', message: describe(error) });
    });
  });
}

/**
 * Asks the store what this account owns: the legacy unlock and the subscription.
 *
 * Null when the store could not be asked, which is different from an answer of
 * "nothing" and must be treated differently — see `applyStoreAnswer`.
 *
 * The same query answers Restore and the quiet check at launch, because on both
 * stores restoring is a query and not a transaction. Suspended purchases are
 * asked for too: without them account hold and a paused plan would look exactly
 * like a subscription that ended, and the user would be sold one they already
 * have. Anything owned, live and unacknowledged is acknowledged here — a
 * purchase that completed while the app was being killed, which Play is
 * counting down to refunding.
 */
export async function askStore(): Promise<StoreAnswer | null> {
  if (!(await connectToStore())) return null;

  try {
    // iOS needs a sync before the query to see a purchase made on another device.
    // On Android this is the query, so calling both is one round trip either way.
    if (Platform.OS === 'ios') await restorePurchases();

    const owned = await getAvailablePurchases({ includeSuspendedAndroid: true });

    const lifetime = owned.find(
      (purchase) =>
        purchase.productId === LEGACY_UNLOCK_PRODUCT_ID && purchase.purchaseState === 'purchased'
    );
    if (lifetime) void acknowledge(lifetime);

    const subscription = pickSubscription(
      owned.filter(
        (purchase) =>
          purchase.productId === PRO_PRODUCT_ID && purchase.purchaseState === 'purchased'
      )
    );
    if (subscription && !isSuspended(subscription)) void acknowledge(subscription);

    return {
      lifetime: !!lifetime,
      subscription: subscription
        ? {
            plan: planOf(subscription),
            renewing: subscription.isAutoRenewing,
            suspended: isSuspended(subscription),
          }
        : null,
    };
  } catch {
    return null;
  }
}

/** A live purchase over a suspended one, if Play ever returns both. */
function pickSubscription(purchases: Purchase[]): Purchase | undefined {
  return purchases.find((purchase) => !isSuspended(purchase)) ?? purchases[0];
}

function isSuspended(purchase: Purchase): boolean {
  return 'isSuspendedAndroid' in purchase && purchase.isSuspendedAndroid === true;
}

function planOf(purchase: Purchase): PlanId | null {
  return isPlanId(purchase.currentPlanId) ? purchase.currentPlanId : null;
}

/**
 * Opens Play's own page for this subscription: cancel, change plan, fix payment.
 *
 * The app never manages a subscription itself. Play's page is where the rules
 * live, and it is the page Play's policy expects a subscriber to be sent to.
 */
export async function openSubscriptionSettings(): Promise<void> {
  try {
    await deepLinkToSubscriptions({ skuAndroid: PRO_PRODUCT_ID, packageNameAndroid: PACKAGE_NAME });
  } catch {
    // Nothing useful to say: the Play Store app is either there or it is not.
  }
}

/**
 * Tells the store the goods were handed over.
 *
 * `isConsumable: false`, always: neither product is ever used up. Acknowledging
 * twice is an error on Play, so an acknowledged purchase is left alone, and a
 * failure here is swallowed — the user has what they paid for either way and
 * the next launch queries again.
 */
async function acknowledge(purchase: Purchase): Promise<void> {
  if ('isAcknowledgedAndroid' in purchase && purchase.isAcknowledgedAndroid) return;

  try {
    await finishTransaction({ purchase, isConsumable: false });
  } catch {
    // Nothing the user can do, and nothing worth showing them.
  }
}

/** What to say when the store cannot be reached at all. */
export function storeUnreachable(): string {
  return Platform.OS === 'android'
    ? 'Google Play could not be reached on this phone. Check your connection and try again.'
    : 'The App Store could not be reached. Check your connection and try again.';
}

/** What to say when the store answered and has nothing to sell this account. */
export function storeHasNothing(): string {
  return Platform.OS === 'android'
    ? 'Google Play is not offering Wordburn Pro to your account yet. Try again later.'
    : 'The App Store is not offering Wordburn Pro to your account yet. Try again later.';
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
