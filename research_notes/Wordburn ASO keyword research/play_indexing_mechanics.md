# Google Play search ranking and keyword indexing mechanics (2025–2026), for Wordburn

Context read before researching: `ASO.md` (title `Wordburn: Captions & Clips`, 26/30; short description 79/80; full description 2038/4000) and `PLAY-CONSOLE.md` §8 (release notes, 500 chars per language, current Pro draft 332/500). Note that `PLAY-CONSOLE.md` §1 still lists the app name as `Wordburn: Subtitles & Captions` while §2 and `ASO.md` say `Wordburn: Captions & Clips`, and `ASO.md` §"Still to do" refers to a `Subtitles & Captions` suffix. The drafts disagree with each other. Not edited.

Evidence labels used below: **[Google]** = Google's own documentation; **[Vendor]** = ASO vendor opinion or analysis; **[Vendor experiment]** = vendor ran a controlled test and published method and results; **[Anecdotal]** = practitioner blog with no data.

## Which listing fields does Google Play index for search, and are release notes ("What's new") indexed?

### Takeaway
Google documents only that the title and description matter and that keyword spam is forbidden. It publishes no list of indexed fields. Vendors agree that the title, short description and full description are indexed, in that order of weight. **No source found claims that "What's new" is indexed, and several vendors say it is not**, so keywords put there are not expected to affect ranking. Its value is conversion and update rate. On Play, user review text and developer replies do get indexed, according to one published controlled experiment. Vendors disagree about the developer name.

