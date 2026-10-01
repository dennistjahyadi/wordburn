# Play Console — every field, and the prompt that fills them

`ASO.md` carries the listing text and the reasoning behind it. `STORE-ASSETS.md`
carries the graphics. This file carries **the console itself**: every form Play
puts between a built bundle and a published app, with the answer already written.

Everything here was checked against the code and the merged release manifest on
2026-09-17, not against memory of what the app does.

---

## Read this before you open the console

Five things are wrong or missing right now. Two of them are policy violations if
you upload as-is.

### 1. ~~The description in ASO.md does not match the app~~ — closed

It used to. This section said `ASO.md` promised a watermark tier the code did not
have, and told you to change the listing or change the code. **The code changed.**
`src/policy/free-tier.ts`:

```ts
export const FREE_TIER: FreeTierPolicy = { kind: 'watermark' };
```

Unlimited exports, full quality, carrying a small mark that the unlock removes —
which is what `ASO.md` said all along. The argument for moving is in that file
and in `layoutWatermark`: the three-export counter was a wall in front of the
wrong thing, because checking that the captions match the audio never needed an
export at all.

**So the inversion is the thing to watch.** The full description further down
this file was written against the three-export tier and is now the one that
lies. It has been rewritten again, to the watermark tier. Whichever of these two
files you paste from, paste from the one that agrees with `free-tier.ts`, and
check it rather than remembering it.

`ASO.md` is still stale on the presets: it says four styles and
`src/domain/style.ts` has nine. Fixed below.

### 2. The privacy policy is written but not yet hosted

A public URL is required for every app, with or without data collection. The
policy is now a page in this repository, `docs/index.html`, ready for GitHub
Pages off `main` — see section 10 for the switch to flip and the one line still
to fill in. Until Pages is enabled there is no URL, and without a URL Play will
not take the app.

### 3. The bundle on disk says 0.0.1 — now fixed at the build

`app.json` said `1.0.0` while the bundle sitting in `android/` said
`versionName="0.0.1"`, because `android/` is generated, is not in git, and this
copy predated the version bump. `build-aab.sh` printed "version 1.0.0" on the way
out regardless, because it read `app.json` rather than the bundle.

Both halves are closed now. Every build syncs the generated project from
`app.json` first and then reads the version back out of the finished artifact,
so a bundle can no longer carry a version nobody asked for:

```sh
npm run version:show         # 1.0.0 (1)
./aab.sh                     # syncs, builds, verifies, archives
```

The bundle lands at `build/wordburn-<version>-<code>.aab` with its SHA-256
beside it. **Whatever is in that filename is what Play will see.**

Target API is already 36, comfortably over Play's floor of 35. `minSdk` 29,
`versionCode` 1. Both fine for a first upload.

**After the first upload, versionCode 1 is spent.** Play refuses a number it has
already seen, so every later bundle needs `npm run bump` first — and `./aab.sh`
refuses to build a code it has already archived rather than letting you find out
at the end of an upload.

### 4. Nobody has bought anything, and the product for sale is now a subscription

`captions_unlock_v1` was never created and nobody ever bought it. The app now
sells **`wordburn_pro`**, a subscription with three base plans, and still
queries the old ID on every launch so that anybody who ever owns it keeps Pro
for life. With no sales there is nobody to protect today; **do not create
`captions_unlock_v1` at all**, and the query stays a harmless no-op. Section 9
has the subscription, field by field. The order that works is still: upload to
Internal testing → create the subscription → add a licence-tested account →
subscribe for free.

### 5. ~~DEX code optimization is below Play's threshold~~ — fixed at the build

Release 104 earned a **Bad behavior** flag on its bundle: "DEX code optimization
is below our threshold", **Obfuscation 1%**, optimization and shrinking blank,
"fix by Feb 2027". The cause was that release builds had never been through R8 —
Expo's generated project leaves `minifyEnabled` off and nothing warns.

