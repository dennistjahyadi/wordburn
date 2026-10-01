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
    'Batch captions: queue up to 20 clips, one style for all',
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
    lifetime: 'Every Pro feature is on for this account.',
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
    lifetime: 'Pro',
    subscribed: (plan: string) => `${plan} plan`,
    suspended: 'On hold: update payment',
  },
  onDevice: 'Processing happens on your device.',
};

export const welcome = {
  headline: 'Captions that look edited.',
  blurb: 'Caption one clip, or queue twenty and let your phone work through them.',
  start: 'Get started',
  restore: 'Already subscribed? Restore',
  nothingFound: 'No subscription or purchase found for this account.',
};

export const languages = {
  chip: (name: string) => `Spoken in ${name}`,
  sheetTitle: 'What language is spoken?',
  sheetNote: 'Captions come out in the language that is spoken. Wordburn does not translate.',
  builtIn: 'Built in',
  needsPro: 'Pro',
  needsDownload: 'Download',
  sharedModel: (size: string) => `Spanish, German, Dutch and Indonesian share one ${size} download.`,
  downloading: (percent: number) => `Downloading ${percent}%`,
  proTitle: 'More languages are part of Wordburn Pro',
  proBody: 'Spanish, German, Dutch and Indonesian captions come with Pro, along with batch captions and auto clip.',
  proCta: 'See Pro',
  notNow: 'Not now',
  downloadTitle: 'Download the language model?',
  downloadBody: (size: string) =>
    `Spanish, German, Dutch and Indonesian share one speech model. It is ${size} and downloaded once. Use Wi-Fi if you can.`,
  download: 'Download',
  stillDownloading: 'The language model is still downloading',
  lowMemoryTitle: 'Not available on this phone',
  stillDownloadingBody: 'It will be ready in a few minutes. You can keep using Wordburn in English meanwhile.',
  failed: 'The download did not finish',
  retry: 'Try again',
  settingsTitle: 'Languages',
  settingsDetail: {
    ready: (size: string) => `Model downloaded · ${size}`,
    absent: 'English only',
    downloading: (percent: number) => `Downloading ${percent}%`,
  },
  manage: {
    title: 'Languages',
    english: 'English is built into the app.',
    model: 'Spanish, German, Dutch and Indonesian',
    modelNote: (size: string) => `One speech model, ${size}. Downloaded from Hugging Face; your videos never are.`,
    remove: 'Remove the model',
    removeTitle: 'Remove the language model?',
    removeBody: 'Clips already captioned keep their words. You can download it again any time.',
    cancel: 'Stop download',
  },
};

export const looks = {
  save: 'Save look',
  title: 'Name this look',
  note: 'Saved looks can be picked for a whole batch. A name already in use is replaced.',
  placeholder: 'My podcast style',
  confirm: 'Save',
  cancel: 'Cancel',
  saved: (name: string) => `Saved as “${name}”`,
};

export const batch = {
  home: 'Batch',
  homeNote: 'Up to 20 clips',
  proTitle: 'Batch captions are part of Wordburn Pro',
  proBody: 'Queue up to 20 clips, pick one language and one style, and let your phone work through them.',
  busyTitle: 'A batch is still running',
  busyBody: 'Let it finish, or clear it from the queue, before starting another.',
  viewQueue: 'View queue',
  setupTitle: 'New batch',
  clips: (count: number) => (count === 1 ? '1 clip' : `${count} clips`),
  totalLength: (label: string) => `${label} of video`,
  tooMany: (max: number) => `Only the first ${max} clips are queued.`,
  language: 'Spoken language',
  style: 'Style for every clip',
  currentLook: 'Your default style',
  savedLooks: 'Saved looks',
  presets: 'Presets',
  start: (count: number) => (count === 1 ? 'Caption 1 clip' : `Caption ${count} clips`),
  galleryDenied: 'Wordburn needs to be able to save videos to your gallery to export a batch.',
  queueTitle: 'Queue',
  summary: (done: number, total: number) => `${done} of ${total} done`,
  failedCount: (failed: number) => (failed === 1 ? '1 failed' : `${failed} failed`),
  status: {
    queued: 'Waiting',
    cutting: 'Cutting',
    transcribing: 'Transcribing',
    rendering: 'Rendering',
    done: 'Saved to gallery',
    failed: 'Failed',
  },
  paused: {
    user: 'Paused',
    storage: 'Paused: your phone is running out of space. Free some up, then resume.',
    heat: 'Waiting for your phone to cool down. It carries on by itself.',
  },
  pause: 'Pause',
  resume: 'Resume',
  retry: 'Retry',
  open: 'Open',
  clear: 'Clear finished batch',
  empty: 'Nothing in the queue.',
  finished: 'All done. Every clip is in your gallery, in the Wordburn album.',
  homeRow: (done: number, total: number) => `Batch · ${done} of ${total} done`,
  homeRowPaused: 'Batch paused',
};

export const autoclip = {
  home: 'Auto clip',
  homeNote: 'Shorts from a long video',
  proTitle: 'Auto clip is part of Wordburn Pro',
  proBody: 'Drop in a podcast or a stream and get up to 10 suggested clips, captioned.',
  tooLongTitle: (minutes: number) => `Auto clip reads the first ${minutes} minutes`,
  tooLongBody: (minutes: number, total: number) =>
    `This video is ${total} minutes long. Transcribing more than ${minutes} minutes on a phone takes too long to be worth waiting for, so Wordburn will use the first ${minutes}.`,
  tooShortTitle: 'This video is short enough to caption as it is',
  tooShortBody: 'Auto clip is for videos of five minutes or more. Use New video instead.',
  continue: 'Continue',
  cancel: 'Cancel',
  resultsTitle: 'Suggested clips',
  resultsNote: (count: number) =>
    count === 0
      ? 'No clip between 20 and 60 seconds stood out. Add your own below.'
      : `The ${count} strongest moments, best first. Adjust, remove, or add your own.`,
  score: (score: number) => `${score}`,
  duration: (seconds: number) => `${seconds}s`,
  deadAir: 'Remove dead air',
  deadAirSaving: (before: number, after: number) => `${before}s → ${after}s`,
  adjust: 'Adjust',
  remove: 'Remove',
  addOwn: 'Add your own clip',
  start: 'Start',
  end: 'End',
  earlier: '‹ word',
  later: 'word ›',
  done: 'Done',
  caption: (count: number) => (count === 1 ? 'Caption 1 clip' : `Caption ${count} clips`),
  style: 'Style',
  reasons: {
    hook: 'Strong opening',
    question: 'Opens with a question',
    dense: 'Fast-paced',
    repeats: 'Stays on topic',
    complete: 'Ends cleanly',
    intro: 'Near the intro',
    outro: 'Near the outro',
  },
  processingTitle: 'Reading the whole video',
};

export const defaultStyle = {
  title: 'Default style',
  onboardingTitle: 'Pick your caption style',
  continue: 'Continue',
  note: 'Every new video, batch and auto clip starts in this style. The words above are a sample — changing this leaves the videos you have already captioned alone.',
  onboardingNote: 'Every video, batch and auto clip will start in this style, so you set it once. Change it any time in Settings → Default style.',
};