### Cited Findings
- **[Google]** Google's discovery guidance names the title and the description. Title: "should be unique and accessible, avoid common terms, and reinforce what your app is about". Description: "Focus on your users and what they will get from your app" and keep "the most important text … visible on the top half". It tells developers to use "SEO best practices in your description" while being "mindful of the Google Play Content Policies regarding spam … (for example, keyword spamming…)". The guidance does not mention release notes. — [Play Console Help: Get discovered on Google Play search](https://support.google.com/googleplay/android-developer/answer/4448378)
- **[Google]** Google also says professional (non-machine) translations of descriptions "can lead to better search results and discoverability for worldwide users". — [Play Console Help 4448378](https://support.google.com/googleplay/android-developer/answer/4448378)
- **[Vendor]** App Radar (updated 28 Apr 2026) lists these as indexed: title (30 chars, "strongest single keyword weight"), short description (80), and long description (4,000, "fully indexed", but "the first 250 to 300 characters carry the most weight"). It lists these as **not indexed**: "Developer name, Package name, Release notes/What's New, In-App Purchase names (unlike Apple)". — [App Radar: ASO Ranking Factors in 2026](https://appradar.com/academy/aso-basics/app-store-ranking-factors)
- **[Vendor]** App Radar also says text on Promotional content (LiveOps) cards "is indexed and contributes to ranking". No experiment is given to back this. — [App Radar 2026](https://appradar.com/academy/aso-basics/app-store-ranking-factors)
- **[Vendor]** "Neither Apple nor Google index the release notes text directly for search ranking… However, release notes signal active development." This is a non-ASO-vendor blog and is the weakest source here. — [ReleaseGlow: App Store Release Notes guide](https://releaseglow.com/blog/app-store-release-notes-guide)
- **[Vendor]** Search-result summaries of ASO guides (AppTweak checklist and others) repeat that "What's New" being indexed is "a common myth" and that it "isn't part of indexing and serves purely to drive conversion and retain people who've already installed the app". When AppTweak's 11 Apr 2026 checklist was fetched directly, it described What's New only as communicating "changes, bug fixes, and new features" and made **no indexing claim either way**. The "myth" wording could not be traced to a specific vendor page. — [AppTweak Google Play ASO checklist](https://www.apptweak.com/en/aso-blog/app-store-optimization-aso-checklist-for-google-play)
- **[Vendor] Contradiction on developer name.** AppTweak: "The developer name is indexed and can be used on Google Play to target keywords". — [AppTweak checklist (Apr 2026)](https://www.apptweak.com/en/aso-blog/app-store-optimization-aso-checklist-for-google-play). App Radar 2026 says it is not indexed. — [App Radar](https://appradar.com/academy/aso-basics/app-store-ranking-factors). A Phiture-attributed snippet says the developer name "gets indexed by the algorithm". — via search snippet of [Phiture ASO Stack](https://phiture.com/asostack/google-play-store-keywords-how-to-find/) (not fetched directly).
- **[Vendor]** Play has no separate keyword field. It "scans and analyzes the app's title, short description and long description". — [AppTweak: How to add keywords to your app on Google Play](https://www.apptweak.com/en/aso-blog/how-to-add-keywords-to-apps-on-google-play) (search-snippet level)
- **[Vendor experiment]** RadASO / ASOMythbusters posted reviews on Google Play and the App Store containing keywords the test apps were not yet indexed for, and that appeared nowhere in their metadata. The test apps were Ukrainian, Russian and English. Results:
  - On Google Play, 16 of 33 reviews of 100+ characters were indexed (**48%**). Reviews under 5 words were never indexed.
  - "Words begin indexing within 2–3 days. Rarely, it takes up to 10 days."
  - **Developer replies to reviews were also indexed**, within 5–7 days, on two apps.
  - Newly indexed positions ranged from #13 to #179.
  - On the App Store, no reviews were indexed.
  - The test ran October–December (year not stated on the page). — [RadASO experiment: Do reviews get indexed?](https://radaso.com/asomythbusters-experiments/do-reviews-get-indexed-in-the-app-store-and-google-play)
- **[Vendor, commercial interest]** Reply Argus, which sells review-reply tooling, claims Google Play indexes review replies. This agrees with RadASO's result but the source has a stake in it. — [Reply Argus](https://www.replyargus.com/blog/google-play-indexes-review-replies-aso)
- **[Google]** The custom store listing fields are "app's name, icon, descriptions, and graphic assets". Release notes are not among them. — [Play Console Help: Custom store listings](https://support.google.com/googleplay/android-developer/answer/9867158?hl=en)

### Inferences
- **Putting keywords in "What's new" has no documented or tested ranking effect.** No source, from Google or any vendor, claims it is indexed. At least two vendor sources say it is not. The 500 characters are best spent on persuading people to update or install. That text is visible on the listing, so it does affect conversion, and conversion is a ranking input (see Q3).
- Release notes are still store-facing text. Google's spam policy forbids "keyword spamming" across Play content, so keyword-stuffed release notes carry some policy risk and no measured benefit. `PLAY-CONSOLE.md` §8 already treats release notes as metadata subject to policy.
- Keyword work should go into the fields in this order: title, then short description, then the first roughly 300 characters of the full description, then the rest of the full description.
- The package name is fixed at first upload and is not reported as indexed, so it is not worth optimising for keywords.
- Replies to reviews are a plausible secondary place for natural keywords, but this rests on one vendor experiment. Natural phrasing is the policy-safe use: answering a user with "batch captions" or "subtitles" when they used those words.
- The developer name is contested. If Wordburn's developer name is a person's name, the question is moot. Putting a keyword in the developer name ("Wordburn Captions") is the kind of change the 2021 policy targets, so it carries policy risk.

### Gaps
- Google does not document, in anything found, which fields are indexed or how they are weighted. Every field-weight claim comes from vendors.
- No controlled experiment specifically on "What's new" indexing on Google Play was found. RadASO's 14 published experiments cover reviews, emoji and Asian scripts, but not release notes. The "not indexed" claim is vendor consensus, not something demonstrated.
- No source tested whether in-app product or subscription names are indexed on Play. App Radar asserts they are not.
- The year of RadASO's experiment is not on the page.

## How much weight does each field carry, what are the keyword density norms, and what does the metadata policy forbid?

### Takeaway
Vendor consensus weights title above short description above long description. The beginning of the long description counts most. Modern guidance on repetition is a few natural mentions, not a density target. AppTweak still quotes 2.5–3% density, which most others have moved away from.

Google's policy (current page) bans the following in the title, icon and developer name:
- emoji
- repeated special characters
- all caps (unless part of a brand)
- performance, price or promo words

In descriptions it bans:
- repetitive or unrelated keywords
- unattributed testimonials
- "best"/"#1"-style claims and price or promo language

### Cited Findings
- **[Google] Current metadata policy page**:
  - Title is at most 30 characters.
  - "Don't use emojis, emoticons, or repeated special characters" in title, icon or developer name.
  - Avoid ALL CAPS unless part of a brand.
  - No text indicating "store performance, pricing, or Google Play programs".
  - Descriptions: "Avoid using repetitive or unrelated keywords or references". "Shorter descriptions tend to result in a better user experience". No "unattributed or anonymous user testimonials". No claims like "best game ever" or "#1". No price or promotional language (e.g. "free for limited time", discounts). No store-performance claims ("App of the Year", "Popular").
  - No use of celebrity names or brand logos without permission.
  - No screenshots or videos that don't reflect the app.
  - The page as fetched shows no update date. — [Play Console Help: Metadata policy](https://support.google.com/googleplay/android-developer/answer/9898842)
- **[Vendor, describing Google's 2021 change]** The change was announced in April 2021 and took effect **29 September 2021**. The title limit went from 50 to 30 characters. The following were banned from title, icon and developer name: "top", "best", "#1", "free", "no ads", "ad free", "new", "discount", "sale", and CTAs such as "update now" and "download now". Emoji, emoticons, repeated special characters and ALL CAPS were banned too. Google's short-description guidance at the time: "Do not use language that is not related to the function or purpose of your app, including: Language that reflects or suggests Google Play performance, ranking, accolades or awards… such as 'Best,' '#1,' 'Top,' 'New,' 'Discount,' 'Sale'", and no "download now" calls to action. — [AppTweak: Google Play's metadata policy changes (Nov 2023)](https://www.apptweak.com/en/aso-blog/how-to-prepare-for-new-google-metadata-policy-changes)
- **[Vendor]** Phiture's summary of the guidelines says Play prohibits "misleading, improperly formatted, non-descriptive, irrelevant, excessive, or inappropriate metadata". It warns against "word blocks and vertical/horizontal word lists to stuff keywords". — [Phiture: App Store and Play Store guidelines](https://phiture.com/asostack/app-store-and-play-store-guidelines/)
- **[Google]** Discovery guidance warns against "excessive emoji or ascii characters" in titles and descriptions on accessibility grounds (screen readers and voice control). — [Play Console Help 4448378](https://support.google.com/googleplay/android-developer/answer/4448378)
- **[Vendor] Weights.**
  - App Radar: the title carries "the strongest single keyword weight".
  - App Radar: "84.2% of successful Google Play ranking improvements correlated with adding the target keyword to the Short Description". No method is given and the dataset is unspecified, so treat this as a weak statistic.
  - App Radar: in the long description the first 250–300 characters carry most weight. — [App Radar 2026](https://appradar.com/academy/aso-basics/app-store-ranking-factors)
  - AppFollow: "Your title carries more ranking weight than any other metadata field". — [AppFollow, Jun 2026, updated Sep 2026](https://appfollow.io/blog/google-play-aso-keywords)
- **[Vendor] Density and repetition. The vendors disagree:**
  - AppTweak (Apr 2026): "a good keyword density for the long description would be between 2.5% and 3%", balanced against stuffing. — [AppTweak checklist](https://www.apptweak.com/en/aso-blog/app-store-optimization-aso-checklist-for-google-play)
  - App Radar (2026): "2 to 3 natural mentions of your primary keyword, not the older 'repeat 3 to 5 times' advice. Google now penalizes keyword stuffing." — [App Radar](https://appradar.com/academy/aso-basics/app-store-ranking-factors)
  - AppFollow (2026): "Repeating a keyword ten times won't produce ten times the ranking benefit… Google also applies semantic matching, which means keyword relationships and search intent often matter more than repeating the same phrase". — [AppFollow](https://appfollow.io/blog/google-play-aso-keywords)

### Inferences
- The draft listing's words that matter most for search are the title words "Captions" and "Clips", and "Auto captions" and "batch" at the start of the short description.
- The current title spends "Clips" on a word that no longer names a feature, since auto clip was removed on 2026-10-02. "Subtitles" is the obvious replacement candidate: `Wordburn: Subtitles & Captions` is 30/30 and is already recorded in `PLAY-CONSOLE.md` §1.
- At about 2,000 characters, 2.5–3% density for a two-word phrase means roughly 6–8 mentions of "captions". The draft is already near that naturally. Adding more is where the "repetitive keywords" clause starts to bite.
- "Free" must stay out of the title, icon and developer name. In descriptions, Google bans promo or price framing such as "free for a limited time". Neutral factual mention of a trial is common practice, but this is an inference, not a rule found in Google's text.
- Leaving out TikTok, Reels and Shorts, as `ASO.md` does, matches the policy line about not using other brands without permission. The policy page as fetched speaks of celebrity names and brand logos. No Google text was found that specifically addresses a factual "works with TikTok" mention, so the conservative reading stands.

### Gaps
- Google publishes no field weights and no density threshold. All numbers above are vendor numbers.
- The current metadata policy page as fetched showed no "last updated" date. I could not confirm whether post-2021 revisions changed the short description rules. The Android Developers blog announcement URL from April 2021 returned 404.
- Whether the metadata policy formally covers release notes was not confirmed from Google text. The spam and keyword-stuffing language is general.

## Which signals outside the listing text affect ranking?

### Takeaway
Google documents three things. Ranking uses "ratings, reviews, downloads, and other factors" plus "overall experience … based on user behavior and feedback". Exceeding Android vitals bad-behaviour thresholds makes an app "less discoverable". Vendors add install velocity, retention (D1/D7/D30), uninstall rate and search-result conversion rate, without Google confirming any weights.

### Cited Findings
- **[Google]** Play considers "ratings, reviews, downloads, and other factors" when ranking, and "the overall experience of your app based on user behavior and feedback". — [Play Console Help 4448378](https://support.google.com/googleplay/android-developer/answer/4448378)
- **[Google]** "If your app exceeds a bad behavior threshold, it's likely to be less discoverable on Google Play". Play may also show a store-listing warning and the app may lose eligibility for promotional surfaces. Thresholds:
  - User-perceived crash rate: **1.09%** overall, **8%** per device model.
  - User-perceived ANR rate: **0.47%** overall, **8%** per device model.
  - The excessive partial wake locks metric is in beta, and "exceeding the bad behavior threshold does not currently make your app less discoverable". — [Play Console Help: Android vitals](https://support.google.com/googleplay/android-developer/answer/9844486?hl=en)
- **[Google]** Per device model: Play "may reduce the visibility of your title for users on that phone model, and in some cases, will show a warning on your store listing". — [Android Developers: Android vitals](https://developer.android.com/topic/performance/vitals)
- **[Google, 2022]** The October 2022 Android Developers blog post introduced the per-device thresholds and the steering away from bad-behaviour devices. The post is older than the preferred window but is the origin of the current rule. — [Android Developers Blog: Raising the bar on technical quality](https://android-developers.googleblog.com/2022/10/raising-bar-on-technical-quality-on-google-play.html)
- **[Vendor]** App Radar (2026):
  - Install velocity: "Both algorithms care more about installs per day than installs to date."
  - Google Play "weighs Day 1, 7, and 30" retention. Healthy benchmarks are "D1 above 35%, D7 above 15%".
  - Conversion rate from the search-result entry to install matters.
  - Android vitals matter: "crash rate, ANR rate, battery efficiency, startup time".
  - Review velocity: "An app with a 4.2 rating and 100 fresh reviews per week typically outranks an app with 4.5 stars and 5 reviews per week."
  - Google has shifted "from ranking by install volume to ranking by retention and engagement".
  - None of this is backed by published data. — [App Radar 2026](https://appradar.com/academy/aso-basics/app-store-ranking-factors)
- **[Vendor]** AppTweak (2026) lists Android vitals health, app performance and user satisfaction, and backlinks as ranking influences. It says a "high star rating will help you rank better". — [AppTweak checklist](https://www.apptweak.com/en/aso-blog/app-store-optimization-aso-checklist-for-google-play)
- **[Anecdotal]** A DEV Community post names install velocity, day-one retention and uninstall rate. It cites the vitals thresholds without attribution, and its evidence is personal experience and Indie Hackers conversations. — [DEV: Google Play search ranking for a new app](https://dev.to/vmzavas/google-play-search-ranking-for-a-new-app-how-it-works-5h2c)

### Inferences
- For Wordburn, the vitals thresholds are the only ranking factor outside the listing text with a hard, Google-documented number. Two things make them relevant:
  - The batch queue holds a foreground service and wake behaviour for long periods. The partial wake lock metric is beta now and does not yet affect discoverability, but Google has a history of promoting beta vitals to core.
  - The 874 MB model download plus model load can kill apps on low-memory devices (CLAUDE.md, slice 16). Low-memory kills of that kind may surface as ANRs or crashes on specific device models.
- Conversion rate links back to the release notes question. "What's new" is not a ranking field, but it is visible text that may affect install conversion, and conversion is a ranking input according to vendors.

### Gaps
- Google publishes no weights for installs, retention, uninstalls or conversion. Every specific benchmark (D1 35%, D7 15%) is vendor opinion.
- No source quantified the uninstall rate as a ranking factor.

## What changed in 2024–2026: AI search, custom store listings, experiments, localisation, promotional content?

### Takeaway
Play has added AI discovery surfaces:
- Guided Search, rolling since September 2025, with AI listicles built from metadata and reviews.
- "Ask Play" chat on listings, launched December 2025 and expanded at I/O 2026.
- App discovery inside the Gemini app, announced at I/O 2026.

These read listing descriptions and reviews semantically, which favours specific, plain descriptions over keyword lists.

Custom store listings can now target **search keywords** as well as country, with up to 50 listings. Store listing experiments can test descriptions in localized experiments. Promotional content (LiveOps) is gated behind thresholds Wordburn cannot meet.

### Cited Findings
- **[Google feature, AppTweak's reporting]** The source separates Google's features from AppTweak's commentary:
  - **Ask Play**: "the Gemini-powered chat interface embedded in Google Play store listings". It launched December 2025 and was formalised at I/O 2026. It draws from the "description and key features in your Google Play listing" and also from "an app's own website".
  - **Guided Search**, rolling since September 2025, suggests narrower sub-queries for broad searches. It shows AI-generated listicles whose highlights are generated "from metadata and user reviews".
  - At I/O 2026, the **Gemini app** gained conversational app recommendations with in-Gemini install.
  - Play Shorts launched, US first.
  - The rollout is limited to "English-language devices", with EEA lagging.
  - AppTweak's own advice: "Front-load your strongest positioning" and be "specific about what your app does".
  - [AppTweak: Google I/O 2026 ASO updates](https://www.apptweak.com/en/aso-blog/google-i-o-2026-aso-updates)
- **[Press]** I/O 2026: Ask Play lets users ask natural-language questions with follow-ups, for example "has an offline mode". Apps become discoverable in the Gemini app on Android and the web. — [9to5Google, 19 May 2026](https://9to5google.com/2026/05/19/google-play-store-gets-new-ask-play-chatbot-as-gemini-starts-recommending-apps/); [Android Authority](https://www.androidauthority.com/google-play-connected-app-for-gemini-rollout-3681969/)
- **[Vendor]** AppFollow (2026): Google "applies semantic matching… keyword relationships and search intent often matter more than repeating the same phrase". — [AppFollow](https://appfollow.io/blog/google-play-aso-keywords)
- **[Google]** Custom store listings:
  - Targets: churned, lapsed and buyer segments, ads traffic, **Country/Region**, pre-registration, **Search keywords**, custom audiences, and unique CSL URLs.
  - Up to **50** custom listings.
  - You can customise "name, icon, descriptions, and graphic assets". Contact details, privacy policy and category are shared.
  - For search keywords you "can choose from the available keywords known to bring you traffic" or "enter and run searches for new keywords".
  - The help page does not say whether a CSL changes organic ranking. — [Play Console Help: Custom store listings](https://support.google.com/googleplay/android-developer/answer/9867158?hl=en)
- **[Vendor]** Keyword-targeted CSLs are described as new in 2025. Their pages "appear only when the user's search query matches", and you can view the "spelling corrections and translations included in that keyword bundle". — [Phiture: Master Google Play CSLs in 2025](https://phiture.com/asostack/google-play-custom-store-listings/); [The ASO Project: CSLs for keywords](https://www.theasoproject.com/blog/custom-store-listings-for-keywords/) (via search summary)
- **[Google]** Store listing experiments:
  - Default-language experiments test only the "icon, feature graphic, and screenshots".
  - **Localized experiments** can test "icon, feature graphic, screenshots, and/or your app's descriptions" in up to five languages.
  - Up to 2 variants. One default graphics experiment, or up to five localized experiments at once.
  - Experiments auto-stop after 6 months.
  - The app name is not listed as testable, so `ASO.md`'s idea of testing the name as a store listing experiment may not be possible. — [Play Console Help: Store listing experiments](https://support.google.com/googleplay/android-developer/answer/6227309?hl=en)
- **[Google, via search summary]** Locale selection works in three tiers:
  - Users see the listing in their device language if the developer added it.
  - Otherwise they see the default language.
  - They can opt into an automated translation (not available for Armenian, Romansh, Tagalog or Zulu). — [Play Console Help: Translate and localize your app](https://support.google.com/googleplay/android-developer/answer/9844778?hl=en)
- **[Google, via search summary]** Promotional content is open to all games, but apps must qualify for "Premium growth tools". Non-dating apps need one of the following:
  - ≥1.6M daily MAU over 3 months with ≥1.6M active installs
  - ≥2M daily MAU last month with 2M installs
  - ≥$40k per month consumer spend for 3 months
  - ≥$50k consumer spend last calendar month — [Play Console Help: Create promotional content](https://support.google.com/googleplay/android-developer/answer/12932541?hl=en)
- **[Google]** Promotional content quality guidelines: a tagline of at most 80 characters, no all caps, no repeated "!" or "?", and no CTAs. Non-compliance "may result in limited exposure". — [Play Console Help: Content quality guidelines](https://support.google.com/googleplay/android-developer/answer/12929944?hl=en)

### Inferences
- **Release notes are not on the list of things Ask Play reads.** AppTweak says it reads the description, key features and the website. Guided Search listicles read metadata and reviews. So even on the AI surfaces there is no evidence that "What's new" feeds discovery.
- Ask Play also reads the website, which makes a real `wordburn.app` page that states the same features worth having.
- Several Wordburn-specific opportunities follow:
  - The plain "what it does" sentence at the top of the full description now does double duty: keyword position and LLM summary.
  - Natural-language attributes users might ask Ask Play about, such as "works without internet" or "batch", are worth stating plainly once in the description. `ASO.md` deliberately dropped "offline". That is a positioning choice, but it removes a fact an Ask Play query like "caption app that works offline" could match.
  - Localized listings for the nine supported languages (Spanish, German, Indonesian and so on) are the documented route to non-English search. Google says professional translations help discoverability.
  - Keyword-targeted CSLs only target keywords Play already shows as bringing traffic, or ones you search for. They are a conversion tool layered on top of ranking, not a way to get indexed.
- Promotional content is out of reach for Wordburn, so App Radar's claim that promo text is indexed does not matter here.

### Gaps
- No Google primary source was fetched for Guided Search or Ask Play's data sources. That detail comes through AppTweak and press.
- The help page does not say whether a keyword-targeted CSL requires a minimum traffic level or install count to unlock. It implies keywords "known to bring you traffic" are preferred, which a zero-install app will not have.
- I could not confirm whether the "Search keywords" CSL target uses the CSL's own text for ranking. All evidence describes it as a display swap for matched queries.

## What is realistic for a brand-new app with zero installs?

### Takeaway
A new app first becomes findable by its exact name or package. Long-tail keywords follow within one to three weeks, and broad head terms take weeks to months and depend on installs and conversion. Metadata edits take a few days to a week to show in rankings. All timelines are vendor or anecdotal. Google publishes none.

### Cited Findings
- **[Anecdotal]** For the first few days a new app is findable only by exact package name or exact title. Broad keyword rankings appear "between two to six weeks after release" given a steady trickle of installs and stable vitals. The author describes an "evaluation period" in which Google measures safety signals, conversion and initial downloads. The post offers no data. — [DEV Community](https://dev.to/vmzavas/google-play-search-ranking-for-a-new-app-how-it-works-5h2c)
- **[Vendor]** A new app is usually indexed first for long-tail phrases, the example being "drifting car games offline". Play typically needs "one to two weeks, sometimes three weeks" to place it in the top 250 for its keywords. — [KeyApp FAQ](https://keyapp.top/blog/faq/how-to-get-into-the-index-for-the-keywords-if-the-application-is-already-optimized-and-if-it-is-new/) (via search summary; KeyApp sells install campaigns)
- **[Vendor]** Indexing lag after a metadata update is typically 3–5 days, and 24–48 hours for apps with strong signals. For newer apps, about a week. — [SemNexus: Keyword indexing lag](https://semnexus.com/app-store-keyword-indexing-lag-ios-vs-android-timelines) (via search summary). ASO World says full effects of a change take 4–6 weeks. — [ASO World ranking timeline](https://asoworld.com/en/blog/how-long-does-it-take-to-see-google-play-keyword-ranking-results-a-timeline-anomaly-check-guide/) (via search summary)
- **[Vendor experiment]** In RadASO's test, keywords that apps had just been indexed for (via review text) started at positions #13–#179 depending on popularity and competition. Indexing took 2–3 days and rarely up to 10. — [RadASO](https://radaso.com/asomythbusters-experiments/do-reviews-get-indexed-in-the-app-store-and-google-play)
- **[Vendor]** "Long-tail Google Play Store keywords are often the best entry point for smaller apps because competition is lower and user intent is clearer." — [AppFollow 2026](https://appfollow.io/blog/google-play-aso-keywords)
- **[Vendor]** Guided Search splits broad queries into narrower sub-queries. AppTweak notes this moves traffic away from broad terms, though "short and mid-tail keyword searches… remain a valuable source". — [AppTweak I/O 2026](https://www.apptweak.com/en/aso-blog/google-i-o-2026-aso-updates)

### Inferences
- At launch Wordburn should not expect to rank for head terms like "captions", "subtitles" or "auto captions". Those are held by CapCut, Captions, VN and others with millions of installs. Realistic early targets are specific multi-word phrases the listing contains verbatim, for example:
  - "batch captions" or "batch subtitles"
  - "word by word captions"
  - "karaoke captions"
  - "captions for Indonesian video", and other language-specific phrases in localized listings
  - "burn in subtitles"
  - "srt export"
- Guided Search's narrowing toward sub-queries may help a niche app here.
- Because indexing takes days and full effect takes weeks, one listing change every 1–2 weeks is the fastest cadence that can be read. Changing title and short description together hides which change worked.
- Release notes cannot speed any of this up. What can: early reviews that naturally mention the feature words (RadASO shows review text is indexed within days), and a clean vitals record from day one.

### Gaps
- No Google statement on a "new app evaluation period" or indexing timelines was found. Every timeline above is vendor or anecdotal, and the most specific ones come from install-campaign sellers (KeyApp, ASO World), who have an interest in saying installs drive ranking.
- No data was found specific to the captions/subtitles category on keyword difficulty or volume on Play. That needs an ASO tool such as AppTweak, MobileAction or ASOdesk, run live.