Fixed in `app.json` and `plugins/with-r8-optimization.js`; CLAUDE.md, under
"Things Android taught us the hard way", carries what was wrong and what the
keep rules had to protect. The bundle now reports 84% obfuscated, 84% shrunk and
83% optimized, against Play's floor of 25%, and its DEX went from 51 MB to
11.9 MB.

**Nothing in the console closes this — a new bundle does.** The flag is attached
to release 104, which is spent, so the fix reaches Play with the next upload:
`npm run bump`, then `./aab.sh`.

### Two permission declarations you will be asked to justify

The merged release manifest carries permissions that pull extra forms:

| Permission | Where it comes from | What Play does |
|---|---|---|
| `READ_MEDIA_VIDEO`, `READ_EXTERNAL_STORAGE` | expo-image-picker | Photo and Video Permissions declaration |
| `FOREGROUND_SERVICE_MEDIA_PROCESSING`, `FOREGROUND_SERVICE_DATA_SYNC` | `modules/foreground-service` | Foreground service declaration, with a demo video |
| `RECORD_AUDIO` | whisper.rn | nothing — but it shows on your listing |
| `CAMERA` | expo-image-picker | nothing — but it shows on your listing |

Text for the two declarations is in section 7. The last two are worth a thought
before upload rather than after: this app never records audio and never opens a
camera, and an app whose entire pitch is *"nothing leaves your phone"* listing
Microphone and Camera on its store page is arguing against itself. Both can be
stripped in a config plugin with `tools:node="remove"`. Not done here because it
is a code change, not a console one.

---

## The prompt for the Claude browser extension

Paste this into Claude for Chrome with Play Console open. It fills forms; it does
not decide anything and it does not submit.

**What the extension cannot do:** upload files. The AAB, the icon, the feature
graphic and the screenshots all need your own file picker. The prompt tells it to
stop and hand those back to you.

**One thing that is irreversible:** the package name `com.wordburn.app` hardens
permanently at first upload, and the app name at first publish is what the
listing is created under. Check both yourself before anything is submitted.

```
You are filling in the Google Play Console for an app called Wordburn
(package com.wordburn.app). I have a file open at PLAY-CONSOLE.md with the
exact text for every field. I will paste each section to you as we go.

Rules, all of them hard:

1. NEVER click "Submit for review", "Send for review", "Start rollout",
   "Publish", or "Save and publish". Fill the fields, save drafts where a
   Save button exists, and stop. I do the submitting.
2. NEVER accept, sign, or agree to any Google agreement, policy, or terms
   dialog. Stop and tell me it is there.
3. NEVER invent an answer. If a field is not covered by the text I pasted,
   stop and ask me. A guessed answer on a Data safety or content rating
   form is a policy violation, not a typo.
4. NEVER enter payment details, bank details, or tax information.
5. When a step needs a file upload, stop and tell me the exact filename and
   where it is. You cannot use the file picker and should not try.
6. Copy text EXACTLY as I paste it, including line breaks and the blank
   lines between paragraphs. Do not fix, shorten, rephrase or "improve"
   anything. Play counts characters and I have counted them already.
7. After each section, tell me: which fields you filled, which you skipped
   and why, and whether the page saved cleanly.

Work one section at a time and wait for me between sections. Start by
telling me which Play Console page is currently open and what state the
app is in, then wait.
```

Then paste the sections below one at a time, in order. Sections 1–4 are safe to
let it type. Sections 5–8 are questionnaires whose answers are legal statements
about the app — read each answer yourself before you let it click.

---

## 1. Create the app

Play Console → All apps → Create app.

| Field | Value |
|---|---|
| App name | `Wordburn: Subtitles & Captions` |
| Default language | English (United Kingdom) — or US; the copy is British spelling (`colour`) |
| App or game | **App** |
| Free or paid | **Free** (the unlock is an in-app product, so the app is free) |
| Declarations | Developer Programme Policies: yes. US export laws: yes. |

Free-or-paid cannot be changed from paid to free later, and a free app can never
become paid. Free is correct here and stays correct.

---

## 2. Store listing — the text

Counts are measured against Play's limits.

