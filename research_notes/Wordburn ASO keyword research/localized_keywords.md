# Localized caption-app keywords on Google Play: es, de, fr, it, pt (BR/PT), nl, pl, id

**Method and how far to trust it.** Collected on 2026-10-02 from three primary sources. Nothing here comes from a paid ASO tool, so there are **no search-volume numbers**.

1. **Google Play web search.** Logged out and non-personalized, using `hl`/`gl` URL parameters. 46 queries, top 12 apps each. The pattern is `https://play.google.com/store/search?q=<term>&c=apps&hl=<lang>&gl=<COUNTRY>`.
   - The ranking can differ from in-app search on a phone in that country, because of personalization and IP-based localization.
   - In the bare `captions` queries for es-ES and fr-FR, the scraped title/package pairs were shifted by one card. For those two queries only the titles are used, not the positions per package.
2. **Localized Play listing pages for 15 caption apps × 10 locales.** The pattern is `https://play.google.com/store/apps/details?id=<pkg>&hl=<lang>&gl=<COUNTRY>`. These pages give the title as the H1 and the short description as `og:description`. This was checked on SubCap's de-DE page: `og:description` is the 80-character short description, not the opening of the full description.
3. **Google web and YouTube autocomplete per locale**, from `https://suggestqueries.google.com/complete/search?client=firefox&hl=<lang>&gl=<cc>&q=<term>`, with `&ds=yt` added for YouTube.
   - Autocomplete shows that people **type** a phrase, and the order of suggestions loosely tracks popularity. It is not a volume number, and it is web/YouTube search, not Play search.

Google Trends could not be queried (no API access from this environment). See Gaps.

---

## 1. Native terms per language: which variants dominate, and is the English word used?

### Takeaway
- Every one of the eight languages has one clear native head term. Each reads best in its "automatic" form, and the bare noun is polluted by other intents (movie subtitles, TV settings, photo captions):
  - es: **subtítulos automáticos**
  - de: **automatische Untertitel**
  - fr: **sous-titres automatiques** / **sous-titre automatique**
  - it: **sottotitoli automatici**
  - pt: **legenda(s) automática(s)**
  - nl: **automatische ondertiteling**
  - pl: **automatyczne napisy**
  - id: **subtitle otomatis**
- The English word "captions" is searched in every market, but almost entirely as the **brand "Captions (AI)"** or as "what does captions mean". It is not used as a generic term.
- Indonesian and Dutch are the exceptions:
  - Indonesian uses the English loanword **"subtitle"** natively, and "caption" there mostly means social-post text.
  - Dutch users type English **"subtitles"** next to "ondertiteling".

### Cited Findings

