/**
 * The words the Pro, language, batch and auto clip screens say.
 *
 * Kept in one file so they can be translated later, which the rest of the app's
 * copy is not yet — it predates the ask and still lives beside the screens that
 * say it. New copy lands here; old copy moves here when it is next touched.
 *
 * The positioning these follow: Wordburn is a tool for people who make a lot of
 * short clips. It still makes every caption on the phone, and that is said once,
 * in Settings, rather than being the pitch. Nothing here says "free" about the
 * app as a whole, "offline", or "pay once".
 */

export const LINKS = {
  privacy: 'https://dennistjahyadi.github.io/wordburn/',
  terms: 'https://dennistjahyadi.github.io/wordburn/terms.html',
} as const;

export const pro = {
  name: 'Wordburn Pro',
  headline: 'Caption every clip, not just one.',
  lede: 'Queue a batch, cut shorts out of a long video, and export them clean.',
  /**
   * What Pro changes, and nothing it does not. The whole editor and all eighteen
   * styles are free, so neither is listed: a tick beside something the user
   * already has is a claim their own app contradicts.
   */
  benefits: [
    'No watermark on any export',
    'Batch captions: queue up to 30 clips, one style for all',
    'Auto clip: suggested shorts from a long video',
    'Spanish, German, Dutch and Indonesian captions',
    'Unlimited dictionary words',
  ],
  plan: {
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
  },
  bestValue: 'Best value',
  save: (percent: number) => `Save ${percent}%`,
  perMonth: (amount: string) => `${amount} / month`,
  trialBadge: (days: number) => `${days}-day free trial`,
  cta: (trialDays: number | null) => (trialDays ? `Start ${trialDays}-day free trial` : 'Continue'),
  /**
   * The terms under the button. Play's subscription policy wants the price, the
   * period, that it renews and how to cancel, all in view before the tap — and
   * for a trial, when the first charge happens.
   */
  fineprint: (price: string, period: string, trialDays: number | null) =>
    trialDays
      ? `Free for ${trialDays} days, then ${price} ${period}. Renews automatically. Cancel anytime in Google Play at least a day before the trial ends and you will not be charged.`
      : `${price} ${period}. Renews automatically until you cancel, which you can do anytime in Google Play.`,
  restore: 'Restore purchases',
  terms: 'Terms',
  privacy: 'Privacy',
  retry: 'Try again',
  pending: 'Waiting for payment confirmation. You can close this: Pro turns on by itself when the payment clears.',
  nothingToRestore: 'No subscription or purchase found for this account.',
  /** Dennis's words, kept from the old Unlock screen. See CLAUDE.md. */
  goodwill:
    'Wordburn is built by one independent developer. Your support means more time to improve the app, fix the little things, and keep making it better. Thank you.',
  active: {
    title: "You're Pro",
    lifetime: 'Pro for life, from your original Wordburn purchase. Everything new is yours too.',
    renewing: (plan: string) => `${plan} plan. Manage or cancel it in Google Play.`,
    ending: (plan: string) => `${plan} plan, cancelled. Pro stays on until the end of the period you paid for.`,
    unverified: 'Google Play could not be reached, so this is what it said last time.',
    manage: 'Manage subscription',
    home: 'Home',
    backToExport: 'Back to export',
    back: 'Back',
  },
  hold: {
    title: 'Pro is on hold',
    body: 'Google Play could not take the last payment, or the plan is paused. Sort it out in Google Play and Pro comes straight back.',
    fix: 'Open Google Play',
  },
  /** The link under every free-tier line. */
  upsell: 'Go Pro',
} as const;

export const settings = {
  pro: 'Wordburn Pro',
  proDetail: {
    free: 'Free exports carry a small watermark',
    lifetime: 'Pro for life',
    subscribed: (plan: string) => `${plan} plan`,
    suspended: 'On hold: update payment',
  },
  onDevice: 'Processing happens on your device.',
};

export const welcome = {
  headline: 'Captions that look edited.',
  blurb: 'Caption one clip, or queue thirty and let your phone work through them.',
  start: 'Get started',
  restore: 'Already subscribed? Restore',
  nothingFound: 'No subscription or purchase found for this account.',
};