The text and the reasoning are in `ASO.md`, which is the source; this is the
same text, ready to paste. **Repositioned on 2026-09-30** from "offline, pay
once" to batch captions and auto clip on a subscription.

### App name — 26/30

```
Wordburn: Captions & Clips
```

### Short description — 76/80

```
Auto captions for every clip. Queue a batch or cut shorts from a long video.
```

### Full description — 2470/4000

```
Wordburn puts captions on your short videos, one clip or a whole queue of them.

Queue your clips, pick one style, and walk away. Wordburn works through the queue in the background and saves every captioned clip to your gallery. Or drop in a long podcast or stream and let auto clip suggest the short clips worth posting.

BATCH CAPTIONS
- Pick up to 20 clips from your gallery at once
- Choose one language and one caption style for the whole batch
- The queue keeps running while you use other apps, with progress for every clip
- Finished clips land in a Wordburn album, named after the original
- Save your look as a named style and reuse it on every batch

AUTO CLIP
Drop in a long video, from 5 minutes to an hour. Wordburn transcribes it, finds the moments that open with a hook and hold together, and suggests up to 10 clips of 20 to 60 seconds. Adjust where each one starts and ends, add your own, and send the ones you want to the batch queue. Turn on Remove dead air to cut long pauses and stray "um"s.

WORD-BY-WORD CAPTIONS, READY TO EDIT
Every word is timed on its own, so captions highlight exactly as they are spoken. Tap any word to fix it; its timing stays put. Words the recognizer was unsure about are flagged so you know what to check.

18 CAPTION STYLES
From a clean subtitle to karaoke fill, a single bold highlighted word, glowing neon and a word stack. Pick the colour, size, position and words per line. The preview is exactly what gets burned into the file.

EDIT EVERY DETAIL
- Nudge, split, merge and drag word timings on a waveform
- Shift every caption at once if they run early or late
- Undo and redo everything
- A personal dictionary for your brand, your handle and the names it keeps getting wrong

FIVE LANGUAGES
English, Spanish, German, Dutch and Indonesian. Pick the language each clip is spoken in. English is built in; the other four use a larger speech model that is downloaded once.

EXPORT
Captions are burned in at full quality and saved to your gallery, with the audio copied across untouched. Export a .srt subtitle file too.

WORDBURN PRO
Single clips caption and export with a small watermark in the corner. Wordburn Pro removes it and adds batch captions, auto clip, Spanish, German, Dutch and Indonesian, and an unlimited dictionary. Weekly, monthly or yearly, with a free trial on the yearly plan where offered. Cancel anytime in Google Play.

Wordburn does not translate: captions are in the language that is spoken.
```

Every section of it describes a feature that ships in the same release. Paste it
with the release that has batch, auto clip and the four languages in it, not
before: a listing that promises a queue the installed app does not have is the
misleading-claims violation this file has been careful to avoid since section 1.

### Graphics — you upload these, the extension cannot

| Asset | File | State |
|---|---|---|
| App icon 512×512 | `store/play-icon-512.png` | ✅ exists |
| Feature graphic 1024×500 | `store/play-feature-graphic-1024x500.png` | ✅ exists |
| Phone screenshots, 2–8, 9:16 | `store/play-screenshots/*.png` | ⚠️ eight exist, three are stale — see below |
| Tablet screenshots | — | not needed, `supportsTablet: false` |
| Promo video | — | optional, skip |

Eight exist now, composed by `scripts/make-screenshots.py` over device captures
in `store/shots/listing/`. **Three of them have to be retaken before upload**, and
for two different reasons:

- **7 (Export) and 8 (Home)** were shot on the three-export tier. They read
  "no watermark" and "3 free exports left"; the app now says "with a watermark"
  and "Free exports carry a small watermark". A screenshot promising the tier the
  app no longer has is the same violation from the other direction.
- **1 (Editor), 3 (Style) and 5 (Timing)** were shot before the stage rework
  landed on 2026-09-18 and show the old layout with its own scrubber row. 4
  (Word sheet) was shot after and shows the new one, so the set disagrees with
  itself as well as with the app.