**Spanish (es-ES / es-MX)**
- Typing "subtitulos" in es-ES autocompletes to "subtitulos automaticos" as the third suggestion. The others are movie/language intents ("subtitulos en español", "subtitulos descargar", "subtitulos series") — [Google autocomplete es-ES "subtitulos"](https://suggestqueries.google.com/complete/search?client=firefox&hl=es&gl=es&q=subtitulos)
- "subtítulos automáticos" expands to "…gratis", "…en español", "…capcut", "…gratis sin marca de agua", "…android" and, on YouTube, "…tiktok" — [Google autocomplete es-ES](https://suggestqueries.google.com/complete/search?client=firefox&hl=es&gl=es&q=subt%C3%ADtulos%20autom%C3%A1ticos)
- App-intent phrasings that appear verbatim on es-ES and es-MX YouTube:
  - "app para subtitulos automaticos"
  - "app para subtitulos automaticos android"
  - "app para agregar subtitulos a videos"
  - "aplicacion para poner subtitulos a videos"

  Source: [YouTube autocomplete es-ES "app para subtitulos"](https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&hl=es&gl=es&q=app%20para%20subtitulos)
- "poner subtitulos" completes to "a un video", "en tiktok", "en capcut" and "en instagram". es-MX "como poner subtitulos" leads with "en tiktok" — [Google autocomplete es-MX](https://suggestqueries.google.com/complete/search?client=firefox&hl=es&gl=mx&q=como%20poner%20subtitulos)
- "subtitulos animados" is an established style query ("…capcut", "…gratis", "…automaticos") — [Google autocomplete es-ES](https://suggestqueries.google.com/complete/search?client=firefox&hl=es&gl=es&q=subtitulos%20animados)
- Spanish "captions" completes to "captions ai", "captions que es", "captions en español", "captions traduccion" and "captions app". It is the brand, or a word people need explained — [Google autocomplete es-ES "captions"](https://suggestqueries.google.com/complete/search?client=firefox&hl=es&gl=es&q=captions)
- "poner letras a videos" (Mexican colloquial) returns generic text-on-video editors (InShot, Canva, VivaVideo) on Play, not caption apps — [Play search es-MX](https://play.google.com/store/search?q=poner+letras+a+videos&c=apps&hl=es&gl=MX)

**German (de-DE)**
- The bare "untertitel" query is dominated by consumer settings: "untertitel ausschalten", "…ausschalten handy" and "…samsung". "untertitel erstellen" is the creator variant — [Google autocomplete de-DE](https://suggestqueries.google.com/complete/search?client=firefox&hl=de&gl=de&q=untertitel)
- The top completion of "automatische untertitel" is "…ausschalten" (switch off). Creator variants follow: "…erstellen", "…instagram", "…capcut", "…android" — [Google autocomplete de-DE](https://suggestqueries.google.com/complete/search?client=firefox&hl=de&gl=de&q=automatische%20untertitel)
- Creator phrasings:
  - "untertitel für video erstellen (kostenlos)"
  - "untertitel für videos automatisch erstellen"
  - "untertitel für instagram reels"
  - "untertitel für reels erstellen" (YouTube)

  Source: [Google autocomplete de-DE "untertitel für"](https://suggestqueries.google.com/complete/search?client=firefox&hl=de&gl=de&q=untertitel%20f%C3%BCr)
- "untertitel generator" expands to "…kostenlos", "…ai", "ki untertitel generator" and "auto untertitel generator". **KI** is the German AI term — [Google autocomplete de-DE](https://suggestqueries.google.com/complete/search?client=firefox&hl=de&gl=de&q=untertitel%20generator)
- "untertitel tiktok" covers both "…erstellen" / "…hinzufügen" (creator) and "…einschalten" / "…ausschalten" (viewer) — [Google autocomplete de-DE](https://suggestqueries.google.com/complete/search?client=firefox&hl=de&gl=de&q=untertitel%20tiktok)
- German "captions" completes to "captions deutsch", "captions bedeutung" (meaning), "captions app" and "captions app kosten". This is brand plus definition intent — [Google autocomplete de-DE "captions"](https://suggestqueries.google.com/complete/search?client=firefox&hl=de&gl=de&q=captions)

**French (fr-FR)**
- "sous titre" expands to "sous titre automatique", "…automatique gratuit", "…video", "…tiktok" and "…capcut" — [Google autocomplete fr-FR](https://suggestqueries.google.com/complete/search?client=firefox&hl=fr&gl=fr&q=sous%20titre)
- App intent: "application sous titre video", "application sous titre automatique", "application sous titre automatique gratuit" and, on YouTube, "application pour sous titrer une video" — [Google autocomplete fr-FR](https://suggestqueries.google.com/complete/search?client=firefox&hl=fr&gl=fr&q=application%20sous%20titre)
- "mettre des sous titres sur une vidéo" is the how-to phrasing — [Google autocomplete fr-FR](https://suggestqueries.google.com/complete/search?client=firefox&hl=fr&gl=fr&q=mettre%20des%20sous%20titres)
- "sous titre tiktok" expands to "…automatique", "…ia" and "…ia gratuit" — [Google autocomplete fr-FR](https://suggestqueries.google.com/complete/search?client=firefox&hl=fr&gl=fr&q=sous%20titre%20tiktok)
- On YouTube, "sous titre dynamique premiere pro" appears. "Dynamique" is the French word for animated caption styles — [YouTube autocomplete fr-FR "sous titre"](https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&hl=fr&gl=fr&q=sous%20titre)
- French "captions" completes to "captions traduction", "captions def", "captions lite" and "captions app" — [Google autocomplete fr-FR "captions"](https://suggestqueries.google.com/complete/search?client=firefox&hl=fr&gl=fr&q=captions)

**Italian (it-IT)**
- The **first** completion of "sottotitoli" is "sottotitoli automatici", followed by "…automatici video" and "…automatici video gratis" — [Google autocomplete it-IT](https://suggestqueries.google.com/complete/search?client=firefox&hl=it&gl=it&q=sottotitoli)
- "app sottotitoli" expands to "…video", "…automatici", "…automatici gratis" and "…in tempo reale" (a live-captioning intent, not ours) — [Google autocomplete it-IT](https://suggestqueries.google.com/complete/search?client=firefox&hl=it&gl=it&q=app%20sottotitoli)
- How-to phrasing: "come mettere sottotitoli a un video", "…su tiktok", "…instagram" — [Google autocomplete it-IT](https://suggestqueries.google.com/complete/search?client=firefox&hl=it&gl=it&q=come%20mettere%20sottotitoli)
- Italian "captions" completes to "captions traduzione", "captions lite" and "captions app download" — [Google autocomplete it-IT "captions"](https://suggestqueries.google.com/complete/search?client=firefox&hl=it&gl=it&q=captions)

**Portuguese, Brazil (pt-BR)**
- Bare "legenda" is the wrong intent. It completes to "legenda para foto (sozinha)", "legendas para fotos instagram" and "legendarios" — [Google autocomplete pt-BR](https://suggestqueries.google.com/complete/search?client=firefox&hl=pt&gl=br&q=legenda)
- "legenda automática" expands to "…grátis", "…vídeo", "…capcut", "…instagram stories" and "…no canva" — [Google autocomplete pt-BR](https://suggestqueries.google.com/complete/search?client=firefox&hl=pt&gl=br&q=legenda%20autom%C3%A1tica)
- App intent:
  - "app de legenda automatica (grátis)"
  - "app de legendar video"
  - "aplicativo para legendar videos (automaticamente grátis)"
  - "app de colocar legenda em video" (YouTube)

  Sources: [Google autocomplete pt-BR "app de legenda"](https://suggestqueries.google.com/complete/search?client=firefox&hl=pt&gl=br&q=app%20de%20legenda); [pt-BR "aplicativo para legendar"](https://suggestqueries.google.com/complete/search?client=firefox&hl=pt&gl=br&q=aplicativo%20para%20legendar)
- How-to: "como colocar legenda em video", "…no capcut", "…no reels", "…no tiktok" — [Google autocomplete pt-BR](https://suggestqueries.google.com/complete/search?client=firefox&hl=pt&gl=br&q=como%20colocar%20legenda)
- "legendas animadas" is a style query ("…capcut", "…para videos", "…online") — [Google autocomplete pt-BR](https://suggestqueries.google.com/complete/search?client=firefox&hl=pt&gl=br&q=legendas%20animadas)
- The Captions brand is better known in Brazil than elsewhere. YouTube completions include "captions como usar", "captions vale a pena", "captions vs capcut" and "captions de graca" — [YouTube autocomplete pt-BR "captions"](https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&hl=pt&gl=br&q=captions)

**Portuguese, Portugal (pt-PT)**
- "legendas automáticas" expands to "…grátis", "…instagram", "…online"; "app legendas automaticas (gratis)"; "app legendas dinamicas". YouTube adds "legendas dinamicas capcut" — [Google autocomplete pt-PT](https://suggestqueries.google.com/complete/search?client=firefox&hl=pt&gl=pt&q=app%20legendas)
- Bare "legendas" in pt-PT is dominated by "legendasdivx" (a movie-subtitle site) and "legendas para fotos instagram" — [Google autocomplete pt-PT](https://suggestqueries.google.com/complete/search?client=firefox&hl=pt&gl=pt&q=legendas)

**Dutch (nl-NL)**
- "ondertiteling" is almost entirely TV and streaming settings: "ondertiteling tv", "…videoland", "…uitzetten", "…netflix", "…kpn" — [Google autocomplete nl-NL](https://suggestqueries.google.com/complete/search?client=firefox&hl=nl&gl=nl&q=ondertiteling)
- The first completion of "automatische ondertiteling" is "…youtube uitzetten" (switch off). Creator variants follow: "…premiere pro", "…instagram", "…canva", "…gratis", "…tiktok" — [Google autocomplete nl-NL](https://suggestqueries.google.com/complete/search?client=firefox&hl=nl&gl=nl&q=automatische%20ondertiteling)
- "ondertitels" expands to "ondertitels toevoegen aan video" (creator) and "ondertitels vertalen" — [Google autocomplete nl-NL](https://suggestqueries.google.com/complete/search?client=firefox&hl=nl&gl=nl&q=ondertitels)
- The English "subtitles" is typed in the Netherlands: "subtitles nederlands", "subtitles nl", "subtitles generator", "subtitles premiere pro", "subtitles capcut" — [Google autocomplete nl-NL "subtitles"](https://suggestqueries.google.com/complete/search?client=firefox&hl=nl&gl=nl&q=subtitles)
- Dutch "captions" completes to "captions betekenis" (meaning), "captions instagram", "captions tiktok" and "captions vertaling" — [Google autocomplete nl-NL "captions"](https://suggestqueries.google.com/complete/search?client=firefox&hl=nl&gl=nl&q=captions)
- YouTube returned almost nothing for Dutch app-intent seeds:
  - "ondertiteling app": empty
  - "ondertiteling tiktok": empty
  - "automatische ondertiteling": only "…premiere pro"

  This is a sign of low query volume in Dutch — [YouTube autocomplete nl-NL](https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&hl=nl&gl=nl&q=ondertiteling%20app)

**Polish (pl-PL)**
- Bare "napisy" means signs and inscriptions in general: "napisy24" (a movie-subtitle site), "napisy na pomnik" (gravestone), "napisy na tort" (cake), "napisy led". On YouTube it means "napisy końcowe" (end credits) — [Google autocomplete pl-PL](https://suggestqueries.google.com/complete/search?client=firefox&hl=pl&gl=pl&q=napisy)
- "automatyczne napisy" expands to "…do filmów za darmo", "…do filmu", "…do filmów po polsku", "…tiktok" and "…instagram" — [Google autocomplete pl-PL](https://suggestqueries.google.com/complete/search?client=firefox&hl=pl&gl=pl&q=automatyczne%20napisy)
- How-to and app phrasings:
  - "jak dodać napisy do filmu na telefonie"
  - "jak dodać napisy do rolki" (rolka = Reel)
  - "jak dodać napisy do shorts"
  - "aplikacja do napisow w rolkach"
  - "aplikacja do dodawania napisów do filmu"

  Sources: [Google autocomplete pl-PL "jak dodać napisy"](https://suggestqueries.google.com/complete/search?client=firefox&hl=pl&gl=pl&q=jak%20doda%C4%87%20napisy); [pl-PL "aplikacja do napisów"](https://suggestqueries.google.com/complete/search?client=firefox&hl=pl&gl=pl&q=aplikacja%20do%20napis%C3%B3w)
- Polish "captions" completes to "captions po polsku", "captions co to" (what is it), "captions aplikacja" and "captions ai po polsku" — [Google autocomplete pl-PL "captions"](https://suggestqueries.google.com/complete/search?client=firefox&hl=pl&gl=pl&q=captions)

**Indonesian (id-ID)**
- "subtitle" is native usage. Its completions include "subtitle otomatis", "subtitle video otomatis gratis", "subtitle artinya apa" and "subtitle indonesia" — [Google autocomplete id-ID](https://suggestqueries.google.com/complete/search?client=firefox&hl=id&gl=id&q=subtitle)
- "subtitle otomatis" expands to "…gratis", "…video", "…di capcut", "…ai" and "…gratis tanpa watermark" — [Google autocomplete id-ID](https://suggestqueries.google.com/complete/search?client=firefox&hl=id&gl=id&q=subtitle%20otomatis)
- App intent:
  - "aplikasi subtitle video otomatis (gratis)"
  - "aplikasi subtitle video untuk android"
  - "aplikasi caption otomatis"
  - "aplikasi auto caption"
  - "aplikasi auto caption selain capcut" (= "other than CapCut")

  Sources: [Google autocomplete id-ID "aplikasi subtitle"](https://suggestqueries.google.com/complete/search?client=firefox&hl=id&gl=id&q=aplikasi%20subtitle); [YouTube "aplikasi caption"](https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&hl=id&gl=id&q=aplikasi%20caption)
- "teks otomatis" is a real variant, anchored on CapCut's Indonesian UI ("teks otomatis capcut", "…di capcut", "…di inshot", "…di vn") — [YouTube autocomplete id-ID](https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&hl=id&gl=id&q=teks%20otomatis)
- "caption otomatis" also exists ("…capcut", "…video", "…gratis", "ai caption otomatis") — [Google autocomplete id-ID](https://suggestqueries.google.com/complete/search?client=firefox&hl=id&gl=id&q=caption%20otomatis)
- "takarir" is the official Indonesian word for subtitle/caption (KBBI). In search it appears as "takarir adalah", "takarir kbbi" and anime fansubs ("takarir indonesia one punch man"), not as an app query — [Google autocomplete id-ID "takarir"](https://suggestqueries.google.com/complete/search?client=firefox&hl=id&gl=id&q=takarir)

### Inferences
- The highest-value native phrases for a caption app's title and short description are these. Each recurs across Play rankings and both autocomplete sources:
  - es: "subtítulos automáticos", "subtítulos para videos", "poner subtítulos"
  - de: "automatische Untertitel", "Untertitel für Videos", "Untertitel erstellen", "KI"
  - fr: "sous-titres automatiques", "sous-titres vidéo", "sous-titrer une vidéo"
  - it: "sottotitoli automatici", "sottotitoli video"
  - pt-BR: "legendas automáticas", "legenda para vídeo", "legendar vídeos", "colocar legenda"
  - pt-PT: "legendas automáticas", "legendas para vídeos"
  - nl: "automatische ondertiteling", "ondertitels toevoegen aan video", "video ondertitelen"
  - pl: "automatyczne napisy", "napisy do filmów", "dodać napisy"
  - id: "subtitle otomatis", "teks otomatis", "caption otomatis", "auto caption"
- Several qualifiers recur in every market, but they **conflict with Wordburn's watermark and the ASO.md rule against "free"**:
  - "gratis/gratuit/kostenlos/za darmo"
  - "sin marca de agua"
  - "tanpa watermark"

  They should not go in metadata, even though they are frequent (inference from autocomplete frequency and ASO.md).
- "Animated captions" has a native form in es ("subtítulos animados"), pt ("legendas animadas"), fr ("sous-titres dynamiques") and pt-PT ("legendas dinâmicas"). These suit Wordburn's 18 styles in the full description.
- Platform words (tiktok, reels/rolki, instagram) are attached to most phrases. ASO.md already rules out other brands' names, but the generic Polish "rolki" / Spanish "reels" are a judgement call. Inference, not checked against Play policy.

### Gaps
- No absolute or relative search volumes. Autocomplete order is a weak proxy and is web/YouTube search, not Play search.
- Not checked: whether Spanish users type accented "subtítulos" or unaccented "subtitulos" in Play search. Both appear in autocomplete. Play search appears accent-insensitive (both returned near-identical lists), but this is observed, not documented.
- Brazilian and Mexican colloquial terms beyond those tested ("letreiro", "textinho") were not explored.

---

## 2. How competing caption apps localize their Play titles and short descriptions

### Takeaway
- The two biggest pure-caption brands (Captions' own "Captions Lite" and AutoCap) **keep English titles everywhere** and localize only the short description.
- Zeemo, SubCap, Voicella and CapFlow **localize the title** around the native head noun (Untertitel / Sous-titres / Sottotitoli / Legendas / Subtítulos).
- Coverage is patchy. Dutch and Polish titles are left in English by Zeemo and SubCap, and several short descriptions are visibly machine-translated.
- Submagic did not appear in any of the 46 localized Play searches.

### Cited Findings
Titles below are H1 and short descriptions are `og:description`, both from the localized listing pages fetched 2026-10-02.

- **Captions Lite** (developer "Captions", 1M+; package com.nocap.captions; the official Captions brand on Android): the title "Captions Lite" is identical in all 10 locales. The short description is localized:
  - es: "Subtitula y edita tus vídeos con IA."
  - de: "Untertiteln und bearbeiten Sie Ihre Videos mit KI."
  - fr: "Sous-titrez et montez vos vidéos avec l'IA."
  - pt: "Legende e edite seus vídeos com IA."
  - nl: "Ondertitel en bewerk uw video's met AI."
  - pl: "Dodawaj napisy i edytuj swoje filmy za pomocą sztucznej inteligencji."
  - id: "Beri subtitle dan edit video Anda dengan AI."

  Sources: [es-ES](https://play.google.com/store/apps/details?id=com.nocap.captions&hl=es&gl=ES), [de-DE](https://play.google.com/store/apps/details?id=com.nocap.captions&hl=de&gl=DE), [id-ID](https://play.google.com/store/apps/details?id=com.nocap.captions&hl=id&gl=ID)
- **Zeemo** (Bluepulse INC., 5M+; cn.bluepulse.caption). The English title is "Zeemo: AI Video&Auto Captions". Localized titles:
  - es: "Zeemo: Vídeos IA y Subtítulos"
  - de: "Zeemo:KI Video & Untertitel"
  - fr: "Zeemo:Vidéos IA et Sous-titres"
  - it: "Zeemo: Video IA e Sottotitoli"
  - pt-BR/PT: "Zeemo: Vídeo IA e Legendas"
  - id: "Zeemo: Video AI & Subtitle"
  - **nl and pl keep the English title.** The short descriptions are localized in all of them (e.g. de "Zeemo: KI-Video- & Bildgenerator, Untertitel für virale Videos.")

  Sources: [de-DE](https://play.google.com/store/apps/details?id=cn.bluepulse.caption&hl=de&gl=DE), [nl-NL](https://play.google.com/store/apps/details?id=cn.bluepulse.caption&hl=nl&gl=NL), [pl-PL](https://play.google.com/store/apps/details?id=cn.bluepulse.caption&hl=pl&gl=PL)
- **AutoCap** (Firehawk, 1M+; com.laika.kinetictypovid): the title is "AutoCap Captions Teleprompter" in every locale. The short descriptions look machine-translated, because "captions and subtitles" collapses into one repeated word:
  - es: "Subtítulos y subtítulos de vídeo automáticos…"
  - fr: "Sous-titres et sous-titres vidéo automatiques…"
  - pt: "Legendas e legendas automáticas de vídeo…"
  - it: "Didascalie e sottotitoli video automatici…"
  - pl: "Automatyczne podpisy i napisy wideo…"
  - nl: "Automatische videobijschriften en ondertitels…"
  - id: "Teks dan Subtitle Video Otomatis…"

  Sources: [es-ES](https://play.google.com/store/apps/details?id=com.laika.kinetictypovid&hl=es&gl=ES), [pt-BR](https://play.google.com/store/apps/details?id=com.laika.kinetictypovid&hl=pt&gl=BR)
- **SubCap** (Ratel, 100K+; com.ratel.subcap). The English title is "Captions for Videos - SUBCAP". Localized titles:
  - es: "Subtítulos a los vídeos SUBCAP"
  - de: "Captions & Untertitel - SUBCAP" (keeps the English word next to the German one)
  - fr: "Sous titre Video - SUBCAP"
  - pt: "Subcap: Legendas para Vídeos"
  - **it, nl, pl and id keep the English title.**

  The short descriptions all lead with the native head term:
  - es: "Subtítulos automáticos. Traduce, personaliza fuentes…"
  - de: "Automatische Untertitel. Übersetzen…"
  - fr: "Sous-titres auto…"
  - it: "Sottotitoli automatici per i video…"
  - pt: "Legendas automáticas…"
  - nl: "Automatische ondertiteling voor video's…"
  - pl: "Automatyczne napisy do filmów…"
  - id: "Teks terjemahan otomatis untuk video…"

  Sources: [de-DE](https://play.google.com/store/apps/details?id=com.ratel.subcap&hl=de&gl=DE), [nl-NL](https://play.google.com/store/apps/details?id=com.ratel.subcap&hl=nl&gl=NL), [id-ID](https://play.google.com/store/apps/details?id=com.ratel.subcap&hl=id&gl=ID)
- **CapFlow** (AZ Screen Recorder, 10K+). This is the most thoroughly localized listing seen, and the closest feature match to Wordburn (karaoke, SRT). Titles and short descriptions by locale:
  - es: "CapFlow: Subtítulos de vídeo" / "Pon subtítulos automáticos a tus vídeos: karaoke, SRT y sin marca de agua."
  - de: "CapFlow: Untertitel für Video" / "Untertitel für Videos: automatisch, Karaoke-Stil, SRT, ohne Wasserzeichen."
  - fr: "CapFlow: Sous-titres vidéo"
  - it: "CapFlow: Sottotitoli video"
  - pt: "CapFlow: Legendas em vídeo" / "Coloque legendas automáticas nos seus vídeos…"
  - nl: "CapFlow: Video ondertitelen"
  - pl: "CapFlow: Automatyczne napisy"
  - id: "CapFlow: Subtitle Otomatis" / "Tambahkan subtitle otomatis ke video…"

  Sources: [es-ES](https://play.google.com/store/apps/details?id=video.risenapps.video.subtitle.caption&hl=es&gl=ES), [nl-NL](https://play.google.com/store/apps/details?id=video.risenapps.video.subtitle.caption&hl=nl&gl=NL), [id-ID](https://play.google.com/store/apps/details?id=video.risenapps.video.subtitle.caption&hl=id&gl=ID)
- **"AI Auto Captions"** (AI Robots, 500K+; geeks.appz.autocaptions). Its title in each locale is an exact-match keyword with no brand:
  - es: "IA Subtítulos automáticos"
  - de: "Automatische KI-Untertitel"
  - fr: "Sous-titres automatiques IA"
  - it: "Sottotitoli automatici AI"
  - pt: "Legendas automáticas de IA"
  - nl: "automatische ondertiteling"
  - pl: "Automatyczne napisy AI"
  - id: "Teks Otomatis AI"

  Source: [it-IT](https://play.google.com/store/apps/details?id=geeks.appz.autocaptions&hl=it&gl=IT), [nl-NL](https://play.google.com/store/apps/details?id=geeks.appz.autocaptions&hl=nl&gl=NL)
- **Voicella** (500K+): the titles follow the pattern "<native subtitle noun> Video – Voicella" in es/de/fr/it/pt/id ("Subtítulos Video", "Untertitel Video", "Sous-titres vidéo", "Sottotitoli Video", "Legendas Vídeo", "Subtitle Video"). nl and pl stay "Add Subtitles – Voicella". Its short descriptions keep the English word "captions" inside native text: "Añade subtítulos y captions", "Untertitel & Auto-Captions hinzufügen", "Tambah subtitle & auto caption" — [es-ES](https://play.google.com/store/apps/details?id=org.antipu.autocaptions&hl=es&gl=ES), [id-ID](https://play.google.com/store/apps/details?id=org.antipu.autocaptions&hl=id&gl=ID)
- **Legenda.ai** (Skylar.ai, 100K+): the Portuguese title "Legenda.ai: Legenda automática" is shown in de, fr, it, nl, pl and id. es has its own title ("Legenda.ai: Subtítulos por IA") and en has "Automated Subtitle". The short descriptions are localized everywhere — [de-DE](https://play.google.com/store/apps/details?id=ai.skylar.skycap&hl=de&gl=DE)
- **Captions AI: Videos Subtitles** (Pixster Studio, 1M+). Native titles in de ("Captions Ai: Untertitel App"), it ("Captions AI: Video Sottotitoli"), nl ("…Video Ondertitels"), pl ("…Napisy Wideo") and id ("Captions Ai Tambahkan Subtitel"). **The es-ES page shows a Portuguese title and short description**: "Captions Ai: Legendas Espanhol", "Add spanish Caption | Gerar Ai legenda e hashtag…" — [es-ES](https://play.google.com/store/apps/details?id=com.pixsterstudio.captions&hl=es&gl=ES), [pl-PL](https://play.google.com/store/apps/details?id=com.pixsterstudio.captions&hl=pl&gl=PL)
- **Dubs: Captions for Videos** (1M+): English title everywhere. Its Indonesian short description uses the formal word **"Takarir"**: "Takarir & Caption untuk Video…". Its Spanish one uses "Leyendas y subtítulos", and its Italian one "Didascalie e sottotitoli" — [id-ID](https://play.google.com/store/apps/details?id=com.captionsai&hl=id&gl=ID), [es-ES](https://play.google.com/store/apps/details?id=com.captionsai&hl=es&gl=ES)
- **Captiono** (1M+): English title "Captiono: AI Subtitles" in all locales. The short description is localized ("Subtítulos de vídeo automáticos…", "Automatische Video-Untertitel…", "Subtitle Video Otomatis…") — [de-DE](https://play.google.com/store/apps/details?id=ai.captiono.app&hl=de&gl=DE)
- **Submagic** did not appear in the top 12 of any of the 46 localized Play searches, nor in the en-US "auto captions" search — [Play search en-US "auto captions"](https://play.google.com/store/search?q=auto%20captions&c=apps&hl=en&gl=US)

**Who ranks.** Rank positions are from logged-out Play web search:
- **Exact-match titles lead in thin markets.**
  - In it-IT, "Sottotitoli automatici AI" is #1 for "sottotitoli automatici", "sottotitoli video" and "sottotitoli" — [Play search it-IT](https://play.google.com/store/search?q=sottotitoli+automatici&c=apps&hl=it&gl=IT)
  - In nl-NL, "automatische ondertiteling" (same developer) is #1 for "automatische ondertiteling". Only four results are caption apps; positions 5–12 are unrelated games (Automatoys, reaction-time trainers) — [Play search nl-NL](https://play.google.com/store/search?q=automatische+ondertiteling&c=apps&hl=nl&gl=NL)
  - In pt-BR, "Legenda.ai: Legenda automática" is #1 for all four Portuguese caption queries tested, and #1 or #2 in pt-PT — [Play search pt-BR](https://play.google.com/store/search?q=legenda+autom%C3%A1tica&c=apps&hl=pt&gl=BR)
- In es-ES, "Subtítulos a los vídeos SUBCAP" is #1 or #2 for every Spanish query — [Play search es-ES](https://play.google.com/store/search?q=subt%C3%ADtulos+autom%C3%A1ticos&c=apps&hl=es&gl=ES)
- In fr-FR, "Sous titre Video - SUBCAP" is #1 for every French query tested — [Play search fr-FR](https://play.google.com/store/search?q=sous-titres+automatiques&c=apps&hl=fr&gl=FR)
- In de-DE, the top three for "untertitel" and "automatische untertitel" are Zeemo, Pixster and SubCap, all with "Untertitel" in the localized title — [Play search de-DE](https://play.google.com/store/search?q=automatische+untertitel&c=apps&hl=de&gl=DE)
- In id-ID, "caption video" and "caption otomatis" return caption apps with **English** titles at the top (Captions Lite, SUBCAP, Captions AI), while "subtitle otomatis" is led by a translation app — [Play search id-ID](https://play.google.com/store/search?q=caption+otomatis&c=apps&hl=id&gl=ID)

### Inferences
- The market's own experiment suggests that, in less-contested locales (it, nl, pt), the native head term in the title is what wins the head query. Apps carrying the exact native phrase in the title outrank bigger brands with English titles there, and the bigger brands can afford English titles because of install volume and brand searches (inference from rank observations).
- Few apps localize the title for nl and pl. Even "Captions"-branded apps left those titles English, so Dutch and Polish are the cheapest locales to own a title keyword in (inference).
- The machine-translation fingerprints suggest at least AutoCap and AI Auto Captions used automated translation: "Subtítulos y subtítulos", "legendas e legendas", Spanish "leyendas", Italian "didascalie", Polish "podpisy", Dutch "bijschriften". Those sense errors (see §5) are visible on the store (inference).

### Gaps
- Web pages do not reveal whether a localized short description is developer-provided or Google machine translation, so the attribution above is inference from wording.
- Install counts are global and per app; per-country installs or rankings were not available.
- Submagic's absence was checked only through search results, not by finding its package directly.

---

## 3. Relative popularity of variants per country (Trends and other evidence)

### Takeaway
- No Google Trends data was obtainable. Autocomplete ordering gives a consistent qualitative ranking:
  - The **"automatic" compound beats the bare noun** for creator intent in every language.
  - In **pt-BR** and **pl** the bare noun is dominated by unrelated meanings.
  - In **id**, "subtitle otomatis" leads, with "teks otomatis" (CapCut's term) and "caption otomatis" behind it.
- Market-size evidence favours Indonesia, Brazil and Mexico.

### Cited Findings
- Italian "sottotitoli" → first suggestion "sottotitoli automatici" — [Google autocomplete it-IT](https://suggestqueries.google.com/complete/search?client=firefox&hl=it&gl=it&q=sottotitoli)
- Spanish "subtitulos" → "subtitulos automaticos" in third place on web (es-ES and es-MX) — [Google autocomplete es-MX](https://suggestqueries.google.com/complete/search?client=firefox&hl=es&gl=mx&q=subtitulos)
- French "sous titre" → "sous titre automatique" second, after the plural — [Google autocomplete fr-FR](https://suggestqueries.google.com/complete/search?client=firefox&hl=fr&gl=fr&q=sous%20titre)
- Indonesian "subtitle" → "subtitle otomatis" fifth on web and "subtitle otomatis gratis" third on YouTube — [Google autocomplete id-ID](https://suggestqueries.google.com/complete/search?client=firefox&hl=id&gl=id&q=subtitle)
- Indonesian "teks otomatis" completions are CapCut/Canva/InShot/VN how-tos, so the term is tied to editors' feature labels — [YouTube autocomplete id-ID](https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&hl=id&gl=id&q=teks%20otomatis)
- YouTube autocomplete returned no suggestions for the Dutch "ondertiteling app" and "ondertiteling tiktok", and only one for "automatische ondertiteling". By contrast, the equivalent Spanish, Portuguese and Indonesian seeds returned up to 10 — [YouTube autocomplete nl-NL](https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&hl=nl&gl=nl&q=automatische%20ondertiteling)
- TikTok active users, per a DataReportal-derived aggregator: Indonesia 108M (#2 worldwide), Brazil 91.7M (#3), Mexico 85.4M (#4); Germany's TikTok ad audience is cited as 22.9M — [Castmagic, TikTok users by country 2025](https://www.castmagic.io/blog/tiktok-usage-by-country) (secondary source, not DataReportal itself)

### Inferences
Inferred rank of variants within each language, from autocomplete position and how often the phrase recurred across seeds (not measured volume):
- es: "subtítulos automáticos" > "poner subtítulos (a un video)" > "subtítulos para videos" > "app para subtítulos" > "subtítulos animados"
- de: "automatische Untertitel" > "Untertitel erstellen" > "Untertitel für Videos" > "Untertitel Generator / KI"
- fr: "sous-titre(s) automatique(s)" > "sous-titre vidéo" > "mettre des sous-titres" > "application sous-titre"
- it: "sottotitoli automatici" > "sottotitoli video" > "app sottotitoli"
- pt-BR: "legenda automática" > "colocar legenda em vídeo" > "app/aplicativo para legendar vídeos" > "legendas animadas"
- pt-PT: "legendas automáticas" > "app legendas automáticas"
- nl: "automatische ondertiteling" > "ondertitels toevoegen aan video" ≈ English "subtitles"
- pl: "automatyczne napisy (do filmów)" > "dodać napisy do filmu" > "napisy do filmów"
- id: "subtitle otomatis" > "teks otomatis" ≈ "caption otomatis" > "auto caption"

On demand alone, the order of priority would be roughly pt-BR, es (MX/LatAm plus ES) and id first, then de, fr, it and pl, with nl last. This combines the TikTok audience sizes with how rich the autocomplete was (inference).

### Gaps
- **Google Trends was not accessible** from this environment, and no published Trends comparison of these exact terms (2024–2026) was found. A manual Trends check per country is needed to quantify, e.g. "subtítulos automáticos" vs "poner subtítulos" in MX vs ES, or "subtitle otomatis" vs "teks otomatis" vs "caption otomatis" in ID.
- No Play-native volume data. AppTweak, MobileAction or Sensor Tower keyword volumes per locale would be needed.

---

## 4. How Google Play serves localized listings; whether an untranslated listing ranks; machine vs human translation

### Takeaway
- Play shows the localized listing that matches the user's **language preference**, and otherwise the default language. Users can opt into an on-the-fly machine translation, labelled as automatic.
- Google offers free **unreviewed** machine translation of listings in Console for a set of languages that includes French, German, Indonesian, Italian, pt-BR and Spanish. **It does not include Dutch, Polish or pt-PT.** Paid human translation is offered from about USD 0.07/word.
- Third-party ASO sources say each locale is indexed separately and English-only listings get "some impressions" through auto-translation, but fewer than researched native metadata. That claim is not confirmed by Google.

### Cited Findings
- "If a user's language preference matches the translation languages you've added, they'll see the translated version of your app." For other languages, users "can choose to view an automated translation of your app's page", with a notice and an option to revert to the default language — [Play Console Help: Translate and localize your app](https://support.google.com/googleplay/android-developer/answer/9844778)
- Google's free machine translation service for store listings: "As these are machine translations, they are not reviewed or approved by humans." The listed languages are Arabic, French, German, Indonesian, Italian, Japanese, Portuguese (Brazilian), Spanish variants and Thai — [Play Console Help](https://support.google.com/googleplay/android-developer/answer/9844778)
- Paid translation through Play's vendors "costs as little as USD 0.07 per word, and translations are completed within seven days" — [Play Console Help](https://support.google.com/googleplay/android-developer/answer/9844778)
- "Google's auto-translation applies to keywords as well, allowing the app to appear in search results in other languages even if there's no metadata manually translated to those languages." Users see the default locale "if their device language or region does not match any of the app's localized versions". Automatic translations "might be unreliable and negatively affect conversion rates." The same source reports localization lifting impressions 35% on average, and Spanish +73%, in one World of Warships Blitz case — [AppRadar, App Localization (Feb 2025)](https://appradar.com/academy/app-localization)
- "Google Play supports more than 50 locales with independent metadata". "Keywords should be transcreated, not translated". Check "local autocomplete patterns, competitor metadata, and country-specific search behaviour before touching translated metadata". The title is the highest-weighted field and the short description is high — [AppFollow, Google Play ASO Keywords (2026 guide)](https://appfollow.io/blog/google-play-aso-keywords)
- Observed: in non-English locales, English-titled caption apps (Captions Lite, AutoCap, Captiono, Dubs) still rank in the top 12 for native queries such as "automatische untertitel", "sous-titres automatiques" and "legenda automática". Every one of them has a **localized short description** containing the native term, so the observation does not isolate English-only ranking — [Play search de-DE](https://play.google.com/store/search?q=automatische+untertitel&c=apps&hl=de&gl=DE); [AutoCap de-DE listing](https://play.google.com/store/apps/details?id=com.laika.kinetictypovid&hl=de&gl=DE)

### Inferences
- An English-only Wordburn listing would still be findable in these countries for brand terms and for English "captions" queries, which are typed in every market (§1). It would compete poorly for the native head terms. Every app seen ranking for them has at least the native term in a localized short description (inference from §2 observations; untested for an English-only app).
- Play's machine translation would cover es, de, fr, it, pt-BR and id. The §2 fingerprints show it producing sense errors in exactly this vocabulary, and nl, pl and pt-PT are not covered at all. So these short fields should be **hand-written per locale**, with machine translation at most a draft for the 4,000-character description: the title (30), short description (80) and the first lines of the full description (inference).
- The user's device **language**, not the country, selects the listing. A Spanish-language listing therefore serves Spanish speakers in the US, Mexico and Spain alike, unless separate es-419, es-ES and es-US variants are added (inference from the Help page wording; the exact locale list was not fetched).

### Gaps
- Not documented by Google: whether Play's search index uses the on-the-fly automated translation, or only developer-provided localized text, for ranking. The AppRadar claim is third-party.
- The exact Play Console locale codes were not fetched in this pass. From prior knowledge they include es-419, es-ES, es-US, pt-BR, pt-PT, de-DE, fr-FR, fr-CA, it-IT, nl-NL, pl-PL and id; Indonesian was historically "in". This should be verified in Console.
- No study was found that measures the ranking of an English-only listing vs a localized listing for the same app in these specific countries.

---

## 5. Metadata pitfalls per language

### Takeaway
- The English "caption" has two senses: video text and post/photo text. Most of these languages split them into different words, and machine translation regularly picks the photo/post one. The bare nouns in pt, pl and nl also carry heavy non-creator intent.
- The safe pattern is always: native subtitle noun + "automatic" + "video".

### Cited Findings
- **pt-BR: "legenda" alone = Instagram photo caption text.** Autocomplete for "legenda" is "legenda para foto", "legenda para foto sozinha", "legendas para fotos instagram", "legenda para foto de casal". "legenda tiktok" means post-caption ideas ("legenda tiktok para viralizar", "…caracteres", "…copiar") — [Google autocomplete pt-BR "legenda"](https://suggestqueries.google.com/complete/search?client=firefox&hl=pt&gl=br&q=legenda), [pt-BR "legenda tiktok"](https://suggestqueries.google.com/complete/search?client=firefox&hl=pt&gl=br&q=legenda%20tiktok)
- **pt-PT: "legendas"** is dominated by "legendasdivx" (movie subtitles) and photo captions — [Google autocomplete pt-PT](https://suggestqueries.google.com/complete/search?client=firefox&hl=pt&gl=pt&q=legendas)
- **Indonesian: "caption" = social-post text.** "caption video" completes to "caption video pernikahan" (wedding), "…di pantai" (at the beach), "…perkenalan mpls" (school intro), "…aesthetic". "captions" completes to "captions adalah" (what is), "captions aesthetic", "captions ig", "captions lucu" (funny) — [Google autocomplete id-ID "caption video"](https://suggestqueries.google.com/complete/search?client=firefox&hl=id&gl=id&q=caption%20video), [id-ID "captions"](https://suggestqueries.google.com/complete/search?client=firefox&hl=id&gl=id&q=captions)
- **Indonesian: "captions ai mod apk", "captions lite mod apk"** are among the top YouTube completions for "captions" — [YouTube autocomplete id-ID](https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&hl=id&gl=id&q=captions)
- **Indonesian: "takarir"** is the formal KBBI term, used by Dubs' listing, but searched as a definition and for anime fansubs, not apps — [Google autocomplete id-ID "takarir"](https://suggestqueries.google.com/complete/search?client=firefox&hl=id&gl=id&q=takarir); [Dubs id-ID listing](https://play.google.com/store/apps/details?id=com.captionsai&hl=id&gl=ID)
- **Indonesian: "teks video"** on Play returns teleprompters and transcription apps, not caption apps — [Play search id-ID "teks video"](https://play.google.com/store/search?q=teks+video&c=apps&hl=id&gl=ID)
- **Polish: "napisy"** = inscriptions and signs (cakes, gravestones, LED signs) and end credits. "napisy do filmów" on Play is led by a **movie-subtitle downloader** ("Napisy do filmów i seriali TV") — [Google autocomplete pl-PL "napisy"](https://suggestqueries.google.com/complete/search?client=firefox&hl=pl&gl=pl&q=napisy); [Play search pl-PL](https://play.google.com/store/search?q=napisy+do+film%C3%B3w&c=apps&hl=pl&gl=PL)
- **Polish: "podpisy"** (signatures / photo captions) appears in AutoCap's and Dubs' machine-like short descriptions ("Automatyczne podpisy i napisy wideo", "Podpisy i napisy wideo") — [AutoCap pl-PL](https://play.google.com/store/apps/details?id=com.laika.kinetictypovid&hl=pl&gl=PL)
- **Dutch: "ondertiteling"** = TV and streaming settings (Videoland, KPN, Netflix; "uitzetten" = turn off) — [Google autocomplete nl-NL](https://suggestqueries.google.com/complete/search?client=firefox&hl=nl&gl=nl&q=ondertiteling)
- **Dutch: "bijschriften"** (picture captions) is used in several competitor short descriptions (AutoCap, Dubs, AI Auto Captions, MixCaptions' title "Tekst,Bijschriften") — [MixCaptions nl-NL](https://play.google.com/store/apps/details?id=co.mixcord.mixcaptions&hl=nl&gl=NL)
- **German: "Untertitel"** and **"automatische Untertitel"** have "ausschalten" (switch off) as a top completion, so viewer intent is mixed in. "Bildunterschriften" (photo captions) appears in a competitor's short description — [Google autocomplete de-DE](https://suggestqueries.google.com/complete/search?client=firefox&hl=de&gl=de&q=automatische%20untertitel); [AI Auto Captions de-DE](https://play.google.com/store/apps/details?id=geeks.appz.autocaptions&hl=de&gl=DE)
- **Spanish: "leyendas"** (Dubs es-ES) and **Italian "didascalie"** (AutoCap and Dubs it-IT) are the photo-caption senses of "captions" — [Dubs es-ES](https://play.google.com/store/apps/details?id=com.captionsai&hl=es&gl=ES); [AutoCap it-IT](https://play.google.com/store/apps/details?id=com.laika.kinetictypovid&hl=it&gl=IT)
- **Spanish and French "subtítulos" / "sous-titres" on Play** are mixed with movie-subtitle players and downloaders: SubX Player, Subtitles Downloader, "Sous-titres - Films & séries" — [Play search es-ES "subtítulos"](https://play.google.com/store/search?q=subt%C3%ADtulos&c=apps&hl=es&gl=ES)
- **Translation intent.** Several top results for the Spanish, Indonesian and Dutch queries are translation apps ("Traductor Video y Subtítulos", "Terjemahan subtitle video", "ondertitel vertaling"). Wordburn does **not** translate — [Play search id-ID "subtitle otomatis"](https://play.google.com/store/search?q=subtitle+otomatis&c=apps&hl=id&gl=ID)
- **Mis-localized locale.** Pixster's "Captions AI" serves Portuguese text on its es-ES listing ("Legendas Espanhol") — [es-ES](https://play.google.com/store/apps/details?id=com.pixsterstudio.captions&hl=es&gl=ES)

### Inferences
Words to avoid or qualify in each locale (inferred from the senses observed above):
- pt: bare "legenda/legendas" — always pair it: "legendas automáticas para vídeos"
- id: bare "caption" — use "subtitle otomatis" in the title and "caption otomatis" / "auto caption" in the short or full description; avoid "takarir" as a primary term
- pl: bare "napisy" — use "automatyczne napisy (do filmów)"; never "podpisy"
- nl: bare "ondertiteling" — use "automatische ondertiteling" / "video ondertitelen"; avoid "bijschriften"
- es: avoid "leyendas"
- it: avoid "didascalie"
- de: avoid "Bildunterschriften"

"Traducir / terjemahan / vertalen / übersetzen" must stay out of Wordburn's metadata. The app does not translate, and the queries that contain them attract users who will be disappointed. This matches ASO.md's "Wordburn does not translate" line.

### Gaps
- Not verified by native speakers. The sense judgements rest on autocomplete patterns and observed competitor listings.
- "didascalie", "leyendas", "bijschriften" and "podpisy" were not checked directly in autocomplete to confirm they carry no video-caption search demand. The inference that they are the photo/print sense comes from general language knowledge and from where they appear.

---

## 6. Recommendation: is a localized Play listing worth it for each language?

### Takeaway
- **Yes for all eight, at least title and short description**, because:
  - the app already transcribes these languages;
  - the cost is ~110 characters per locale;
  - native head terms clearly exist;
  - competitors leave real gaps.
- Priority order:
  1. pt-BR, es (es-419 + es-ES), id
  2. de, fr, it
  3. pl, nl, pt-PT
- Write the short fields by hand. Do not use Play's machine translation for them.

### Cited Findings
- Exact-match native titles take #1 in less-contested locales: it-IT "Sottotitoli automatici AI", nl-NL "automatische ondertiteling", pt-BR "Legenda.ai: Legenda automática" — [Play search it-IT](https://play.google.com/store/search?q=sottotitoli+automatici&c=apps&hl=it&gl=IT); [nl-NL](https://play.google.com/store/search?q=automatische+ondertiteling&c=apps&hl=nl&gl=NL); [pt-BR](https://play.google.com/store/search?q=legenda+autom%C3%A1tica&c=apps&hl=pt&gl=BR)
- Zeemo and SubCap leave nl and pl titles in English. SubCap also leaves it and id in English — [Zeemo pl-PL](https://play.google.com/store/apps/details?id=cn.bluepulse.caption&hl=pl&gl=PL); [SubCap it-IT](https://play.google.com/store/apps/details?id=com.ratel.subcap&hl=it&gl=IT)
- Play's free machine translation omits Dutch, Polish and pt-PT, and is unreviewed where it exists — [Play Console Help](https://support.google.com/googleplay/android-developer/answer/9844778)
- In one case study, localized keywords raised impressions 35% on average and 73% in Spanish — [AppRadar](https://appradar.com/academy/app-localization)
- TikTok audiences: Indonesia 108M, Brazil 91.7M, Mexico 85.4M — [Castmagic (DataReportal-derived)](https://www.castmagic.io/blog/tiktok-usage-by-country)

### Inferences

**Candidate localized titles.** All are drafts, not tested, and need a native-speaker read. Character counts were measured against the 30-character limit:

| Locale | Candidate title | Chars | Alternative (chars) |
|---|---|---|---|
| es | `Wordburn: Subtítulos a videos` | 29 | `Wordburn: Subtítulos automáticos` is 32, too long |
| de | `Wordburn: Auto-Untertitel` | 25 | `Wordburn: Untertitel für Videos` is 31, too long |
| fr | `Wordburn : Sous-titres vidéo` | 28 | `Wordburn : Sous-titres auto` (27) |
| it | `Wordburn: Sottotitoli video` | 27 | `…Sottotitoli automatici` is 32, too long |
| pt-BR / pt-PT | `Wordburn: Legendas automáticas` | 30 | `Wordburn: Legenda automática` (28) |
| nl | `Wordburn: Video ondertitelen` | 28 | `Wordburn: Ondertiteling video` (29) |
| pl | `Wordburn: Automatyczne napisy` | 29 | `Wordburn: Napisy do filmów` (26) |
| id | `Wordburn: Subtitle Otomatis` | 27 | `Wordburn: Subtitle & Caption` (28) |

**Short description pattern.** Lead with the head term the title could not fit, then the differentiators. Use native terms for "word by word" (e.g. es "palabra por palabra", pt "palavra por palavra", id "kata demi kata") and "batch" (e.g. es "en lote", de "Stapel", id "sekaligus"). Leave out "free", "no watermark" and "translate" (inference; consistent with ASO.md constraints).

**Per-language verdicts (inference):**
- **pt-BR: high.**
  - Largest demand signals: rich autocomplete, a 91.7M TikTok audience, and strong Captions-brand awareness.
  - "legenda" needs disambiguation.
  - One strong local incumbent (Legenda.ai), so the title should carry "Legendas automáticas".
- **es: high.**
  - es-419/MX for volume, es-ES for SubCap's territory.
  - Use "subtítulos" and "poner subtítulos"; avoid "leyendas".
- **id: high.**
  - Wordburn's own first-launch language list includes it, there are 108M TikTok users, and English titles already compete.
  - A localized short description is the main gain. The title can stay half-English ("Subtitle Otomatis"), which is native usage.
  - Avoid bare "caption".
- **de: medium-high.**
  - Clear head term ("automatische Untertitel") and a well-contested top 3.
  - "KI" is the expected AI word.
- **fr / it: medium.**
  - Clean head terms. it-IT competition is thin: an exact-match keyword app holds #1.
- **pl: medium.**
  - Few localized competitors.
  - Must avoid the bare "napisy" / "podpisy" traps.
- **nl: low-medium.**
  - Low query volume.
  - English "subtitles" is used, and the Dutch market reads English. Competitors mostly do not localize titles.
  - Worth a hand-written title and short description because it costs little and "automatische ondertiteling" has almost no real competition.
- **pt-PT: low.**
  - Add it as a copy of pt-BR with minor edits ("vídeos", "pôr legendas"). Otherwise Portuguese-language users whose device locale is pt-PT fall back to the default listing. That is per the Help page: users see a translation only if their language preference matches.

### Gaps
- No conversion or ranking data for any locale. Store-listing experiments (Play Console custom store listings or A/B tests) per locale would be needed to confirm.
- The candidate titles have not been reviewed by native speakers. Per CLAUDE.md, the stopword lists for fr/it/pt/pl were written without native review, and the same caution applies here.
- Whether Google Play treats "Wordburn :" with a French non-breaking space before the colon differently is untested; a plain "Wordburn:" is safer.
