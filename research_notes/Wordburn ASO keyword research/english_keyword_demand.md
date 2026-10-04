# English-language keyword demand and competition for Wordburn on Google Play (US/global)

**Method and provenance.** Collected 2026-10-02.
- **Play autocomplete**: the Play Store's own suggestion endpoint, US store, English, queried through the open-source [google-play-scraper](https://github.com/facundoolano/google-play-scraper) v10 `suggest()`. It returns at most 5 suggestions per prefix, in Play's order. An empty result means Play offered no suggestion for that prefix.
- **Play search results and installs**: the top 10 results per term from an anonymous US search ([e.g. play.google.com/store/search?q=auto+captions&c=apps&gl=US](https://play.google.com/store/search?q=auto%20captions&c=apps&hl=en&gl=US)), with each app's install count, rating count, genre and release date taken from its detail page through the same library. These installs are the exact figures Play exposes in page data (`maxInstalls`), not the "1M+" bucket. Results are not personalised and may differ slightly from a signed-in phone.
- **Google Trends**: run through [pytrends](https://github.com/GeneralMills/pytrends) for 2024-10-01 to 2026-09-30, in batches of up to 5 terms. Numbers are relative (0–100 inside each batch) and **only comparable within a batch**. Trends measures Google web or YouTube search, **not Play Store search**; it shows relative interest, not app-store volume.
- **Third-party ASO scores**: the only public per-keyword Play scores found were ASOTools' "research case" pages. They are undated (see Gaps).
- **No absolute search volume is given anywhere in these notes.** Google Play does not publish search volume ([Phiture, Jun 2025](https://phiture.com/asostack/google-play-store-keywords-how-to-find/); [AppFollow](https://appfollow.io/blog/google-play-aso-keywords)). No public Keyword Planner figures for these terms were found.

**Side finding the report writer should surface.** Wordburn is already publicly live on Google Play: [com.wordburn.app](https://play.google.com/store/apps/details?id=com.wordburn.app), title **"Wordburn: Subtitles & Captions"**, developer Venturefold Labs, released Sep 22, 2026, 1 install. Its short description reads **"Auto captions & subtitles for your video. Offline, on-device, pay once."** This conflicts with the repo's `ASO.md` in three ways. ASO.md says the package returns 404. It proposes the name "Wordburn: Captions & Clips". And it says "offline / pay once" was removed. The live listing already ranks #9 of 10 for "burn subtitles to video" ([search](https://play.google.com/store/search?q=burn%20subtitles%20to%20video&c=apps&hl=en&gl=US)). Note also that ASO.md's name contains "Clips", and auto clip was removed from the product on 2026-10-02.

---

## Ranked candidate keyword list (head / mid / long-tail)

### Takeaway
The category's demand is concentrated in a small set of "caption(s)" and "subtitle(s) for videos" phrases. A cluster of ten or so incumbents with 0.35–5.9M installs owns all of them. A new app can realistically rank only in a long tail: "word by word captions", "captions for talking videos", "burn subtitles to video", "caption style", "subtitle editor (srt)", "karaoke captions". Most of these have autocomplete evidence of demand but weak or off-topic top-10s. The head terms still have to sit in the title and short description to be indexed at all. Treat them as relevance anchors, not traffic sources, at launch.

### Cited Findings
Scoring key. **Pop** = popularity proxy:
- A: suggested by Play after ≤4 letters, or the top Trends term.
- B: appears in Play autocomplete for its own stem.
- C: no Play suggestion, or very low Trends.

**Difficulty** = from the US top-10 data below:
- Very hard: median top-10 installs ≥2M, or mass-market editors in the top 5.
- Hard: median ≥400k and no top-5 app under 300k.
- Medium: a top-5 app under ~100k, or ≥3 apps under 100k.
- Easy: most of the top 10 under 100k.

**Fit** = intent match to Wordburn.

**Head terms** (high demand, entrenched incumbents; put in title/short description for relevance, do not expect to rank top 5 at launch):

| # | Keyword | Pop | Evidence of demand | Top-10 median installs / weakest top-5 | Difficulty | Fit |
|---|---|---|---|---|---|---|
| 1 | auto captions | A | Play suggests "auto captions" first for "auto cap"; Trends US mean 37.4, rising 20.9→56.1 (first vs last 6 months) | 2.2M / 350k | Hard | Exact |
| 2 | captions app / captions | A | "capt" → "captions", "captions app" (4 letters); Trends US "captions app" 36.3, rising 17.7→49.4 | captions app 468k / 72k; captions 406k / 72k | Hard (weakest top-5 is a 1.6★ 72k-install clone) | Exact, but "captions" alone is diluted by photo/quote apps |
| 3 | captions for videos | A | "captions for v" → "captions for videos free", "captions for videos" | 2.6M / 406k; 0 apps <100k | Very hard | Exact |
| 4 | add subtitles to video(s) / add captions to video(s) | A | "add sub" → "add subtitles to videos" first; "add cap" → "add captions to videos" first; Trends WW web "add subtitles to video" 11.4 vs "auto captions" 9.6 | 2.2M / 406k; add captions to video: top 8 all ≥350k | Hard | Exact |
| 5 | subtitles for videos | A | "subt" → 2nd suggestion "subtitles for videos" (after "subtime") | 1.6M / 164k | Hard | Exact (but "subtitles" alone is a trap, see intent section) |
| 6 | video captions | B | "video caption" → "video captions"; Trends US mean 47.8 vs auto captions 20.4 in the same batch (web intent is broad) | 2.8M / 350k; Mojo 19M, BIGVU 9.8M in top 10 | Very hard | Exact |
| 7 | caption generator / video caption generator | B | "caption generator" stem suggests "…for video"; Trends WW "caption generator" 21.1 vs "auto captions" 23.3 | 2.2M / 350k; video caption generator 2.6M / 350k | Hard | Mixed (bare "caption generator" also means AI text captions for photos) |
| 8 | ai captions | B | "ai caption" → "ai captions" first; Trends WW web 37.6 (highest in its batch) | 861k / 350k | Hard | Mixed (also photo caption writers) |
| 9 | tiktok captions | B | "tiktok caption" → "tiktok captions" first; Trends WW web 21.8 | **19M** / 861k; CapCut 2.0B, InShot 957M, TikTok Studio 107M in top 10 | Very hard | Matches intent, but brand-name policy risk (ASO.md already excludes it) |

**Mid terms** (real demand, incumbents slightly less locked in, or a fit Wordburn can argue better):

| # | Keyword | Pop | Evidence | Top-10 median / weakest top-5 | Difficulty | Fit |
|---|---|---|---|---|---|---|
| 10 | auto subtitles / auto subtitle generator | B | "auto sub" → "auto subtitles for videos", "auto subtitles", "auto subtitle generator"; Trends US "auto subtitles" 15.1 vs "auto captions" 37.4 | 2.2M / 350k; generator 1.8M / 350k | Hard | Exact |
| 11 | subtitle generator / video subtitle generator | B | "subtit" → 4th "subtitle generator"; "video sub" → "video subtitle generator" first; Trends WW 11.7 (half of "auto captions") | 468k / 406k; 4 of 10 under 100k | Medium-hard | Exact |
| 12 | caption maker (for videos) / subtitle maker | B | "caption maker" → "caption maker for videos"; "subtitle maker" → "…for videos", "…srt"; Trends US "subtitle maker" ≈0 | caption maker 861k / **137** (a 137-install app is #5); subtitle maker 1.8M / **7k** (Vexo, 7k installs, is #4) | Medium | Exact |
| 13 | captions editor / caption editing app | B | "caption e" → "caption editor", "caption editing app"; "captions ed" → "captions editing app", "captions editor" | not pulled (see Gaps) | Unknown | Exact (word-level editing is a Wordburn strength) |
| 14 | animated captions | B (weak) | "animated caption" → only "animated captions"; Trends US 0.5 vs auto captions 20.4 | 861k / 350k; #6 CapFlow 18k | Hard | Exact |
| 15 | shorts captions | C | no Play suggestion for "shorts caption" | 468k / 281k | Hard | Exact |
| 16 | reels captions / captions for reels | B | "reels caption" → "reels caption", "captions for instagram reels"; Trends US "captions for reels" 6.9 | reels captions 468k / **13k** (a text-caption app is #4); captions for reels 2.2M / 406k | Medium (reels captions) / Hard | Mixed: half the results are Instagram text-caption apps |
| 17 | transcribe video / video to text | B | "transcribe video" → "…to text", "…to script"; Trends US 48.9 (above "auto captions" 37.4 in the same batch, but flat 39.3→49.1) | **50k** / 749; 7 of 10 under 100k | Medium-easy | Partial (transcription/productivity intent; Wordburn's .srt and transcript qualify, but users want text, not burned-in captions) |

**Long-tail terms** (where a new app can realistically reach the top 5):

| # | Keyword | Pop | Evidence | Top-10 data | Difficulty | Fit |
|---|---|---|---|---|---|---|
| 18 | word by word captions | C (Play) / C (Trends 0.4) | no Play suggestion for it ("word by word" suggests Quran apps) | #1 "Word Captions" has **4k installs, 0 ratings**; #4 11k, #5 8k; 4 of 10 under 100k | Easy-medium | Exact: Wordburn's core claim |
| 19 | captions for talking videos | B | suggested under "captions for" | #5 "Captions for talking videos" 8k installs; the rest are incumbents | Medium | Exact |
| 20 | caption style app / caption styles | B | "caption s" → "caption style app" | not pulled (see Gaps) | Unknown | Exact (18 styles) |
| 21 | burn subtitles to video / burn subtitles | B | "burn subtitles" → "burn subtitles to video" | median **32k**; #1 IBURN 782 installs; 6 of 10 under 100k; Wordburn's own listing already #9 | Easy | Exact, and it echoes the brand name |
| 22 | karaoke captions | C (no suggestion for "karaoke sub") | — | #1 CapFlow 18k installs; 4 of the top 10 are karaoke singing apps | Easy for the caption slot, mixed SERP | Matches the style, but low and ambiguous demand |
| 23 | highlighted captions | C | not suggested | 861k / 350k (incumbents fill it on relevance) | Hard | Exact, low demand |
| 24 | subtitle editor / subtitle editor srt | B | "subtitle editor" → "…srt", "…srt and vtt", "…for videos", "…app"; Trends US 1.7 | median **7k**; top app 76k; 9 of 10 under 100k | Easy | Partial: users want SRT file editing; Wordburn exports .srt and edits words |
| 25 | srt generator / subtitle maker srt / srt subtitle | C–B | "srt" alone suggests bus/games; "subtitle maker srt" is a suggestion; Trends US "srt generator" 0.9 | srt generator median 5k; subtitle maker srt median 2k; 9 of 10 under 100k each | Easy | Partial (power-user / desktop-workflow intent) |
| 26 | captions with emoji | C | — | keyboards and emoji apps dominate (median 14M) | n/a | Trap; Wordburn has no emoji |
| 27 | batch captions | C | no suggestion | incumbents on relevance; no app targets it | Easy to rank, **no demonstrated demand** | Exact (Pro feature) |
| 28 | hormozi captions | C | "hormozi" → "hormozi", "alex hormozi" only | incumbents fill it | Easy-ish, no demand evidence | Exact for the bold-yellow look; person's name (policy risk) |

Underlying sources for every row:
- Play autocomplete: queried 2026-10-02, US/en, via [google-play-scraper suggest](https://github.com/facundoolano/google-play-scraper).
- Play search pages: [auto captions](https://play.google.com/store/search?q=auto%20captions&c=apps&hl=en&gl=US), [captions](https://play.google.com/store/search?q=captions&c=apps&hl=en&gl=US), [captions app](https://play.google.com/store/search?q=captions%20app&c=apps&hl=en&gl=US), [captions for videos](https://play.google.com/store/search?q=captions%20for%20videos&c=apps&hl=en&gl=US), [add subtitles to video](https://play.google.com/store/search?q=add%20subtitles%20to%20video&c=apps&hl=en&gl=US), [subtitles for videos](https://play.google.com/store/search?q=subtitles%20for%20videos&c=apps&hl=en&gl=US), [video captions](https://play.google.com/store/search?q=video%20captions&c=apps&hl=en&gl=US), [caption generator](https://play.google.com/store/search?q=caption%20generator&c=apps&hl=en&gl=US), [ai captions](https://play.google.com/store/search?q=ai%20captions&c=apps&hl=en&gl=US), [tiktok captions](https://play.google.com/store/search?q=tiktok%20captions&c=apps&hl=en&gl=US), [auto subtitles](https://play.google.com/store/search?q=auto%20subtitles&c=apps&hl=en&gl=US), [subtitle generator](https://play.google.com/store/search?q=subtitle%20generator&c=apps&hl=en&gl=US), [caption maker](https://play.google.com/store/search?q=caption%20maker&c=apps&hl=en&gl=US), [subtitle maker](https://play.google.com/store/search?q=subtitle%20maker&c=apps&hl=en&gl=US), [animated captions](https://play.google.com/store/search?q=animated%20captions&c=apps&hl=en&gl=US), [shorts captions](https://play.google.com/store/search?q=shorts%20captions&c=apps&hl=en&gl=US), [reels captions](https://play.google.com/store/search?q=reels%20captions&c=apps&hl=en&gl=US), [transcribe video](https://play.google.com/store/search?q=transcribe%20video&c=apps&hl=en&gl=US), [word by word captions](https://play.google.com/store/search?q=word%20by%20word%20captions&c=apps&hl=en&gl=US), [captions for talking videos](https://play.google.com/store/search?q=captions%20for%20talking%20videos&c=apps&hl=en&gl=US), [burn subtitles to video](https://play.google.com/store/search?q=burn%20subtitles%20to%20video&c=apps&hl=en&gl=US), [karaoke captions](https://play.google.com/store/search?q=karaoke%20captions&c=apps&hl=en&gl=US), [highlighted captions](https://play.google.com/store/search?q=highlighted%20captions&c=apps&hl=en&gl=US), [subtitle editor](https://play.google.com/store/search?q=subtitle%20editor&c=apps&hl=en&gl=US), [srt generator](https://play.google.com/store/search?q=srt%20generator&c=apps&hl=en&gl=US), [subtitle maker srt](https://play.google.com/store/search?q=subtitle%20maker%20srt&c=apps&hl=en&gl=US), [captions with emoji](https://play.google.com/store/search?q=captions%20with%20emoji&c=apps&hl=en&gl=US), [batch captions](https://play.google.com/store/search?q=batch%20captions&c=apps&hl=en&gl=US), [hormozi captions](https://play.google.com/store/search?q=hormozi%20captions&c=apps&hl=en&gl=US).
- Google Trends: US batches [1](https://trends.google.com/trends/explore?date=2024-10-01%202026-09-30&geo=US&q=auto%20captions,subtitle%20maker,video%20captions,animated%20captions,word%20by%20word%20captions), [2](https://trends.google.com/trends/explore?date=2024-10-01%202026-09-30&geo=US&q=auto%20captions,transcribe%20video,srt%20generator,subtitle%20editor,captions%20for%20reels), [3](https://trends.google.com/trends/explore?date=2024-10-01%202026-09-30&geo=US&q=auto%20captions,add%20captions%20to%20video,captions%20app,capcut%20captions,auto%20subtitles); worldwide batches [4](https://trends.google.com/trends/explore?date=2024-10-01%202026-09-30&q=auto%20captions,caption%20app,subtitle%20app,captions%20app,add%20subtitles%20to%20video), [5](https://trends.google.com/trends/explore?date=2024-10-01%202026-09-30&q=auto%20captions,subtitle%20generator,caption%20generator,ai%20captions,tiktok%20captions).

### Inferences
- **Recommended targeting order for the listing**:
  1. Title and short description carry "captions" or "auto captions" plus "subtitles" for relevance. The live title "Subtitles & Captions" already does this.
  2. The short description and the first lines of the full description carry "word by word" (or "word-by-word"), "add subtitles to videos", "captions for videos", and "caption styles" or "animated captions".
  3. The full description covers the long tail naturally: burn subtitles into video, karaoke captions, highlighted words, subtitle editor, .srt, talking videos, Reels/Shorts-style vertical video (without brand names).
- The single best-fit and most winnable term is **"word by word captions"**. It is Wordburn's literal value proposition, and the current #1 has 4k installs and no ratings. It has no Play suggestion and near-zero Trends interest, so it is a conversion and relevance win rather than a traffic win.
- **"burn subtitles to video"** is the second clear long-tail win. It has a Play suggestion, a weak top 10 (median 32k), the existing listing already ranks there, and "burn" doubles as brand recall for "Wordburn".
- "auto captions" is the best head term. It has the strongest and fastest-rising Trends line in the category (US interest roughly 2.7× from the first to the last six months of the window) and is Play's first suggestion. The top 10 is all 350k–5.9M-install specialists, though, so ranking in the top 10 depends on install velocity and ratings, not metadata alone.
- Head terms are owned by about ten apps that recur across nearly every query. Pixster's "Captions AI" (2.76M installs, 92k ratings) and Captions' own "Captions Lite" (4.47M) each appear in the top 5 of 31 of the 46 queries pulled. A new app with no installs will not displace them on head terms in its first months, whatever the metadata says.
- The "difficulty" grades come from install and rating counts of current rankers. That is a proxy: Play's ranking also weighs install velocity, retention and conversion, which are not observable from outside.

### Gaps
- No absolute monthly search volume for any term, on Play or on Google web. No public Keyword Planner numbers were found, and no ASO-tool popularity scores were accessible beyond ASOTools' two undated pages.
- "caption editor", "captions editing app" and "caption style app" have Play suggestions, but their top 10s were not pulled, so their difficulty is unknown.
- The autocomplete order is a weak ordinal signal. Five slots per prefix do not reveal relative magnitude between two suggestions.

---

## Popularity evidence: autocomplete, Trends, ASO tool scores

### Takeaway
On Play, "captions" / "captions app" surface after four letters ("capt"), and "subtitles for videos" after four letters ("subt"). Those are the strongest observable demand signals in the category. Brands (CapCut, Capital One) take the earlier prefixes. On Google web and YouTube search, "auto captions" is the leading and fastest-growing phrase; "ai captions" is high but ambiguous. Feature words ("animated", "word by word", "karaoke") have near-zero standalone demand.

### Cited Findings
**Play autocomplete (US, en, 2026-10-02, via [google-play-scraper](https://github.com/facundoolano/google-play-scraper)).**

Short prefixes:
- "cap" → capcut, capital one, capital one mobile app, capital one shopping, capcut pro.
- "capt" → captain d's app, **captions**, captain d's, **captions app**, captain tsubasa.
- "sub" → subway surfers, subway app, substack, subway surfers city, subnautica.
- "subt" → subtime, **subtitles for videos**, subtasks, subterfuge, subtracker.
- "au" and "aut" → authenticator / auto clicker; no caption term appears.
- "vid" → video downloader, video editor, video player…; no caption term.

Stems:
- "auto cap" → auto captions, auto caption video, **autocap** (a brand), auto caption video subtitles, auto caption for video free.
- "auto captions" → auto captions, auto captions for videos, auto captions video subtitles, auto captions free app, auto captions app.
- "caption" → captions, captions app, captions ai, caption call app, captiono.
- "captions" → captions, captions app, captions ai, captions lite, captions subtitles for videos.
- "caption app" → caption app, caption app free, caption apps bangla, caption app for video, caption apps bangla and english.
- "captions app" → captions app, captions app for videos, captions application, captions app for photos, captions app bangla.
- "subtitle" / "subtit" → subtitles for videos, subtitles, subtitle downloader, subtitle generator, subtitle translator.
- "subtitles" → subtitles for videos, subtitles, subtitles downloader, subtitles viewer, subtitles for movies.
- "subtitles for" → subtitles for videos, subtitles for movies, subtitles for youtube, subtitles for videos free, subtitles for samsung internet.
- "add cap" → add captions to videos, add captions to pictures, add captions to video free, add caption, add capcut.
- "add sub" → add subtitles to videos, add subtract game…, add subtitles, add subtitles to video free.
- "add subtitles" → add subtitles to videos, add subtitles, add subtitles to video free, add subtitles voicella, add subtitles to movie.
- "auto subtitle" → auto subtitles for videos, auto subtitles, auto subtitle generator, auto subtitles for videos free, auto subtitle generator free.
- "video caption" → video captions, video caption generator, video captions free, video caption app, video caption generator free.
- "video sub" → video subtitle generator, video subtitle translator, video subtitle translator all languages, video subtitles, video subtitle generator free.
- "captions for" → captions for videos free, captions for talking videos, captions for photos, captions for videos, captions for instagram and.
- "captions for v" → captions for videos free, captions for videos, captions for video subtitles, dubs captions for videos, veed captions for videos.
- "ai caption" → ai captions, ai caption generator, ai caption generator free, ai caption free, ai caption for photo.
- "animated caption" → animated captions (only).
- "tiktok caption" → tiktok captions, tiktok caption copy app, tiktok caption app bangla, tiktok caption apps, tiktok caption video.
- "reels caption" → reels caption, reels captions nontuff, captions for instagram reels, reels and video captions, copy caption reels.
- "caption maker" → caption maker, caption maker for photos, caption maker for videos, caption maker free, video auto caption maker.
- "subtitle maker" → subtitle maker, subtitle maker for videos, subtitle maker srt, subtitle maker - srt editor, subtitle maker ai caption.
- "caption generator" → caption generator, caption generator free, caption generator for video, caption generator app, caption generator free app.
- "subtitle editor" → subtitle editor, subtitle editor srt, subtitle editor srt and vtt, subtitle editor for videos, subtitle editor app.
- "caption e" → caption editor, caption editing app, caption edit, caption edit app, caption english.
- "caption s" → caption subtitle, caption software, caption status, caption subtitles for video, **caption style app**.
- "captions ed" → captions editing app, captions editor, captions edit, captions editing, vmake ai captions video editor.
- "burn subtitles" → burn subtitles to video, burn subtitles.
- "transcribe video" → transcribe video to text, transcribe video, transcribe video to text free, transcribe video to script, transcribe video audio to text.
- "speech to text video" → speech to text video, speech to text video editor, transcribe speech to text video, video speech to text converter.
- "closed caption" → closed caption app, closed caption, closed caption app for deaf, closed caption app free, closed captioning.
- "live cap" → live caption, live caption translation, live caption app, live caption app free, live caption video translate.
- "text on video" → text on video, text on video app, text on video with font and style, text on video and video editor, text on video editor.
- "add te" → add text, add text to photos, add text to image, add text to video, add text to photos free.
- "word by word" → word by word quran, word by word quran app, word by word quran translation in urdu, word by word quran in bangla, word by word.
- "srt" → srt, srta bus tracker, srt games, srta, srt hellcat games.
- "hormozi" → hormozi, alex hormozi.

**No suggestion at all** for "karaoke sub" or "shorts caption".

**Google Trends.** Relative interest; each batch is separate; window 2024-10-01 to 2026-09-30. Each row gives the batch's terms, then each term's mean followed by its first-6-month and last-6-month means in brackets.

| Batch | Region / search type | Terms: mean [first 6 mo → last 6 mo] |
|---|---|---|
| [US 1](https://trends.google.com/trends/explore?date=2024-10-01%202026-09-30&geo=US&q=auto%20captions,subtitle%20maker,video%20captions,animated%20captions,word%20by%20word%20captions) | US, web | auto captions 20.4 [11.4→30.7]; video captions 47.8 [28.5→63.5]; animated captions 0.5; word by word captions 0.4; subtitle maker 0.0 |
| [US 2](https://trends.google.com/trends/explore?date=2024-10-01%202026-09-30&geo=US&q=auto%20captions,transcribe%20video,srt%20generator,subtitle%20editor,captions%20for%20reels) | US, web | auto captions 37.4 [20.9→56.1]; transcribe video 48.9 [39.3→49.1]; captions for reels 6.9; subtitle editor 1.7; srt generator 0.9 |
| [US 3](https://trends.google.com/trends/explore?date=2024-10-01%202026-09-30&geo=US&q=auto%20captions,add%20captions%20to%20video,captions%20app,capcut%20captions,auto%20subtitles) | US, web | auto captions 37.4 [20.9→56.1]; captions app 36.3 [17.7→49.4]; capcut captions 28.5 [17.2→45.6]; auto subtitles 15.1 [7.4→20.4]; add captions to video 13.9 [12.5→13.4] |
| Same terms as US 3 | UK, web | auto captions 37.0; capcut captions 30.4; captions app 20.8; auto subtitles 14.0; add captions to video 3.7 |
| Same terms as US 3 | Worldwide, web | auto captions 30.2; captions app 28.2; capcut captions 21.0; auto subtitles 16.1; add captions to video 6.2 |
| [WW 4](https://trends.google.com/trends/explore?date=2024-10-01%202026-09-30&q=auto%20captions,caption%20app,subtitle%20app,captions%20app,add%20subtitles%20to%20video) | Worldwide, web | add subtitles to video 11.4; auto captions 9.6; captions app 8.9; caption app 5.6; subtitle app 4.2 |
| WW 4 | Worldwide, YouTube search | auto captions 68.8; caption app 68.2; add subtitles to video 51.9; captions app 26.4; subtitle app 12.5 |
| [WW 5](https://trends.google.com/trends/explore?date=2024-10-01%202026-09-30&q=auto%20captions,subtitle%20generator,caption%20generator,ai%20captions,tiktok%20captions) | Worldwide, web | ai captions 37.6; auto captions 23.3; tiktok captions 21.8; caption generator 21.1; subtitle generator 11.7 |
| WW 5 | Worldwide, YouTube search | auto captions 75.4; caption generator 60.0; ai captions 33.6; subtitle generator 20.6; tiktok captions 11.5 |

**ASO tool scores (public).**
- ASOTools' Google Play page for **"caption"**: search volume 46, difficulty 56, 250+ apps. Its top related terms are "caption america" (60/6), "caption for instagram" (56/10), "icaptions" (53/44), "captioning" (53/4) and "caption for insta" (46/9). These are all photo-caption or call-captioning intents. Undated. — [ASOTools: caption](https://asotools.io/app-store-keywords/caption)
- ASOTools' Google Play page for **"subtitles"**: volume 42, difficulty 23, 250+ apps, 73 with 1,000+ reviews. Related: "subtitles downloader" 39/19, "opensubtitles" 28/19, "subtitles editor" 26/14, "subtitles for youtube" 21/17. Undated. — [ASOTools: subtitles](https://asotools.io/app-store-keywords/subtitles)
- ASOTools states its Google Play "volume" reflects search popularity on google.com, not Play. — [ASOTools via search summary](https://asotools.io/app-store-keywords/subtitles)
- Practitioner guidance: autocomplete suggestions "are based on actual user behavior". Google Play gives no exact volume; tools such as AppTweak and MobileAction give only approximations. — [Phiture, Jun 17 2025](https://phiture.com/asostack/google-play-store-keywords-how-to-find/)

### Inferences
- "captions app" sits behind only "captain d's app" at "capt", ahead of a game. "subtitles for videos" is the first real term after "subt". Together these are the best evidence that the two core phrasings carry meaningful Play traffic.
- "auto captions" does not surface until "auto cap", because authenticator and auto clicker own "aut". It is still Play's top completion of its own stem and the strongest-growing term on Google, so it remains the best head keyword.
- "caption app" (singular) beats "captions app" on YouTube search (68.2 vs 26.4 worldwide), but its Play completions skew to "bangla" and photo use. The plural "captions app" is the cleaner Play target.
- "capcut captions" has substantial interest (US 28.5, comparable to "auto captions"). That is demand Wordburn cannot target by name, but it signals users who want CapCut-style auto captions, a substitution story for the description copy without naming CapCut.
- "ai captions" leads one worldwide web batch (37.6). Its Play completions include "ai caption for photo", though, so a share of that interest is text-caption writing, not video.

### Gaps
- Google Trends has no Play Store property. No source maps web or YouTube interest to Play search share.
- The ASOTools figures are undated, their methodology is undisclosed, and only "caption" and "subtitles" pages exist publicly. "auto captions", "captions" and "add subtitles to video" have no public page found.
- AppTweak, Sensor Tower, AppFigures, MobileAction and ASOdesk popularity scores for these terms are behind logins. None were found published in articles.

---

## Difficulty evidence: how entrenched the top-ranked apps are

### Takeaway
The caption head terms are a closed shop of about ten specialist apps, recurring across nearly every query:
- 0.35–5.9M installs and 8k–92k ratings each.
- All in Video Players & Editors.
- Mostly released 2018–2024.

The few weak slots are filled by recently released clones. That shows Play will rank a new, low-install app in the bottom half of the top 10 on relevance, but rarely in the top 3 of a head term.

### Cited Findings
Most frequent incumbents. The count is the number of the 46 pulled queries where the app ranks in the top 5. Install counts are exact Play figures, 2026-10-02.

| App | Package | Top-5 appearances | Installs | Ratings | Score | Released |
|---|---|---|---|---|---|---|
| Captions AI: Videos Subtitles (Pixster Studio) | [com.pixsterstudio.captions](https://play.google.com/store/apps/details?id=com.pixsterstudio.captions) | 31 | 2,759,682 | 92k | 4.7 | Sep 2023 |
| Captions Lite (developer "Captions", the category leader's Android app) | [com.nocap.captions](https://play.google.com/store/apps/details?id=com.nocap.captions) | 31 | 4,473,135 | 19k | 4.2 | Mar 2024 |
| Captions AI - Auto Captions | [captions.ai.videoeditor](https://play.google.com/store/apps/details?id=captions.ai.videoeditor) | 20 | 349,631 | 10k | 5.0 | **Dec 26, 2025** |
| Captions for Videos - SUBCAP (SubCap) | [com.ratel.subcap](https://play.google.com/store/apps/details?id=com.ratel.subcap) | 18 | 405,612 | 8k | 4.4 | Mar 2022 |
| AI Captions (quso) | [ai.quso.app](https://play.google.com/store/apps/details?id=ai.quso.app) | 9 | 467,745 | 21k | 4.6 | Mar 2025 |
| Dubs: Captions for Videos | [com.captionsai](https://play.google.com/store/apps/details?id=com.captionsai) | 8 | 2,572,227 | 32k | 4.3 | Oct 2023 |
| AutoCap Captions Teleprompter | [com.laika.kinetictypovid](https://play.google.com/store/apps/details?id=com.laika.kinetictypovid) | 7 | 2,244,151 | 22k | 4.4 | Jun 2018 |
| Zeemo: AI Video&Auto Captions | [cn.bluepulse.caption](https://play.google.com/store/apps/details?id=cn.bluepulse.caption) | 7 | 5,873,723 | 36k | 3.9 | Sep 2019 |
| Captiono: AI Subtitles | [ai.captiono.app](https://play.google.com/store/apps/details?id=ai.captiono.app) | 4 | 1,814,759 | 23k | 4.7 | Aug 2024 |
| Video Subtitle Generator | [amer.alomari.ArabicVideoSubtitleGenerator](https://play.google.com/store/apps/details?id=amer.alomari.ArabicVideoSubtitleGenerator) | 3 | 1,568,340 | 47k | 4.4 | Jan 2022 |
| AI Auto Captions & Subtitles (Kaptioned) | [kaptioned.app](https://play.google.com/store/apps/details?id=kaptioned.app) | 2 | 861,307 | 8k | 3.9 | Jun 2020 |
| Add Subtitles – Voicella | [org.antipu.autocaptions](https://play.google.com/store/apps/details?id=org.antipu.autocaptions) | (#8 for "subtitles for reels") | 637,303 | 8k | — | — |

Further observations:
- Larger general editors and creator apps appear on broader terms. Mojo: Reels and Video Captions has 19.0M installs and 243k ratings ([video.mojo](https://play.google.com/store/apps/details?id=video.mojo)). BIGVU Teleprompter & Captions has 9.8M ([bigvu.com.reporter](https://play.google.com/store/apps/details?id=bigvu.com.reporter)). Vozo AI Video Translator & Dub has 4.7M ([com.vistring.blink.android](https://play.google.com/store/apps/details?id=com.vistring.blink.android)). On "tiktok captions" and "text on video", CapCut (2.0B installs, [com.lemon.lvoverseas](https://play.google.com/store/apps/details?id=com.lemon.lvoverseas)) and InShot (957M) appear. — [Play search: tiktok captions](https://play.google.com/store/search?q=tiktok%20captions&c=apps&hl=en&gl=US); [text on video](https://play.google.com/store/search?q=text%20on%20video&c=apps&hl=en&gl=US)
- **Submagic does not appear** in any of the 46 top-10 lists, and no Submagic Android app surfaced. — Play searches above
- **Recent low-install entrants that already rank on caption terms**:
  - "Captions AI - Video Subtitles" ([com.ai.captionsgenerator](https://play.google.com/store/apps/details?id=com.ai.captionsgenerator)): released Apr 3, 2026, 72k installs, **1.6★**. #4 for "captions", #3 for "captions app", #4 for "captions ai".
  - "Vexo: AI Subtitle Editor": released Feb 2026, 7k installs. #4 for "subtitle maker".
  - "AI Subtitles & Captions Maker": released Aug 1, 2026, **137 installs**. #5 for "caption maker".
  - "Word Captions: AI Subtitles": 4k installs. **#1** for "word by word captions".
  - "CapFlow: Captions & Subtitles": released Jul 28, 2026, 18k installs. #1 for "karaoke captions", #6 for "animated captions".
  - "Subtightl - Auto Captions": released May 21, 2026, 898 installs. #10 for "auto captions".
  - "Auto Captions & Text: KineCut": released Apr 2026, 9k installs. #10 for "auto caption".
  - "IBURN: Add Subtitles to Video": released Jul 26, 2026, 782 installs. #1 for "burn subtitles to video".
  - Sources: Play searches for [captions](https://play.google.com/store/search?q=captions&c=apps&hl=en&gl=US), [subtitle maker](https://play.google.com/store/search?q=subtitle%20maker&c=apps&hl=en&gl=US), [caption maker](https://play.google.com/store/search?q=caption%20maker&c=apps&hl=en&gl=US), [word by word captions](https://play.google.com/store/search?q=word%20by%20word%20captions&c=apps&hl=en&gl=US), [karaoke captions](https://play.google.com/store/search?q=karaoke%20captions&c=apps&hl=en&gl=US), [auto captions](https://play.google.com/store/search?q=auto%20captions&c=apps&hl=en&gl=US), [burn subtitles to video](https://play.google.com/store/search?q=burn%20subtitles%20to%20video&c=apps&hl=en&gl=US)
- **Easiest observed SERPs** (most of the top 10 under 100k installs):
  - "subtitle editor": median 7k; top app "Android Subtitle Editor" 76k, 3.0★.
  - "srt generator": median 5k.
  - "subtitle maker srt": median 2k.
  - "srt subtitle": median 9k.
  - "transcribe video": median 50k; 7 of 10 under 100k.
  - "burn subtitles to video": median 32k.
  - Sources: [subtitle editor](https://play.google.com/store/search?q=subtitle%20editor&c=apps&hl=en&gl=US), [srt generator](https://play.google.com/store/search?q=srt%20generator&c=apps&hl=en&gl=US), [transcribe video](https://play.google.com/store/search?q=transcribe%20video&c=apps&hl=en&gl=US)
- **Hardest SERPs** (no top-10 app under 100k):
  - "video captions": median 2.8M.
  - "captions for videos": median 2.6M.
  - "auto captions for videos", "video caption generator" and "caption generator for video": median 2.6M each.
  - "caption maker for videos": median 2.8M.
  - "caption video editor": median 4.7M.
  - "tiktok captions": median 19M.
  - "text on video": median 144M.
  - Source: Play searches as linked in the ranked list.
- ASOTools grades "caption" at difficulty 56 and "subtitles" at 23 (scale and date undisclosed). — [ASOTools caption](https://asotools.io/app-store-keywords/caption); [ASOTools subtitles](https://asotools.io/app-store-keywords/subtitles)

### Inferences
- Several apps titled almost entirely in keywords ("Captions AI - Auto Captions", "Captions AI - Video Subtitles") reach the top 5 within months of release with modest installs. On these terms Play weights exact-match title text heavily. Wordburn's brand-first title gives up some of that exact-match weight. ASO.md's alternative, "Wordburn: Auto Captions, Clips", would add "auto captions" but carries the now-removed "clips".
- A 1.6★ app holding #3–#4 on "captions app" shows that rating quality is not gatekeeping these head positions. Relevance and title match are doing most of the work, which leaves room for a well-titled newcomer in slots 4–10.
- Three of the user-named competitors are firmly entrenched on Play: Captions (as "Captions Lite"), Zeemo and AutoCap. SubCap is mid-sized at 406k installs. Submagic is effectively absent on Android, so there is no Submagic incumbent to displace.

### Gaps
- Ranking positions were taken once, from one US anonymous session. Day-to-day volatility was not measured.
- Install velocity, ratings velocity and conversion rates of incumbents are not observable here; these weigh heavily in Play ranking.
- No list of the apps' own targeted keywords was compiled. A parallel note in this folder, `competitor_keywords.md`, may cover it.

---

## Singular vs plural and spelling variants: does Play stem or match them?

### Takeaway
Play partly conflates singular and plural. "auto caption"/"auto captions", "subtitle"/"subtitles" and "caption app"/"captions app" share 9 of 10 results. Bare "caption" vs "captions" shares only 6. "captions" vs "subtitles" shares just 3 of 10, so the two are different keywords and both must appear in metadata.

### Cited Findings
Measured overlap of top-10 result sets, Play US, 2026-10-02 (sources: Play search pages linked in the ranked list):

| Pair | Overlap |
|---|---|
| auto caption / auto captions | 9 of 10 |
| subtitle / subtitles | 9 of 10 |
| caption app / captions app | 9 of 10 |
| auto captions / auto subtitles | 9 of 10 |
| caption / captions | 6 of 10 |
| captions for videos / subtitles for videos | 6 of 10 |
| caption generator / subtitle generator | 5 of 10 |
| caption maker / subtitle maker | 5 of 10 |
| tiktok captions / reels captions | 5 of 10 |
| captions / subtitles | 3 of 10 |

Further findings:
- Within those overlaps the order differs. For example, "Captions AI - Auto Captions" is #1 for "auto caption" but #4 for "auto subtitles". "Video Subtitle Generator" is #1 for "subtitles for videos" and absent from "captions for videos". — Play searches as above
- AppTweak studied 100 singular/plural pairs across the US, France and Spain. On average 5.6 of 10 apps rank in the top 10 for both forms on Google Play, against 4.4 on iOS; Google's algorithm shows more similar results. Its advice is to research both forms independently and target both where the rankings differ. — [AppTweak](https://www.apptweak.com/en/aso-blog/do-singular-or-plural-keywords-rank-differently-in-aso)
- MobileAction: targeting the singular likely brings some plural ranking, but not near the top unless the plural is targeted directly. — [MobileAction](https://www.mobileaction.co/blog/singular-or-plural-keywords-aso/)
- Play's own autocomplete strongly prefers the plural: "caption" → "captions" first; "subtitle" → "subtitles for videos" first; "animated caption" → "animated captions"; "video caption" → "video captions". The singular survives only in "caption app", "caption maker", "caption generator" and "subtitle generator/maker/editor". — Play autocomplete, 2026-10-02, via [google-play-scraper](https://github.com/facundoolano/google-play-scraper)

### Inferences
- Use plurals for the core nouns: "captions", "subtitles". Singular forms appear naturally in compounds ("caption styles", "subtitle editor", "subtitle maker"). Play's 9/10 overlap on the main pairs means one form largely covers the other.
- "Captions" and "subtitles" are not interchangeable to Play, with only 30% overlap. The live title "Subtitles & Captions" covering both is correct. The ASO.md draft name ("Captions & Clips") would drop "subtitles" from the most-weighted field.
- Hyphenation ("word-by-word") and "subtitle"/"sub" spellings were not tested. Play's suggestions use "word by word" without hyphens.

### Gaps
- No test of hyphenated vs spaced forms ("word-by-word" vs "word by word"), "auto-captions" vs "auto captions", or US vs UK spelling. The listing uses "colour", which is UK spelling, though no caption keyword depends on it.
- No first-party Google statement on stemming in Play search was found.

---

## Intent match vs mismatched-intent traps

### Takeaway
The creator-video intent Wordburn serves sits in a narrow band: "captions/subtitles **for videos**", "auto captions", "add subtitles to video", and caption styling. Five large neighbouring intents share the same words and should be avoided as targets: movie-subtitle downloaders, Instagram text-caption writers, live/call captioning for deaf users, karaoke singing, and Quran word-by-word study.

### Cited Findings
**Match (creator burning captions into short video):**
- auto captions; captions app; captions for videos; add subtitles/captions to video(s); subtitles for videos; auto subtitles; video caption generator; caption maker for videos; animated captions; captions for talking videos; burn subtitles to video; word by word captions. For the head and mid terms in this list, 9–10 of the top 10 are Video Players & Editors caption apps. The long-tail SERPs are more mixed: "word by word captions" has 7 of 10, and "burn subtitles to video" has 5 of 10, alongside subtitle downloaders and converters. — Play searches linked above

**Traps:**

| Term | What users want | Evidence |
|---|---|---|
| **"subtitle" / "subtitles"** (bare), "subtitle downloader", "subtitles for movies", "subtitles viewer", "opensubtitles" | Movie/TV subtitle downloaders | #1–#4 for "subtitle" are downloaders ("Subtitle Downloader" 1.6M, "Subtitles - Movies & TV Series" 1.4M); "subtitles for movies" is 100% downloaders/players. — [subtitle](https://play.google.com/store/search?q=subtitle&c=apps&hl=en&gl=US); [subtitles for movies](https://play.google.com/store/search?q=subtitles%20for%20movies&c=apps&hl=en&gl=US); [ASOTools subtitles](https://asotools.io/app-store-keywords/subtitles) |
| **"subtitle translator", "video subtitle translator"** | Translation (Wordburn does not translate) | Both are autocomplete suggestions — Play autocomplete via [google-play-scraper](https://github.com/facundoolano/google-play-scraper) |
| **"caption" (bare), "instagram captions", "caption ideas", "captions for photos", "ai caption for photo", "caption for instagram", "tiktok caption copy app"** | Text captions/quotes for posts | "instagram captions" top 10 is text-caption apps; "caption ideas" is quote apps (6.2M-install quotes app); ASOTools' top "caption" long-tails are "caption for instagram" and "caption for insta". — [instagram captions](https://play.google.com/store/search?q=instagram%20captions&c=apps&hl=en&gl=US); [caption ideas](https://play.google.com/store/search?q=caption%20ideas&c=apps&hl=en&gl=US); [ASOTools caption](https://asotools.io/app-store-keywords/caption) |
| **"closed captions", "live caption", "caption call app", "captioning", "caption america"** | Accessibility: live captions for calls/speech | Google Live Transcribe (3.25B installs), CaptionCall (968k), InnoCaption (1.1M) and Live Caption & Translation (210k) all rank. — [live caption](https://play.google.com/store/search?q=live%20caption&c=apps&hl=en&gl=US); [closed captions](https://play.google.com/store/search?q=closed%20captions&c=apps&hl=en&gl=US); [ASOTools caption](https://asotools.io/app-store-keywords/caption) |
| **"karaoke subtitles"** | Singing apps | Top 10 is entirely karaoke apps (StarMaker 641M, Smule 380M). — [karaoke subtitles](https://play.google.com/store/search?q=karaoke%20subtitles&c=apps&hl=en&gl=US) |
| **"word by word"** (without "captions") | Quran study apps | All four top suggestions are Quran apps. — Play autocomplete |
| **"text on video", "add text to video"** | Manual text overlay in general editors | Median top-10 installs 144M (InShot, CapCut, VN, PowerDirector). — [text on video](https://play.google.com/store/search?q=text%20on%20video&c=apps&hl=en&gl=US) |
| **"transcribe video", "speech to text video", "video to text"** | Transcript text | Productivity/transcription apps (Transkriptor 9.3M, Otter 7.1M). — [speech to text video](https://play.google.com/store/search?q=speech%20to%20text%20video&c=apps&hl=en&gl=US) |
| **"captions with emoji"** | Emoji keyboards | — [captions with emoji](https://play.google.com/store/search?q=captions%20with%20emoji&c=apps&hl=en&gl=US) |
| **"srt"** (bare) | Bus tracker, games | — Play autocomplete |
| **Brand/navigational**: "captions ai", "captions lite", "autocap", "captiono", "add subtitles voicella", "dubs captions for videos", "veed captions for videos", "vmake ai captions video editor", "capcut", "hormozi" | Users looking for a specific app or person | All appear as autocomplete suggestions. — Play autocomplete |
| **Regional**: "caption apps bangla", "captions app bangla", "auto caption hindi", "tiktok caption app bangla" | South Asian language intent | All appear in US English autocomplete, which shows a large Bangladeshi/Indian user base typing English queries. "Captions" stays a valid term for Wordburn, but these completions do not fit (Bangla/Hindi not supported). — Play autocomplete |

Platform-name terms: "tiktok captions", "reels captions" and "shorts captions" match Wordburn's use case. ASO.md already rules out naming TikTok, Reels or Shorts because of Play's metadata policy on other brands' names. That policy point comes from the repo's ASO.md and was not re-verified in this research.

### Inferences
- "captions" (bare) is a net-positive head term despite the photo-caption trap. Seven or eight of its top 10 are video caption apps, and autocomplete steers to "captions app" / "captions ai". Bare "subtitle(s)" is mostly a downloader trap. The safe phrasing is "subtitles for videos" / "add subtitles to videos".
- "Translator" variants are a trap that could also hurt ratings if users install expecting translation. The listing's existing line "Wordburn does not translate" is a sensible guard.
- "karaoke" and "word by word" are only safe as compounds with "captions" ("karaoke captions", "word-by-word captions"). Alone, each drags in a large unrelated SERP.
- "transcribe video" is the largest adjacent term on Google Trends (US 48.9 vs auto captions 37.4 in batch 2), with a weak Play top 10 (median 50k). It is the one mismatched-intent term worth a secondary mention in the full description ("export a transcript as .srt"). It should not be a primary target, because the users want text, not burned-in captions.

### Gaps
- Conversion or retention outcomes for apps that target trap terms could not be observed.
- Play's metadata policy text on third-party brand names was not fetched in this pass; another researcher's `play_indexing_mechanics.md` in this folder may cover it.