None of the eight shows the watermark, because they all predate it, and the mark
is now in every preview a free user sees. That is its own reason to reshoot.

Minimum to publish is 2. Take 3, 1 and 7 if you are in a hurry — the style grid,
the editor, the export.

---

## 3. Store settings

| Field | Value |
|---|---|
| App category | **Video Players & Editors** |
| Tags | Video Editing; Video Players; Photo & Video Tools — pick up to 5 from Play's fixed list; do not invent |
| Email address | see note below |
| Phone | leave blank, it is optional |
| Website | leave blank unless you register `wordburn.app` |
| External marketing | "My app can be advertised" — fine either way |

**The contact email is published on your listing, in public, forever.** It is not
your Play account email and does not have to be. Either register `wordburn.app`
and use `support@wordburn.app`, or make a dedicated Gmail for it. Putting your
personal address on a public store page is a decision, not a default, so it is
left for you to make rather than filled in here.

Whichever you choose has to match the address in the privacy policy.

---

## 4. Pricing and countries

The app is free, so there is no price. Countries are under
Release → Production → Countries / regions.

Start with **all countries**. The English-only limitation is handled by the
PLEASE NOTE block in the description, and restricting distribution costs you the
English speakers in every country you leave out. Revisit if the one-star reviews
say otherwise.

---

## 5. App content — the declarations

Every one of these is under App content in the left nav, and all of them must be
green before you can release to production.

### Privacy policy

URL field. Paste wherever you host the text in section 10. Required even though
nothing is collected.

### App access

> **All functionality is available without special access**

Correct. No login, no account, no region lock, no code. Do not add credentials.

### Ads

> **No, my app does not contain ads**

Verified: no ad SDK in `package.json`, and no `com.google.android.gms.permission.AD_ID`
in the merged release manifest.

### Content rating

You fill a questionnaire and IARC issues the ratings. Answers:

| Question | Answer |
|---|---|
| Category | **Utility, Productivity, Communication or Other** |
| Violence, sexuality, language, controlled substances, crude humour | **No** to all |
| Does the app share the user's current location? | **No** |
| Does the app allow users to interact or exchange content with other users? | **No** |
| Does the app allow users to purchase digital goods? | **Yes** |
| Does the app contain any content not covered above? | **No** |

The interaction answer deserves its reasoning, because it looks arguable: the app
hands a finished file to Android's system share sheet. That is the OS passing a
file to another app the user chose. Wordburn has no users of its own, no accounts,
no feed, no messaging and no server for anything to be exchanged through, so
there is nothing for the question to be about.

Expect Everyone / PEGI 3.

### Target audience and content

| Question | Answer |
|---|---|
| Target age groups | **18 and over**, only |
| Is your app appealing to children? | **No** |

Selecting any group under 13 puts the app under the Families policy, which brings
an ads SDK audit, a separate content rating and a stricter data safety review, for
an audience a caption tool for short-form creators does not have.

### News app

> **No**

### Data safety

The whole form, and it is short because the honest answer is nothing.

| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | **No** |
| Is all of the user data collected by your app encrypted in transit? | n/a, the form stops asking |
| Do you provide a way for users to request that their data is deleted? | n/a |

**Why "no" is correct and not a dodge.** Google's own definition: data is
*collected* only when it is transmitted off the device. Wordburn's video, audio,
transcript, dictionary and settings are read and written inside the app's own
directory and never sent anywhere. There is no analytics SDK, no crash reporter
and no server. The only network call in the entire app is the Google Play Billing
query in `src/policy/store.ts`, and data handled by Google Play billing itself is
explicitly out of scope for this form.

If it helps to have it in writing for the reviewer, the summary line is: *no data
leaves the device.*

