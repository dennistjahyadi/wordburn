/**
 * Every word the interface says, in English.
 *
 * This file is the shape the other eight follow: `Copy` is its type, and a
 * locale that misses a key does not compile. Strings that carry a number or a
 * name are functions, so each language can put the number where its grammar
 * wants it rather than where English did.
 *
 * The positioning these follow: Wordburn is a tool for people who make a lot of
 * short clips. It still makes every caption on the phone, and that is said once,
 * in Settings, rather than being the pitch. Nothing here says "free" about the
 * app as a whole, "offline", or "pay once".
 *
 * Preset names, the app's own name and "Pro" are not translated anywhere: a
 * style called Focus is called Focus in every language, the way a font is.
 */
import { Platform } from 'react-native';

import { DOWNLOADED_LANGUAGES, type Language } from '../domain';

/** Where the subscription lives, which is where the user manages it. */
const STORE = Platform.OS === 'ios' ? 'the App Store' : 'Google Play';

/**
 * `a, b and c`. Every locale has its own conjunction and its own comma rules,
 * so each one carries its own copy of this rather than sharing one.
 */
export function joinNames(names: string[], and: string, serialComma = false): string {
  if (names.length < 2) return names.join('');
  const head = names.slice(0, -1).join(', ');
  return `${head}${serialComma && names.length > 2 ? ',' : ''} ${and} ${names[names.length - 1]}`;
}

/**
 * How the interface names each of the nine languages, in this language.
 *
 * The native names (`Français`) come from the domain and never change; these
 * are what a French speaker sees Dutch called.
 */
const languageNames: Record<Language, string> = {
  en: 'English',
  nl: 'Dutch',
  fr: 'French',
  de: 'German',
  id: 'Indonesian',
  it: 'Italian',
  pl: 'Polish',
  pt: 'Portuguese',
  es: 'Spanish',
};

/**
 * The downloaded languages, said from the list rather than typed out: the copy
 * named four languages by hand in six places, and adding a fifth would have
 * left most of them saying four.
 */
const NUMBER_WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const moreCount = NUMBER_WORDS[DOWNLOADED_LANGUAGES.length] ?? String(DOWNLOADED_LANGUAGES.length);
const moreNames = joinNames(
  DOWNLOADED_LANGUAGES.map((language) => languageNames[language.code]),
  'and'
);

