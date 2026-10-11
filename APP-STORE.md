# App Store Connect — what to set up, and in what order

The iOS counterpart of `PLAY-CONSOLE.md`. Everything the app needs from Apple's
side before `scripts/build-ipa.sh` can produce a build that sells Wordburn Pro.
Written 2026-10-03, when the membership had just gone active and nothing below
existed yet. Tick things off here as they get done.

## 1. The team id → `app.json`

developer.apple.com → Account → Membership details → **Team ID** (ten
characters, like `A1B2C3D4E5`). Put it in `app.json`:

```json
"ios": { "appleTeamId": "A1B2C3D4E5", ... }
```

Prebuild writes it into the Xcode project as `DEVELOPMENT_TEAM`;
`build-ipa.sh` refuses to start without it.

## 2. A way to sign without a password prompt

App Store Connect → Users and Access → **Integrations** → App Store Connect
API → Team Keys → Generate. Name it "build machine", role **Admin** (cloud
signing needs it). Download the `.p8` once — it cannot be downloaded again —
and keep it outside the repository, e.g. `~/keys/`. Then in the shell that
builds:

```sh
export ASC_KEY_PATH=~/keys/AuthKey_XXXXXXXXXX.p8
export ASC_KEY_ID=XXXXXXXXXX        # on the same page
export ASC_ISSUER_ID=xxxxxxxx-xxxx-… # at the top of the Keys page
```

The alternative is signing into Xcode → Settings → Accounts with the Apple ID,
which works but can stop the first archive for a password or a 2FA code.

## 3. The app record

App Store Connect → My Apps → **+** → New App.

| field | value |
|---|---|
| Platforms | iOS |
| Name | Wordburn |
| Primary language | English (U.S.) |
| Bundle ID | `com.wordburn.app` — register it first under developer.apple.com → Identifiers if it is not in the list (explicit, no capabilities) |
| SKU | `wordburn` |
| User access | Full |

## 4. The subscription

The App Store has no base plans. What Play sells as one product with three base
plans is three products here, in one **subscription group** so that buying one
replaces another. `src/policy/store.ts` reads these exact ids.

App Store Connect → the app → Monetization → **Subscriptions** → Create
subscription group: reference name **Wordburn Pro**. Then three subscriptions
in it:

| reference name | product id | duration | price (USD) |
|---|---|---|---|
| Wordburn Pro weekly | `wordburn_pro_weekly` | 1 week | 4.99 |
| Wordburn Pro monthly | `wordburn_pro_monthly` | 1 month | 9.99 |
| Wordburn Pro yearly | `wordburn_pro_yearly` | 1 year | 39.99 |

Monthly and yearly are the 2026-10-02 decision from `reports/Caption app
apple to apple comparison.md`; weekly is 4.99 at Dennis's call on 2026-10-03,
which is also what Play Console already has. Global, no per-country
overrides. Enter USD as the base and let Apple fill in the other storefronts;
all three are standard tiers. Play Console still carries a 3-day trial —
change it to 7 there if the stores are to match, since the app shows whatever
each store sends. Enrol in the Small Business Program under Agreements for the 15%
commission.

Under **Localization** each product wants a display name and description —
the paywall's own words are the app's, so one line each is enough: "Wordburn
Pro", "No watermark, batch captions, unlimited dictionary."

The **free trial** is an Introductory Offer on `wordburn_pro_yearly`: type
*Free*, duration 1 week (the 7-day trial from the same decision), all
countries. The app shows it only when StoreKit
says the account is still eligible.

The group needs a **subscription group localization** too (display name
"Wordburn Pro"), and the app record needs the **Paid Applications
agreement** signed under Business → Agreements before any price is live —
Apple returns no products at all until it is, which the app shows as "The App
Store is not offering Wordburn Pro to your account yet".

## 5. What the listing needs before review

- **Privacy policy URL** and **Terms (EULA)**: `docs/index.html` and
  `docs/terms.html` as published on the site. The paywall links both.
- **App Privacy** questionnaire: no data collected. The app has no analytics
  SDK and `events.jsonl` never leaves the phone.
- **Export compliance**: `usesNonExemptEncryption` is `false` in `app.json`,
  so the question is answered in every build.
- **Screenshots**: the required size is the 6.9-inch iPhone (1320 × 2868).
  `store/ios-shots/` was taken on an iPhone 17 simulator at 1206 × 2622, which
  App Store Connect files under the optional 6.3-inch slot. Retake the chosen
  ones on an "iPhone 17 Pro Max" simulator for the listing.