**Two things added on 2026-09-30, and neither changes the answer.** The app now
keeps an event log (`src/analytics/events.ts`: paywall shown, plan chosen,
export done and the like) — in `events.jsonl` in its own storage, never
transmitted, so by Google's definition it is not collected. And the language
model for Spanish, German, Dutch and Indonesian is downloaded from
`huggingface.co` when the user asks for it: a file download, carrying nothing
about the user beyond what any HTTP request carries, which the privacy policy
now says in so many words. If the event log is ever sent anywhere, this form
becomes "Yes — App activity: App interactions", and the privacy policy's
"Information we collect" paragraph has to change with it.

**Crash reporting was asked for and answered with Android vitals, which is why
that paragraph is still true.** Quality → Android vitals → Crashes & ANRs
collects crashes and ANRs from users who turned on diagnostics sharing. It needs
no SDK linked into the app, so nothing extra leaves anybody's phone and the
answer above stays "No" as written. Most of what can crash here is native —
whisper.cpp, ggml, Skia, and the burn-in module's GL and MediaCodec pipeline — so
`plugins/with-debug-symbols.js` sets `debugSymbolLevel 'SYMBOL_TABLE'` on the
release build and the symbols ride up with the bundle. Play strips them before
delivery: the upload grows, the install does not. Without them a native crash is
a column of hex addresses.

A linked crash reporter — Crashlytics or anything like it — would flip this form
to "Yes" for crash logs and a device identifier, and would need a line in the
privacy policy. If one is ever added, the honest shape is off by default, with a
switch in Settings, so this page can still be filled in as it stands.

### Government apps

> **No**

### Financial features

> **My app doesn't provide any financial features**

A subscription to an app feature is not a financial feature. That section is
about lending, banking, crypto and investment.

### Health apps

> **No**

---

## 6. Advertising ID

A separate declaration next to Data safety.

> **No, my app does not use advertising ID**

Verified in the merged manifest: no `AD_ID` permission, and nothing in
`package.json` that would add one.

---

## 7. The two permission declarations

These are the ones that need written justification, and Play reviews them by
hand. Text below is ready to paste.

### Foreground service permissions

Declared: `FOREGROUND_SERVICE_MEDIA_PROCESSING` and `FOREGROUND_SERVICE_DATA_SYNC`
from `modules/foreground-service`.

Use case to select for both: **Media processing** (and its fallback).

Justification:

```
Wordburn transcribes speech and burns captions into video entirely on the
user's device. Both are long-running media operations on a file the user
explicitly chose: transcribing a one-minute clip takes tens of seconds and
burning captions into it takes several more.

The foreground service exists so that this work is not killed when the user
leaves the app or their screen turns off, and so that a visible notification
tells them what is still running. The user starts it by picking a video and
it stops the moment the work finishes or they cancel.

FOREGROUND_SERVICE_MEDIA_PROCESSING is used on Android 15 and above, where
that type exists. FOREGROUND_SERVICE_DATA_SYNC is the fallback on Android 14
and below, which have no media processing type. Only one is ever used per
device and neither runs except while a transcription or an export is in
progress.

The same service keeps a batch the user started running from one clip to the
next — up to 20 clips they picked, transcribed and captioned one after another
— with a notification that says which clip it is on. It stops when the batch
finishes, fails or is paused.
```

**Changed with batch captions and the language model, and it is not a small
change.** The declaration above used to end "The service performs no network
activity of any kind." That is no longer true: the same service holds the
process while the Spanish/German/Dutch/Indonesian model downloads (874 MB, once,
on request), which is a `dataSync` use and not a media-processing one. Either
declare **Data sync** as a second use case with its own sentence — "downloads a
speech model the user asked for, once, with a progress notification" — or move
the download off the service. The first is the honest one and costs a second
line in the video: start a Spanish download, background the app, show the
notification. Do not submit the old paragraph with the new build.

**This declaration asks for a link to a video demonstrating the feature.** Plan
for it: screen-record the A54 picking a clip, transcription starting, the
notification appearing, backgrounding the app, and coming back to a finished
transcript. Unlisted YouTube is fine.

### Photo and video permissions

Declared: `READ_MEDIA_VIDEO` and `READ_EXTERNAL_STORAGE` (capped at SDK 32), both
from expo-image-picker.

