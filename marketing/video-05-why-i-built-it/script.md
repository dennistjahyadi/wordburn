# Video 05: "Why I built a caption app"

A voiced build-in-public ad: voice over cut-out app screens, animated in, with
everything outside the app drawn as your own illustration. The captions are burned
in by Wordburn itself. About 60 seconds, about 160 words. The speaker is never
named, and the ad never mentions internet, offline or uploading.

## Which strengths are real

Sources: `reports/Caption app apple to apple comparison.md` (2026-10-02, caption apps
only), re-checked against the app as it is today: three free videos with
watermarked exports, and all nine languages free.

| Feature | Verdict | Why |
|---|---|---|
| **Emphasis picked from the voice** | **The hook** | No caption-first rival documents it: the ones that explain their auto-emphasis all say "keywords", and one says "random". It's the most visual moment the app has, a word growing because of how it was said. Describe it, never call it "the only". |
| Word editor: tap, hear, fix, the timing stays | Real, the main demo | Captions' per-word timing is iOS-only, and rivals retime by line or cue. AutoCap reviewers complain there's no audio while editing. Verified on the A54. |
| No credits, no minutes | Real, and it's the punchline of the story | Captions, Zeemo, MixCaptions and Submagic all meter. Free is three videos, which the voiceover says. |
| Preview matches export | Real | Rivals get "export looks different" reviews, and Wordburn was checked frame against frame. Say "matches" or "what you see is the file you get", never "identical". |
| 9 languages | Basic, but fine to state | Say the nine plainly. Never "more languages" or a comparison, because rivals list 50 to 125. |
| 18 styles, colour, size | Basic | Rivals list 30 to 500. Show it, never count it. |
| No account | Basic but true | It gets half a line. |
| 1080p, .srt, dictionary, batch | Basic, or unproven on a phone (batch) | Not voiced. Crops are in the `99` range. |
| On-device, works with no internet | Real, but you asked to leave it out | It's not mentioned anywhere in this ad, and the crops for it were removed. |

## Voiceover

Tone: dry, a bit fed-up, the way you'd tell a friend about something silly. The
`…` pauses are where a cut or a pop-in lands.

| # | Beat | Line | Seconds |
|---|---|---|---|
| 1 | Hook | **See that word get big? I didn't pick it.** The app heard me lean on it. | 0–4 |
| 2 | Reason | So, why build a caption app? Typing captions by hand took forever. My thumbs filed a complaint. | 4–10 |
| 3 | The apps | So I tried caption apps. Made a few videos, and then… "You're out of credits." Out of credits. For words I said. With my own mouth. | 10–19 |
| 4 | Built it | So I did the reasonable thing… and built my own. | 19–22 |
| 5 | Wordburn | It's called Wordburn. No account, no credits counting down. Pick a video and it writes every word, timed to your voice. | 22–29 |
| 6 | Languages | In nine languages: English, Spanish, French, German, Italian, Portuguese, Dutch, Polish and Indonesian. Yes, I practised that. | 29–36 |
| 7 | Editor | Wrong word? Tap it, hear it, fix it. The timing stays put. | 36–40 |
| 8 | Emphasis | And the big words? It listens for the ones you lean on. Like… *this* one. | 40–44 |
| 9 | Style | Pick a look, pick a colour, and what you see is the file you get. | 44–48 |
| 10 | Meta | Oh, and these captions you've been reading? Yep. Wordburn. | 48–51 |
| 11 | CTA | It's on the Play Store now, and your first three videos are free, with a tiny watermark. On iPhone? Apple's still reviewing it. Follow me and I'll tell you the second it's out. | 51–59 |
| 12 | Button | Now if you'll excuse me… I have captions not to type. | 59–62 |

Plain text for recording:

> See that word get big? I didn't pick it. The app heard me lean on it.
>
> So, why build a caption app? Typing captions by hand took forever. My thumbs
> filed a complaint.
>
> So I tried caption apps. Made a few videos, and then… "You're out of credits."
> Out of credits. For words I said. With my own mouth.
>
> So I did the reasonable thing… and built my own.
>
> It's called Wordburn. No account, no credits counting down. Pick a video and it
> writes every word, timed to your voice.
>
> In nine languages: English, Spanish, French, German, Italian, Portuguese, Dutch,
> Polish and Indonesian. Yes, I practised that.
>
> Wrong word? Tap it, hear it, fix it. The timing stays put.
>
> And the big words? It listens for the ones you lean on. Like… this one.
>
> Pick a look, pick a colour, and what you see is the file you get.
>
> Oh, and these captions you've been reading? Yep. Wordburn.
>
> It's on the Play Store now, and your first three videos are free, with a tiny
> watermark. On iPhone? Apple's still reviewing it. Follow me and I'll tell you the
> second it's out.
>
> Now if you'll excuse me… I have captions not to type.

