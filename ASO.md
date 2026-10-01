# Play Store listing

The text to paste into Play Console, and the reasoning behind it. Counts are
against Google Play's limits and were measured, not estimated.

| Field | Limit | This text | |
|---|---|---|---|
| App name | 30 | 26 | |
| Short description | 80 | 76 | |
| Full description | 4000 | 2470 | |

**The positioning moved on 2026-09-30.** The listing used to sell "offline,
on-device, pay once" to anybody who wanted captions on a clip. It now sells
volume to the people who make a lot of clips: a batch queue, auto clip out of a
long video, one style across all of it, five languages, and a subscription. The
app still processes everything on the phone; that is said once, in the app's
Settings, and not here, because it is a fact for somebody who goes looking
rather than a reason to install.

## App name — 30/26

```
Wordburn: Captions & Clips
```

The build prompt proposed `Wordburn: Auto Captions & Clips`, which is **31**
characters and would be refused. "Auto" is the word that goes: "captions" and
"clips" are the two things the app now makes, and the short description opens
with "Auto captions" to carry it. `Wordburn: Auto Captions, Clips` fits at 30
and reads like a list; run it as a store listing experiment if the search term
turns out to matter.

## Short description — 80/76

```
Auto captions for every clip. Queue a batch or cut shorts from a long video.
```

Second-highest-weighted field. It names the two features that are new and that
the category's cloud apps charge per minute for.

## Full description — 4000/2470

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

## What this text is careful not to say

Every line is something the app does, because Play's misleading-claims policy is
about exactly that and because the research in
`reports/Multilingual Whisper model for Android.md` found the category full of
"10x faster" claims nobody can check.

- **No speed multiplier.** The prompt's "caption and clip 20 videos in the time
  it takes to do one" is true of the user's hands-on time and false of the
  clock: the phone works through a queue one clip after another, at up to about
  three quarters of each clip's own length. "Queue your clips and walk away" is
  the true version. If a number is wanted, measure an hour of clips on the A54
  and say "an hour of clips captioned in about N minutes on a Galaxy A54".
- **No "free" about the app.** Free exports carry a watermark and four of the
  five Pro features are not available without paying, so the only "free" is the
  trial, named as a trial.
- **No "offline", "no upload", "pay once", "forever" or "no subscription".**
  The first three are still true and are no longer the pitch; the last three are
  no longer true.
- **No accuracy claims per language.** The four downloaded languages run on a
  model whose accuracy on real phone footage has not been measured here.
- **TikTok, Reels and Shorts are still absent**, for the reason they always
  were: Play's metadata policy discourages other brands' names.

## Still to do by hand

- The name is not trademark-cleared. Nothing has been searched at
  [WIPO](https://branddb.wipo.int/), [USPTO](https://tmsearch.uspto.gov/) or
  EUIPO in classes 9 and 42, and those are the only bodies that can force a
  rename after launch.
- What is verified: `wordburn.app` is unregistered, `com.wordburn.app` returns
  404 on Play, and no app or company called Wordburn was found in this category.
  Nearest neighbour is "Word Burst Puzzle Game", which is not a clash.
- `Word-` is game-coded on app stores (Wordscapes, Word Burst, Words with
  Friends). The icon and the `Subtitles & Captions` suffix should resolve it in
  a search row. Watch the first weeks of impression-to-install data; that is
  where it would show.
- Reserve the App Store Connect name and the social handles. The Play package
  name hardens permanently at first upload.