export const en = {
  /** The interface language's own name, as its picker shows it. */
  languageNames,

  common: {
    back: 'Back',
    cancel: 'Cancel',
    ok: 'OK',
    notNow: 'Not now',
    delete: 'Delete',
    keep: 'Keep',
    done: 'Done',
    save: 'Save',
    home: 'Home',
    retry: 'Try again',
    close: 'Close',
    play: 'Play',
    pause: 'Pause',
    seePro: 'See Pro',
    /** `1 word`, `173 words`. */
    words: (count: number) => (count === 1 ? '1 word' : `${count} words`),
    dateUnknown: 'date unknown',
  },

  welcome: {
    headline: 'Captions that look edited.',
    blurb: 'Caption one clip, or queue twenty and let your phone work through them.',
    /** Over the picker. The native names under it do the rest. */
    yourLanguage: 'Your language',
    languageNote: 'For the app and for the videos you caption. Change either later in Settings.',
    start: 'Get started',
    restore: 'Already subscribed? Restore',
    nothingFound: 'No subscription or purchase found for this account.',
  },

  home: {
    blurb: 'Caption one clip, or queue a batch of them.',
    newVideo: 'New video',
    settings: 'Settings',
    onThisPhone: 'On this phone',
    deleteTitle: 'Delete this project?',
    deleteBody: (project: string) => `${project}\n\nThe transcript goes with it. The video on your phone is not touched.`,
    stopped: 'Transcription stopped',
    tapToRetry: 'tap to try again',
    ready: 'ready',
    couldNotOpen: 'That video could not be opened',
    couldNotOpenMany: 'Those videos could not be opened',
    curtainTitle: 'Getting your video ready',
    curtainNote: 'A long clip takes a few seconds.',
    qaBuild: 'QA build',
    proOverride: (what: string) => `Pro override: ${what}`,
  },

  /** What Home says when the free tier's videos are gone. */
  freeVideos: {
    title: "You've used your free videos",
    body: 'Wordburn Pro captions as many videos as you like, with no watermark. The videos you have already captioned stay here to edit and export.',
  },

  /** The one line about the free tier, said the same way on every screen. */
  tier: {
    onHold: `Pro is on hold: update your payment in ${STORE}`,
    fixIt: 'Fix it',
    freeVideosUsed: 'Free videos used',
    freeVideosLeft: (left: number, watermarked: boolean) =>
      `${left === 1 ? '1 free video' : `${left} free videos`} left${watermarked ? ' · watermarked exports' : ''}`,
    watermark: 'Free exports carry a small watermark',
    trialEnded: 'Your trial has ended',
    trialLastDay: 'Last day of your trial',
    trialDaysLeft: (days: number) => `${days} days left in your trial`,
    freeExportsUsed: 'Free exports used',
    freeExportsLeft: (left: number) => (left === 1 ? '1 free export left' : `${left} free exports left`),
  },

  pro: {
    name: 'Wordburn Pro',
    headline: 'Caption every clip, not just one.',
    lede: 'Queue a batch of clips and export them clean.',
    /**
     * What Pro changes, and nothing it does not. The whole editor and all eighteen
     * styles are free, so neither is listed: a tick beside something the user
     * already has is a claim their own app contradicts. Neither are the languages:
     * all nine are free, inside the free tier's limit on videos.
     */
    benefits: [
      'Caption as many videos as you like',
      'No watermark on any export',
      'Batch captions: queue up to 20 clips, one style for all',
      'Unlimited dictionary words',
    ],
    plan: {
      weekly: 'Weekly',
      monthly: 'Monthly',
      yearly: 'Yearly',
    },
    yourPlan: 'Your',
    bestValue: 'Best value',
    save: (percent: number) => `Save ${percent}%`,
    perMonth: (amount: string) => `${amount} / month`,
    perPeriod: { week: 'per week', month: 'per month', year: 'per year' },
    trialBadge: (days: number) => `${days}-day free trial`,
    cta: (trialDays: number | null) => (trialDays ? `Start ${trialDays}-day free trial` : 'Continue'),
    /**
     * The terms under the button. Play's subscription policy wants the price, the
     * period, that it renews and how to cancel, all in view before the tap — and
     * for a trial, when the first charge happens. The App Store wants the same.
     */
    fineprint: (price: string, period: string, trialDays: number | null) =>
      trialDays
        ? `Free for ${trialDays} days, then ${price} ${period}. Renews automatically. Cancel anytime in ${STORE} at least a day before the trial ends and you will not be charged.`
        : `${price} ${period}. Renews automatically until you cancel, which you can do anytime in ${STORE}.`,
    restore: 'Restore purchases',
    terms: 'Terms',
    privacy: 'Privacy',
    retry: 'Try again',
    pending: 'Waiting for payment confirmation. You can close this: Pro turns on by itself when the payment clears.',
    nothingToRestore: 'No subscription or purchase found for this account.',
    /** Dennis's words, kept from the old Unlock screen. See CLAUDE.md. */
    goodwill:
      'Wordburn is built by one independent developer. Your support means more time to improve the app, fix the little things, and keep making it better. Thank you.',
    simulatedTitle: 'Simulated purchase',
    simulatedBody: 'No Google Play here: Pro is on through the developer override. Settings → Developer turns it off.',
    active: {
      title: "You're Pro",
      lifetime: 'Every Pro feature is on for this account.',
      renewing: (plan: string) => `${plan} plan. Manage or cancel it in ${STORE}.`,
      ending: (plan: string) => `${plan} plan, cancelled. Pro stays on until the end of the period you paid for.`,
      unverified: `${STORE} could not be reached, so this is what it said last time.`,
      manage: 'Manage subscription',
      home: 'Home',
      backToExport: 'Back to export',
      continue: 'Continue',
      back: 'Back',
    },
    hold: {
      title: 'Pro is on hold',
      body: `${STORE} could not take the last payment, or the plan is paused. Sort it out in ${STORE} and Pro comes straight back.`,
      fix: `Open ${STORE}`,
    },
    /** The link under every free-tier line. */
    upsell: 'Go Pro',
  },

  /** What the store says when it cannot sell. */
  store: {
    unreachable:
      Platform.OS === 'android'
        ? 'Google Play could not be reached on this phone. Check your connection and try again.'
        : 'The App Store could not be reached. Check your connection and try again.',
    nothing:
      Platform.OS === 'android'
        ? 'Google Play is not offering Wordburn Pro to your account yet. Try again later.'
        : 'The App Store is not offering Wordburn Pro to your account yet. Try again later.',
    didNotFinish: 'The store did not finish that.',
  },

  settings: {
    title: 'Settings',
    yourWords: 'Your words',
    nothingYet: 'Nothing yet',
    pro: 'Wordburn Pro',
    proDetail: {
      free: 'Free',
      lifetime: 'Pro',
      subscribed: (plan: string) => `${plan} plan`,
      suspended: 'On hold: update payment',
    },
    defaultStyle: 'Default caption style',
    appLanguage: 'App language',
    feedback: 'Give feedback',
    feedbackDetail: 'Email or TikTok',
    about: 'About',
    developer: 'Developer',
    onDevice: 'Processing happens on your device.',
    aboutPrivacy: 'Your videos, audio and transcripts are never uploaded, and there is no account.',
    aboutFonts: 'Type is set in Be Vietnam Pro and Spectral, both under the SIL Open Font License.',
    aboutWhisper: 'Speech recognition by whisper.cpp, MIT licensed.',
  },

  /** Settings → App language. */
  appLanguage: {
    title: 'App language',
    note: 'The language Wordburn speaks to you in. The language your videos are in is chosen on Home, for each clip.',
  },

  languages: {
    fieldLabel: 'Spoken language',
    sheetTitle: 'What language is spoken in this video?',
    sheetNote: "Captions are written in the language that is spoken. Wordburn doesn't translate.",
    /** The two groups in the list, and what the second one needs from where this person stands. */
    group: {
      builtIn: 'Built into the app',
      download: (size: string) => `One ${size} download for all ${moreCount}`,
      ready: 'Downloaded · ready to use',
    },
    /**
     * English goes to the English-only model, which turns any other language into
     * English-sounding nonsense; the downloaded one writes English words as
     * English. So for a video that mixes the two, the other language is the
     * right answer, and nobody would guess that.
     */
    mixedHint: 'Speaking English and another language in the same video? Pick the other language.',
    downloading: (percent: number) => `Downloading ${percent}%`,
    notNow: 'Not now',
    // "Model" is the engineer's word and nobody else's. Every download message
    // says what the person gets — languages — and what it costs: size, once.
    downloadTitle: `Download ${moreCount} more languages?`,
    downloadBody: (size: string) =>
      `To caption in ${moreNames}, Wordburn needs a one-time ${size} download. It covers all ${moreCount}. Use Wi-Fi if you can.`,
    download: 'Download',
    stillDownloading: 'Still downloading the languages',
    lowMemoryTitle: 'Not available on this phone',
    stillDownloadingBody: 'It will be ready in a few minutes. You can keep using Wordburn in English meanwhile.',
    failed: 'The download did not finish',
    retry: 'Try again',
    settingsTitle: 'Languages',
    settingsDetail: {
      ready: (size: string) => `Downloaded · ${size}`,
      absent: 'English only',
      downloading: (percent: number) => `Downloading ${percent}%`,
    },
    manage: {
      title: 'Languages',
      english: 'English is built into the app.',
      model: moreNames,
      // Where the file comes from (Hugging Face) is in the privacy policy, where
      // somebody who wants it will look. What this row owes a reader is what the
      // download is for, its size, and that their videos stay put.
      modelNote: (size: string) =>
        `These languages need a one-time ${size} download. Your videos stay on your phone.`,
      remove: 'Remove download',
      removeTitle: 'Remove these languages?',
      removeBody: (size: string) =>
        `This frees up ${size}. Videos you already captioned keep their captions. You can download the languages again any time.`,
      cancel: 'Stop download',
    },
    /** What the download machinery says when it cannot. */
    notEnoughMemory: 'This phone does not have enough memory for the languages beyond English. English still works.',
    needsSpace: (size: string) =>
      `This needs ${size} free, and a little more for your videos. Free up some space and try again.`,
    notWhole: 'The download did not arrive whole. Try again, on Wi-Fi if you can.',
    stopped: 'The download stopped. Check your connection and try again, on Wi-Fi if you can.',
    modelMissing: (language: string) =>
      `The ${language} model is not on this phone. Download it from Settings → Languages and try again.`,
    /** The notification's title while the languages download. */
    serviceTitle: 'Downloading languages',
  },

  looks: {
    save: 'Save look',
    title: 'Name this look',
    note: 'Saved looks can be picked for a whole batch. A name already in use is replaced.',
    placeholder: 'My podcast style',
    confirm: 'Save',
    cancel: 'Cancel',
    saved: (name: string) => `Saved as “${name}”`,
  },

  batch: {
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
    /** The queue's own failures, where no screen is watching. */
    transcriptionDidNotFinish: 'The transcription did not finish.',
    projectGone: 'The project is gone.',
    /** The notification's title while a batch runs. */
    serviceTitle: 'Captioning your clips',
    serviceProgress: (current: number, total: number) => `Captioning ${current} of ${total}`,
  },

  defaultStyle: {
    title: 'Default style',
    onboardingTitle: 'Pick your caption style',
    continue: 'Continue',
    note: 'Every new video and batch starts in this style. The words above are a sample — changing this leaves the videos you have already captioned alone.',
    onboardingNote: 'Every video and batch will start in this style, so you set it once. Change it any time in Settings → Default style.',
  },

  processing: {
    /** What the Processing screen shows as one short line, per stage. */
    stage: {
      queued: 'Getting ready',
      extracting: 'Getting audio',
      transcribing: 'Transcribing',
      aligning: 'Lining up words',
      ready: 'Done',
      paused: 'Paused — keep the app open to finish',
      failed: 'Something went wrong',
    },
    gone: 'That project is gone',
    backHome: 'Back to Home',
    aboutLeft: (time: string) => `About ${time} left`,
    seconds: (s: number) => `${s} s`,
    minutes: (m: number, s: number) => `${m} min ${s} s`,
    tapToPlay: 'Tap to play',
    listening: 'Listening for the first words',
    cancel: 'Cancel',
    /** The notification's title while a clip transcribes. */
    serviceTitle: 'Captioning your video',
  },

  editor: {
    back: 'Back',
    export: 'Export',
    undo: 'Undo',
    redo: 'Redo',
    undoStep: (label: string) => `Undo ${label}`,
    redoStep: (label: string) => `Redo ${label}`,
    fullScreen: 'Full screen',
    exitFullScreen: 'Exit full screen',
    toCheck: (count: number) => `${count} to check`,
    wordsToCheck: (count: number) => `${count} words to check`,
    style: 'Style',
    shiftAll: 'Shift all',
    shiftAllCaptions: 'Shift all captions',
    fixWithYourWords: (count: number) => `Fix ${count} with your words`,
    cantPlay: 'Couldn’t play this video on this phone. Try another file.',
    noWords: 'This project has no words yet.',
    notSure: (word: string) => `${word}, not sure about this one`,
    coach: 'Dotted words are ones the engine wasn’t sure about. Tap one to fix it.',
    showMe: 'Show me',
    gone: 'That project is gone',
    backHome: 'Back to Home',
    missingTitle: 'Can’t find this video',
    missingBody: (words: string) =>
      `The file this project was made from is not on the phone any more. Your ${words} are safe: pick the same video again and the captions come back with it.`,
    chooseAgain: 'Choose the video again',
    deleteProject: 'Delete project',
    deleteTitle: 'Delete this project?',
    deleteBody: (project: string) => `${project}\n\nThe transcript goes with it. This cannot be undone.`,
    couldNotUse: 'That video could not be used',
    couldNotOpen: 'That video could not be opened',
    differentTitle: 'That looks like a different video',
    differentBody: (projectLength: string, pickedLength: string) =>
      `The captions are timed to a ${projectLength} clip and this one is ${pickedLength}. They will not line up.`,
    pickAnother: 'Pick another',
    useAnyway: 'Use it anyway',
    /** The names of undo steps, read back as "Undo Edit word". */
    step: {
      timing: 'Timing',
      shiftCaptions: 'Shift captions',
      useYourWord: 'Use your word',
      useYourWords: 'Use your words',
      fixWords: (count: number) => `Fix ${count} words`,
      editWord: 'Edit word',
      joinWords: 'Join words',
      makeBig: 'Make big',
      makeNormal: 'Make normal',
      looksRight: 'Looks right',
      lineBreak: 'Line break',
      deleteWord: 'Delete word',
    },
    /** The editor refusing a change that broke an invariant. These should never be seen. */
    driftTitle: 'That edit moved the timing',
    driftBody: (label: string, reason: string) => `${label}: ${reason}. The edit was not applied.`,
    spillTitle: 'That timing change reached too far',
    spillBody: (label: string, reason: string) => `${label}: ${reason}. It was not applied.`,
    touchedTitle: 'That change touched the words',
    touchedBody: (label: string) => `${label} moves the offset only. It was not applied.`,
  },

  wordSheet: {
    playAgain: (word: string) => `Play “${word}” again`,
    play: 'Play',
    save: 'Save',
    done: 'Done',
    fixMore: (count: number) => `Fix ${count} more like this`,
    spaceSplits: 'A space splits the word in two.',
    edit: 'Edit',
    timing: 'Timing',
    timingFor: (word: string) => `Timing for ${word}`,
    makeBig: 'Make big',
    makeNormal: 'Make normal',
    addToWords: 'Add to your words',
    addToWordsFor: (word: string) => `Add ${word} to your words`,
    looksRight: 'Looks right',
    lineBreak: 'Line break',
    noLineBreak: 'No line break',
    joinNext: 'Join with next',
    deleteWord: 'Delete word',
    /** The subline. "Not sure about this one" rather than "low confidence". */
    notSure: 'Not sure about this one',
    madeBigAuto: 'made big automatically',
    madeBig: 'made big',
    byDictionary: 'changed by your dictionary',
  },

  timing: {
    title: 'Timing',
    apply: 'Apply',
    start: 'Start',
    end: 'End',
    move: 'Move',
    earlier: (label: string, ms: number) => `${label} ${ms} milliseconds earlier`,
    later: (label: string, ms: number) => `${label} ${ms} milliseconds later`,
    loopThisWord: 'Loop this word',
    looping: 'Looping',
    loop: 'Loop',
    cancel: 'Cancel',
    noWaveform: 'No waveform for this project. The steppers and the loop still work.',
  },

  shift: {
    title: 'Shift all captions',
    note: 'Every caption moves together. The words keep the timings they were said at.',
    apply: 'Apply',
    earlier: (ms: number) => `Captions ${ms} milliseconds earlier`,
    later: (ms: number) => `Captions ${ms} milliseconds later`,
    atZero: 'Captions land where the words were heard',
    landLater: 'Captions land later',
    landEarlier: 'Captions land earlier',
    cancel: 'Cancel',
  },

  stylePicker: {
    title: 'Style',
    note: 'The dashed box is what every platform leaves uncovered.',
    done: 'Done',
    colour: 'Colour',
    highlight: 'Highlight',
    text: 'Text',
    colourOf: (target: string) => `${target} colour`,
    swatch: (target: string, hex: string) => `${target} colour ${hex}`,
    customColour: 'Custom highlight colour',
    size: 'Size',
    sizeHint: 'Drag to any size, or tap S, M or L.',
    captionSize: 'Caption size',
    sizeValue: (px: number) => `${px} pixels on a 1080 by 1920 video`,
    position: 'Position',
    positionHint: 'Tap or drag in the frame to put them anywhere.',
    captionPosition: 'Caption position',
    positionValue: (percent: number) => `${percent}% down the frame`,
    upper: 'Upper',
    middle: 'Middle',
    lower: 'Lower',
    wordsPerLine: 'Words per line',
    fewer: 'Fewer',
    more: 'More',
    /**
     * Preset names, by id. Left out, a preset keeps its English name: Focus,
     * Neon and Rocket are names, not descriptions.
     */
    presets: {} as Partial<Record<string, string>>,
  },

  export: {
    title: 'Export',
    gone: 'That project is gone',
    backHome: 'Back to Home',
    galleryTitle: 'Wordburn cannot reach your gallery',
    galleryBody: 'Allow it to save videos in Settings, and the export will land in your gallery.',
    spaceTitle: 'Not enough space for this export',
    spaceBody: (needed: string, free: string) =>
      `It needs about ${needed} and there is ${free} free. Free some up, or try 720p in Options.`,
    failedTitle: 'That export did not finish',
    reading: 'Reading the video',
    withWatermark: 'with a watermark',
    noWatermark: 'no watermark',
    notOnIphone: 'Exporting is not built for iPhone yet',
    progress: (percent: number) => `${percent}% · you can leave the app`,
    cancel: 'Cancel',
    unlockToExport: 'Unlock to export',
    saveToGallery: 'Save to gallery',
    options: 'Options',
    alsoSrt: 'Also save .srt',
    /** What went wrong, in words the user can act on. */
    outOfSpace: 'This phone ran out of space while saving. Free some up and try again.',
    couldNotRender: 'Couldn’t render this video on this phone. Try 720p.',
    notBuiltIos: 'Exporting is not built for iPhone yet.',
    /** The notification's title while a file renders. */
    serviceTitle: 'Rendering your captions',
  },

  saved: {
    title: 'Saved to gallery',
    renderedIn: (seconds: string) => `rendered in ${seconds}s`,
    srtIn: (file: string, place: string) => `${file} is in ${place}`,
    placeIos: 'Files, under On My iPhone › Wordburn',
    placeAndroid: 'your Downloads',
    share: 'Share',
    backToEditor: 'Back to editor',
    home: 'Home',
    nothingToShareTitle: 'Nothing to share with',
    nothingToShareBody: 'This phone has no app that takes a video.',
    couldNotShare: 'That could not be shared',
  },

  feedback: {
    title: 'Give feedback',
    blurb: 'Share your ideas, suggestions, or anything you think could make Wordburn better. I read every message.',
    prompt: 'What’s working well? What could be better? Any features you’d love to see?',
    emailMe: 'Email me',
    dmTiktok: 'DM on TikTok',
    notNow: 'Not now',
    keepSubject: (tag: string) => `Keep “${tag}” in the subject and I’ll spot it.`,
    noMailTitle: 'No mail app set up',
    noMailBody: (email: string, subject: string) => `Send it to ${email} instead, with “${subject}” as the subject.`,
    noMailShort: (email: string) => `Send it to ${email} instead.`,
    tiktokFailed: 'TikTok would not open',
    tiktokHandle: (handle: string) => `The account is @${handle}.`,
    email: 'Email',
    tiktok: 'TikTok',
    cancel: 'Cancel',
  },

  dictionary: {
    title: 'Your words',
    addWord: 'Add a word',
    emptyTitle: 'No words yet',
    emptyBody: 'Fix a word in the editor and add it here, and every video after this one gets it right the first time.',
    editEntry: (word: string) => `Edit ${word}`,
    nothingHeard: 'Nothing heard yet',
    heardAs: (variants: string) => `heard as ${variants}`,
    deleted: (word: string) => `Deleted “${word}”`,
    undo: 'Undo',
    foot: 'Used on every new video. Words fixed this way are marked in the transcript.',
    footFree: (used: number, max: number) => `${used} of ${max} free.`,
    capTitle: (max: number) => `The free list holds ${max} words`,
    capBody: 'Wordburn Pro lifts the limit. Your words stay either way.',
    goPro: 'Go Pro',
    newWord: 'New word',
    save: 'Save',
    spelling: 'Spelling',
    spellingPlaceholder: 'KitVerify',
    heardAsLabel: 'Heard as',
    removeVariant: (variant: string) => `Remove ${variant}`,
    variantPlaceholder: 'what the engine writes instead',
    add: 'Add',
    delete: 'Delete',
    cancel: 'Cancel',
  },
};

export type Copy = typeof en;
