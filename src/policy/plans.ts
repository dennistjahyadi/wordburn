/**
 * The three plans, as Play prices them.
 *
 * Pure TypeScript. `store.ts` turns Play's product into `OfferInput`s and hands
 * them here; nothing in this file knows about expo-iap.
 *
 * Nothing about a price is written in this app. The amount, the currency, the
 * symbol and where it goes all come from Play, per account and per country, and
 * the trial length is an offer configured in Play Console rather than a number
 * in this file. The one thing computed here is the yearly plan's per-month
 * equivalent, from Play's own micros, and it is formatted with the phone's own
 * `Intl` in the currency Play named — the same rule, one step further.
 */
import { PLAN_IDS, type PlanId } from './pro';

/** One pricing phase of one offer, the way Play Billing describes it. */
export interface PhaseInput {
  /** ISO 8601 duration: P3D, P1W, P1M, P1Y. */
  billingPeriod: string;
  priceAmountMicros: number;
  formattedPrice: string;
  currencyCode: string;
  /** 1 infinite (the base price), 2 finite (an intro), 3 once (a trial). */
  recurrenceMode: number;
}

export interface OfferInput {
  basePlanId: string;
  /** Null for the base plan's own offer, set for a trial or intro offer. */
  offerId: string | null;
  offerToken: string;
  phases: PhaseInput[];
}

export interface Plan {
  id: PlanId;
  /** What `requestPurchase` needs to buy exactly this offer. */
  offerToken: string;
  /** The recurring price, as Play wrote it: "$39.99", "Rp 649.000". */
  price: string;
  priceMicros: number;
  currency: string;
  period: 'week' | 'month' | 'year';
  /** Days of free trial this account is offered, or null. */
  trialDays: number | null;
}

/**
 * One plan per base plan, in weekly-monthly-yearly order.
 *
 * Play only returns offers an account is eligible for, so a trial offer showing
 * up here is Play saying this person may have it. Where there is one it wins
 * over the base plan's own offer; where there is none, the plan is sold at its
 * plain price. A base plan this app does not know is dropped rather than shown
 * with a guessed name.
 */
export function plansFromOffers(offers: OfferInput[]): Plan[] {
  const plans: Plan[] = [];

  for (const id of PLAN_IDS) {
    const candidates = offers.filter((offer) => offer.basePlanId === id);
    if (candidates.length === 0) continue;

    const withTrial = candidates.find((offer) => trialDaysOf(offer) !== null);
    const chosen = withTrial ?? candidates.find((offer) => offer.offerId === null) ?? candidates[0];

    const recurring = chosen.phases.find((phase) => phase.recurrenceMode === 1) ?? chosen.phases[chosen.phases.length - 1];
    if (!recurring) continue;

    const period = periodOf(recurring.billingPeriod);
    if (!period) continue;

    plans.push({
      id,
      offerToken: chosen.offerToken,
      price: recurring.formattedPrice,
      priceMicros: recurring.priceAmountMicros,
      currency: recurring.currencyCode,
      period,
      trialDays: trialDaysOf(chosen),
    });
  }

  return plans;
}

/** A free first phase is a trial. Anything else — a cheap first month — is not. */
function trialDaysOf(offer: OfferInput): number | null {
  const first = offer.phases[0];
  if (!first || offer.phases.length < 2 || first.priceAmountMicros !== 0) return null;
  return isoDays(first.billingPeriod);
}

/** Days in an ISO 8601 period, counting a month as 30 and a year as 365. */
export function isoDays(period: string): number | null {
  const match = /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?$/.exec(period);
  if (!match) return null;
  const [, y, m, w, d] = match.map((part) => (part ? Number(part) : 0));
  const days = y * 365 + m * 30 + w * 7 + d;
  return days > 0 ? days : null;
}

function periodOf(billingPeriod: string): Plan['period'] | null {
  switch (billingPeriod) {
    case 'P1W':
    case 'P7D':
      return 'week';
    case 'P1M':
      return 'month';
    case 'P1Y':
    case 'P12M':
      return 'year';
    default:
      return null;
  }
}