### Honesty checks on the script

- **The hook and line 8 are only true if the app picked those big words itself.**
  Caption this video in a preset that makes emphasis big (Spotlight, Headline or
  Bold yellow). Then open the word sheet on the hook word: it says which way the
  word was decided. If the app didn't pick the word you leaned on, re-record or
  move the line onto a word it did pick. Don't fake it with Make big, or "I didn't
  pick it" becomes a lie.
- **Lean hard on "big" in line 1 and on "this" in line 8.** The pick comes from
  loudness, how long a word is held and the pause around it, so the delivery is
  what makes it work.
- **Eight of the nine languages need a one-time 874 MB download**, and all nine are
  free. Put that in small type on screen during line 6. They have also only been
  run on an emulator, so caption one real clip in, say, Spanish on the A54 before
  this goes out as a paid ad.
- The credits story is your own experience and names no app. It matches the
  category: Captions, Zeemo, MixCaptions and Submagic all meter.
- "No credits counting down" is true on both tiers. The free tier is a count of
  **videos** (three), and line 11 says so.
- If the video is captioned on the free tier, the "Captions by Wordburn" badge sits
  top left. That's fine, because it proves line 10.

## Shot list: real app or illustration

`assets/` is one flat folder with **27 app screenshots, numbered in the order the
voiceover uses them**. They cover only the moments where the real app sells better
than a drawing: real words, real styles, real buttons. Everything else is yours to
illustrate. `INDEX.png` shows all of them on one sheet, and `crop.py` regenerates
them (run it from the repo root).

| Words | Show | Files |
|---|---|---|
| "See that word get big? I didn't pick it." | **Real**: this video's own caption, then the transcript | `01-hook-lean-on-a-word-transcript` (it reads "Lean on a word when you talk, and that's the word that pops.") |
| "Typing captions by hand took forever. My thumbs filed a complaint." | Illustration | none |
| "You're out of credits… with my own mouth" | Illustration + kinetic type, never a rival's screen | none |
| "built my own. It's called Wordburn." | **Real** | `02-wordburn-home-title` |
| "No account, no credits counting down." | **Real** | `03-no-account-new-video` (straight to New video, no sign-in) |
| "it writes every word, timed to your voice" | **Real** | `04-listening-for-first-words` → `05-every-word-transcribed` |
| "nine languages: English, Spanish, French…" | **Real**, one row per name as it's said | `06`–`12` (English, Dutch, French, German, Indonesian, Italian, Polish). Spanish and Portuguese have no row because the list is cut off on screen, so use `13-lang-all-eight-one-download`, which names all eight and carries the one-download line. |
| "Wrong word? Tap it, hear it, fix it." | **Real** | `14-wrong-word-not-sure` → `15-word-sheet-play-edit` |
| "The timing stays put." | **Real** | `16-timing-waveform` |
| "It listens for the ones you lean on. Like… this one." | **Real** | `17-big-words-bold-in-transcript` (the bold words are the app's picks) |
| "Pick a look" | **Real**, pop them in one by one | `18`–`21`, then `22-styles-more` |
| "pick a colour" | **Real** | `23-colour-picker` |
| "what you see is the file you get" | **Real**, side by side | `21-style-focus-preview` beside `24-exported-file-focus` (the same look in the editor and in the exported file) |
| "these captions? Yep. Wordburn." | **Real** | `25-watermark-captions-by-wordburn` |
| "Play Store… first three videos are free" | **Real** + the official Google Play badge (download it from Google) | `26-three-free-videos`, `27-app-icon` |
| "On iPhone? Apple's still reviewing it. Follow me…" | Illustration; "iPhone: coming soon" in plain type, no Apple badge; @dennisleandros | none |
| "captions not to type" | **Real** | `27-app-icon` |