Justification:

```
Wordburn's only purpose is to add captions to a video the user already has.
The user taps one button, picks one video from their own library, and the app
copies that one file into its own storage to transcribe and caption it.

Video access is requested at that moment, for that file, and the app reads
nothing else in the library. It does not browse, scan, index or upload the
user's media. READ_EXTERNAL_STORAGE is capped at API 32 and exists only for
devices older than the granular media permissions.
```

Worth knowing before you write this: on Android 13+ the app goes through the
system photo picker, which needs no permission at all. If the permissions were
stripped in a config plugin the declaration would go away with them, along with
"Camera" and "Microphone" on your public listing. Code change, so it is flagged
rather than done.

---

## 8. Release notes

Release → Internal testing / Production → Release notes, `<en-GB>` block.

The limit is 500 characters per language, and it is counted with the line
breaks. Nothing has ever been on a track, so 1.0.2 is still the first release
however many bundles are in `build/`.

**The block that used to be here said "Three exports free".** That was the
counter tier, and `FREE_TIER` has been a watermark since slice 12 — release
notes are store metadata like any other field, so a promise of three free
exports over an app that has no counter is the same violation the full
description was fixed for in section 1. Whatever ships here has to agree with
`src/policy/free-tier.ts`.

### Pro release — 426/500

```
Wordburn Pro is here.

Batch captions: queue up to 20 clips, pick one language and one style, and let your phone work through them in the background.

Auto clip: drop in a long video and get up to 10 suggested shorts, captioned. Trim them, cut dead air, and send them to the queue.

Now in Spanish, German, Dutch and Indonesian as well as English.

Single clips still caption and export with a small watermark. Pro removes it.
```

The previous first-release notes promised "one purchase removes it, forever" and
"English only for now", both of which this release ends. Nothing has been on a
production track yet, so if this is the first release anyone sees, drop the
first line and it reads as a first release.

### After the first release

Write what changed for the user, not what changed in the repository. Play shows
this text to people deciding whether to update, and a line like "bumped the
minSdk" is a line that costs an update. The two rules worth keeping: never
describe a tier the code does not have, and never name a fix nobody outside
this machine ever saw.

---

## 9. The subscription

Monetise → Products → Subscriptions → Create subscription.

| Field | Value |
|---|---|
| Product ID | `wordburn_pro` — matches `PRO_PRODUCT_ID` in `src/policy/store.ts`, permanent once created |
| Name | `Wordburn Pro` |
| Benefits (shown by Play on the subscriptions page) | `No watermark` · `Batch captions` · `Auto clip` · `Spanish, German, Dutch, Indonesian` |

### Three base plans

The base plan IDs are read by the app (`PLAN_IDS` in `src/policy/pro.ts`) and a
base plan with any other ID is not shown, so spell them exactly.

| Base plan ID | Billing period | Renewal | Placeholder price (USD) | Grace period | Account hold |
|---|---|---|---|---|---|
| `weekly` | 1 week | Auto-renewing | 4.99 | 3 days | on (default) |
| `monthly` | 1 month | Auto-renewing | 9.99 | 7 days | on (default) |
| `yearly` | 1 year | Auto-renewing | 39.99 | 14 days | on (default) |

Set USD and let Play convert the rest; the app shows whatever Play hands it and
formats nothing itself.

**Pausing** can be allowed on `monthly` and `yearly` (Play does not offer it on
weekly). The app reads a paused plan as "on hold", keeps the watermark on and
sends the user to Play, so allowing it costs nothing in code.

### The free trial is an offer, not code

On `yearly`: Add offer → Offer ID `yearly-trial` → Eligibility **New customer
acquisition: never had this subscription** → one phase, **Free trial, 3 days**.
The app finds any offer whose first phase is free and sells it on the yearly
card; the trial's length is read from Play, so changing it to 7 days is a
console edit and no release. Somebody who has already had a trial is not given
the offer by Play and sees the plain yearly price instead.

### On the placeholder prices