/** What the plan costs per month, in micros of its own currency. */
export function monthlyMicros(plan: Plan): number {
  switch (plan.period) {
    case 'week':
      return (plan.priceMicros * 52) / 12;
    case 'month':
      return plan.priceMicros;
    case 'year':
      return plan.priceMicros / 12;
  }
}

/**
 * How much cheaper yearly is than twelve months, as a whole percentage.
 *
 * Null when either plan is missing or they are priced in different currencies,
 * which Play does not do today and which would make the number a lie if it ever
 * did.
 */
export function yearlySaving(plans: Plan[]): number | null {
  const yearly = plans.find((plan) => plan.id === 'yearly');
  const monthly = plans.find((plan) => plan.id === 'monthly');
  if (!yearly || !monthly || yearly.currency !== monthly.currency || monthly.priceMicros <= 0) {
    return null;
  }
  const saving = 1 - yearly.priceMicros / (monthly.priceMicros * 12);
  return saving > 0 ? Math.floor(saving * 100) : null;
}

/**
 * Micros as money, in the phone's locale and the plan's currency.
 *
 * `Intl` knows that euros put the sign after the number in Germany, which is the
 * reason not to do this by hand. What it does not know is how Play writes a
 * price: ISO gives the rupiah two decimals and `Intl` follows it, so a yearly
 * plan came out "Rp 54.083,33 / month" under a price Play writes "Rp 649.000".
 * `fractionDigits` comes from Play's own string, via `fractionDigitsOf`, so the
 * two numbers on one card are written the same way. When the currency cannot be
 * formatted at all there is no per-month line rather than a wrong one.
 */
export function formatMicros(
  micros: number,
  currency: string,
  locale?: string,
  fractionDigits?: number
): string | null {
  try {
    const digits =
      fractionDigits === undefined
        ? {}
        : { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits };
    return new Intl.NumberFormat(locale, { style: 'currency', currency, ...digits }).format(
      micros / 1_000_000
    );
  } catch {
    return null;
  }
}

/**
 * An amount written exactly the way Play wrote another one.
 *
 * `Intl` was the first answer and it was wrong on the phone that matters: on
 * the A54, Play wrote the yearly plan "Rp 690.000" and `Intl` wrote its
 * per-month figure "IDR 57,500" — the currency's code instead of its symbol,
 * and the other separator — two prices on one card disagreeing about how money
 * is written. So the template is Play's own string: its symbol, its spacing,
 * its grouping and decimal marks are kept, and only the digits are replaced.
 * Null when the template has no number in it to replace.
 */
export function formatLike(template: string, micros: number): string | null {
  const match = /\d[\d.,\u00a0\u202f' ]*\d|\d/.exec(template);
  if (!match) return null;
  const number = match[0];

  const decimals = fractionDigitsOf(template);
  // The mark before the decimals, if any; every other separator is grouping.
  const decimalMark = decimals > 0 ? number[number.length - decimals - 1] : null;
  const groupMark = [...number.slice(0, decimalMark ? number.length - decimals - 1 : number.length)].find(
    (char) => !/\d/.test(char)
  );

  const fixed = (micros / 1_000_000).toFixed(decimals);
  const [whole, fraction] = fixed.split('.');
  const grouped = groupMark ? whole.replace(/\B(?=(\d{3})+(?!\d))/g, groupMark) : whole;
  const written = fraction && decimalMark ? `${grouped}${decimalMark}${fraction}` : grouped;

  return template.slice(0, match.index) + written + template.slice(match.index + number.length);
}

/**
 * How many decimals Play wrote a price with: "$39.99" and "39,99 €" have two,
 * "Rp 649.000" and "¥4,000" have none. A separator followed by exactly one or
 * two digits at the end of the number is a decimal point; three is grouping.
 */
export function fractionDigitsOf(price: string): number {
  const match = /[.,](\d+)\D*$/.exec(price);
  return match && match[1].length <= 2 ? match[1].length : 0;
}

/** "per week", "per month", "per year" — the plan's own period, for the card. */
export function perPeriod(plan: Plan): string {
  return `per ${plan.period}`;
}
