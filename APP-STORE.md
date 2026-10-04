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