- **Review notes**: say the app works fully offline and that transcription
  runs on the device, so the reviewer does not look for a login or a server.
  Mention that the subscription can be tested with a sandbox account.

## Done so far

- 2026-10-03: membership active, team `TKCS3G7DZP` in `app.json`, Apple
  Distribution certificate made, profile **Wordburn App Store** installed
  (a copy is in `~/keys/`), Apple's WWDR G3 intermediate added to the
  keychain. API key `RRCWV54886` is in `~/keys/`; its Issuer ID is not
  written down anywhere yet.
- 2026-10-03: **1.0.7 (107) uploaded** with the Apple ID signed into Xcode —
  no API key needed for that route. Symbol upload warned that React, Hermes
  and whisper.rn ship no dSYMs; crashes inside those frameworks will show
  addresses rather than names, everything else symbolicates.

## 6. Building and uploading

```sh
npm run bump              # one number for Play's versionCode and the App Store's build number
./scripts/build-ipa.sh    # archive, sign, verify, upload
```

The upload appears under TestFlight once Apple has processed it. The first
build on a new app record also wants the **export compliance** and
**encryption** questions answered once in the console, after which the plist
key covers them.

## 7. Testing a purchase without paying

App Store Connect → Users and Access → **Sandbox** → Testers → add an Apple ID
that is not the developer's. On a device, Settings → App Store → Sandbox
Account signs it in.

**Without a device: `store/Wordburn.storekit`.** A local App Store with the
three products, the prices above and the 1-week trial on yearly. Nothing is
charged and nothing reaches Apple. Two ways to use it on the simulator:

- In Xcode: open `ios/Wordburn.xcworkspace`, Product → Scheme → Edit Scheme
  → Run → Options → **StoreKit Configuration** → choose the file, then Run.
  Debug → StoreKit → Manage Transactions shows and refunds purchases.
- From a UI test, `SKTestSession(contentsOf:)` on the file — how slice 19's
  simulator driver bought Pro.

Keep it in step with App Store Connect when a price or the trial changes:
it is a copy, and the app reads whichever store it is pointed at. Sandbox renews a month in five minutes and a year in an hour, the
App Store's version of Play's licence testing.

**Nothing here has been run on a device.** See CLAUDE.md, slice 19.

## 8. App Review: Guideline 2.1, Information Needed (2026-10-07)

The first submission came back with no rejection of anything. It came back
with seven questions, because the account is new. Apple wants the answers
twice: as a reply in App Store Connect, and in **App Review Information →
Notes** so later submissions carry them. The text below is for both. The Notes
field takes 4000 characters and this fits.

**The blocker is item 1: a screen recording on a physical iPhone, on the
latest iOS, starting from launch.** Nobody here owns an iPhone, and Apple says
"physical device" twice in the message. A simulator recording is the kind of
answer that comes back as a second round of the same question. Ways to get
one, cheapest first:

- Borrow an iPhone on iOS 27 for an hour. Install the build through TestFlight
  (internal testing needs no review: add the owner's Apple ID as an App Store
  Connect user, or use your own Apple ID signed into their phone's TestFlight).
  Record with Control Centre → Screen Recording.
- A device farm with real iPhones and screen capture (BrowserStack App Live,
  AWS Device Farm). Upload the `.ipa` from `build-ipa.sh`. A sandbox purchase
  works there too.

That same hour is also the first time this app runs on an iPhone at all. If it
crashes, App Review would have found the crash anyway.

Before recording, check that the three subscriptions in §4 exist and are
**attached to this version** (the version page → In-App Purchases and
Subscriptions → +). Apple's note 3.1.1 is a reminder that they have to go in
with the app. Sign a Sandbox tester in under Settings → Developer (or App
Store) → Sandbox Account, so the purchase in the recording is real StoreKit
and costs nothing.

### Shot list for the recording (aim for 3–4 minutes, one take)

1. Home screen → tap the Wordburn icon. Show it launching from cold (swipe it
   away first if it is already running).
2. Welcome → **Get started** → language step, pick English → **Continue** →
   style step, leave Focus → **Continue** → Home.
3. **New video** → pick a 20–40 s clip of someone talking from Photos →
   Processing, the words appearing → the editor.
4. Play a few seconds so the captions run. Tap a word → change its text →
   Done. Open the style sheet → tap two presets (Bold yellow, Karaoke fill) →
   close it.
5. **Export** → **Save to gallery** → Saved. Open Photos to show the file
   with the captions and the small watermark.
6. Back in Wordburn: **Go Pro** on Home → the Pro screen. Hold still for two
   or three seconds on the plans so all three names, lengths and prices can
   be read, then on the text under the button, then tap **Terms** and come
   back, then tap **Privacy** and come back.
7. Pick Yearly → **Start 7-day free trial** → the sandbox purchase sheet →
   confirm → the "You're Pro" screen.
8. Home → the free-videos line is gone → export the same video again → Photos
   shows it with no watermark.
9. Settings → **Wordburn Pro** row (shows the plan) → **Restore purchases**
   on the Pro screen.

Nothing about accounts, deletion, reporting or blocking belongs in it: the
app has none of them, and the text below says so.

### Reply and Notes text

Item 1 describes the simulator recording made on 2026-10-09
(`wordburn-app-review-ios.mp4`, 5:34). If a device recording replaces it, say
so instead: model and iOS version, and drop the simulator sentences.

```
1. Screen recording
Attached. We are a one-person developer and do not own an iPhone yet, so this recording is from the iOS 27 Simulator (iPhone 17) running the same Release build we submitted, 1.0.7 (107). It starts at the Home Screen and shows: launching the app, first-run setup, choosing a video from Photos, on-device transcription, editing a caption, choosing a caption style, exporting to Photos with the free watermark, the Wordburn Pro screen with each plan's name, length and price and the Terms of Use and Privacy Policy links opened, a subscription through a local StoreKit test configuration (the purchase sheet is labelled "Xcode" for that reason), and a second export without the watermark. If a recording from a physical device is required, we are arranging one and will send it. Wordburn has no accounts, no login and no content shared between users, so there is no registration, account deletion, reporting or blocking flow.

2. Purpose and audience
Wordburn adds captions to short vertical videos for TikTok, Instagram Reels and YouTube Shorts. The user picks a video, the speech is transcribed on the iPhone itself, they correct any word and choose a caption style, and Wordburn exports a new video with the captions burned in, plus an .srt subtitle file. It is for creators and small businesses who post short videos: most viewers watch with the sound off, and captions are what keeps them watching. Wordburn does this without an account and without uploading the video anywhere.

3. Setup and access
No login or credentials are needed. Any video with speech in the Photos library works as a sample; 15 to 60 seconds of someone talking is ideal.
- Launch > Get started > choose a language > choose a caption style > Home.
- Home > New video > choose a video. Transcription runs on the device, then the editor opens.
- In the editor: tap a word to correct it; the style button changes the look; Export > Save to gallery saves the video to Photos.
- English is built in. Dutch, French, German, Indonesian, Italian, Polish, Portuguese and Spanish need a one-time 874 MB download, offered when one of them is chosen (Home > Spoken language).

4. External services
- Apple App Store (StoreKit): subscriptions and restore.
- Hugging Face (huggingface.co): hosts the optional multilingual speech-recognition model file. It is downloaded only when the user chooses a non-English language and taps Download. It is a plain file download; nothing about the user or their videos is sent.
- Apple Photos: the system photo picker to import, and add-only access to save exports.
Speech recognition runs entirely on the device, using OpenAI's open-source Whisper model (through whisper.cpp) and the Silero voice activity detector. The English model ships inside the app. There is no cloud AI service, no analytics or advertising SDK, no authentication provider and no server of our own.

5. Regional differences
Features and content are the same in every region. Prices are the App Store's own price for each storefront. The only network-dependent feature is the optional language download from huggingface.co; where that site is unreachable, the eight downloaded languages cannot be added, and English and every other feature work as normal.

6. Regulated industry and third-party material
Not applicable. Wordburn is not in a regulated industry and contains no third-party content; users caption their own videos. Bundled components are open source: Whisper and whisper.cpp (MIT), Silero VAD (MIT), and the Be Vietnam Pro and Spectral fonts (SIL Open Font License).

7. In-App Purchase
One auto-renewable subscription group, Wordburn Pro, with three options:
- Weekly: $4.99 per week
- Monthly: $9.99 per month
- Yearly: $39.99 per year, with a 7-day free trial for eligible new subscribers
Pro gives unlimited videos (free: 3), no watermark on exports (free exports carry a small "Captions by Wordburn" mark), batch captions (up to 20 clips at once) and unlimited dictionary words (free: 20). The editor, all 18 caption styles and all nine languages are free.
To reach the purchase screen: tap "Go Pro" on Home; or Settings > Wordburn Pro; or tap Batch on Home; or choose a fourth video after the three free ones. The screen shows each plan's name, length and price, the renewal terms under the button, Restore purchases, and links to the Terms of Use (https://dennistjahyadi.github.io/wordburn/terms.html) and Privacy Policy (https://dennistjahyadi.github.io/wordburn/).
```