The ratio is conventional for the category and one thing about it is worth
knowing before launch:

- Yearly works out to **3.33 a month**, a third of monthly. That is the shape
  every trial-led subscription app uses, and the paywall says "Save 66%".
- **Weekly is the risk.** At 4.99 a week it costs 259 a year and exists mostly
  as an anchor that makes yearly look cheap. The people this release is aimed
  at — clippers — are also the people most likely to buy one week, batch a
  backlog, and cancel. Watch weekly's share of subscriptions in the first
  month; if it dominates, raise it or remove the base plan (the app simply
  stops showing a plan Play stops returning).

### Testing it

Setup → Licence testing → add your account. Install from the Internal testing
link and subscribe: a licence tester is not charged, and Play runs test
subscriptions on a compressed clock (a year renews in 30 minutes), which is the
only way to see renewal, grace, account hold and cancellation on a phone. The
states and what the app does with each are in `src/policy/pro.ts` and asserted
in `src/policy/__tests__/pro.test.ts`.

---

## 10. The privacy policy

**The text is no longer in this file.** It is `docs/index.html`, a single
self-contained page with no external requests of its own, and this section is
now only about getting it onto the internet. It used to be a fenced block here,
and a legal document kept in two places drifts: the copy that was here still
promised "unlimited exports" for the unlock, which stopped being true the day
`FREE_TIER` became a watermark.

Three things in it were written against code that has since changed, and the
page has them right:

- The unlock **removes the watermark**. Exports were already unlimited.
- **Microphone and Camera** are named and explained. Both are in the merged
  release manifest, both come from libraries rather than from this app's code,
  and both will be on the store page where a reader can see them. An app whose
  whole pitch is "nothing leaves your phone" cannot let a reader discover those
  two on their own.
- The **.srt goes to Downloads**, not to the gallery. Only the video is a
  gallery item.

### Fill in the contact email

The page ships with `CONTACT_EMAIL` in two places on one line — the `mailto:`
and the visible text. It has to be the same address as the listing's contact
email in section 3, and section 3's warning applies: it is public forever.

```sh
sed -i '' 's/CONTACT_EMAIL/support@example.com/g' docs/index.html
grep -c CONTACT_EMAIL docs/index.html        # must print 0
```

### Turn on GitHub Pages

The repository is public, which is all the free tier needs.

```sh
git add docs/index.html && git commit -m "docs: the privacy policy, for Pages"
git push origin main
```

Then **Settings → Pages → Build and deployment → Deploy from a branch**, branch
`main`, folder `/docs`, Save. The URL is

```
https://dennistjahyadi.github.io/captionfy/
```

Two notes before that URL goes anywhere near Play:

- **The default branch on GitHub is `chore/wordburn-rename-and-icon`**, not
  `main`, and it is behind. Pages will serve whichever branch you pick, so this
  only matters in that you must pick `main` deliberately rather than accept the
  default.
- **The repository is still called `captionfy`.** Renaming it to `wordburn`
  gives `https://dennistjahyadi.github.io/wordburn/` and GitHub redirects the
  old address, but do it **before** the URL is submitted rather than after.
  Play's field wants a stable address and a redirect is not one.

The first build takes a minute or two. Check the URL actually renders before
pasting it into App content → Privacy policy: Pages serving a 404 is
indistinguishable from Pages not being on.

---

## The order to actually do this in

1. `./aab.sh` — it syncs, verifies and archives the version by itself now
2. Host the privacy policy, get the URL
3. Decide the contact email
4. Take the screenshots
5. Create the app (section 1)
6. Store listing text and graphics (sections 2, 3)
7. Upload the AAB to **Internal testing**, not production
8. Create `captions_unlock_v1` (section 9)
9. Licence-test the purchase — close the CLAUDE.md known issue
10. Record the foreground service demo video
11. App content declarations (sections 5, 6, 7)
12. Countries (section 4), release notes (section 8)
13. Then, and only then, production

Steps 7 through 9 are the point of doing internal testing first: the purchase has
never run, and production is a bad place to find out why.
