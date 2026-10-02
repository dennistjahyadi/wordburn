# Post copy — TikTok photo mode, @dennisleandros

Upload `slides/01.png` … `08.png` in order as a photo-mode post. Add a trending
sound at upload rather than baking one in. Lowercase on purpose, same register
as `../README.md`'s post copy.

Written for people who make videos, not people who make apps: no commits, no
tests, no build tools anywhere on the slides or in the caption. The technical
version of each fact is in the table at the bottom, for anyone who asks in the
comments.

## Caption

> 13 days into building wordburn in public. it puts captions on your videos
> right on your phone: nothing gets uploaded, no account, works with no
> internet, pay once. 18 styles, 1 phone tested on, 0 sales, because it isn't
> in the play store yet. slide 5 is the bug that swore the app was broken when
> it wasn't. slide 6 is what i got wrong about the free version. what do you
> wish your captions app did?
>
> #buildinpublic #indiedev #solodev #captions #contentcreator #smallbusiness
> #videoediting #android

## Pinned comment, once it is up

> last post was the story from kitverify to starting this. this one is what
> two weeks of it actually looks like. next one is the play store listing, if
> they let me through.

## What each slide says, and what it is actually about

Every figure is checked. The day count is the one to re-check before posting.

| slide | on the slide | the technical fact behind it |
|---|---|---|
| 1, 4 | 13 days | first commit 2026-09-10, today 2026-09-23 (`git log --reverse`) |
| 3 | never leaves your phone, no internet | on-device whisper, `base.en-q8_0` 81.8 MB in the APK |
| 3, 4 | 18 caption styles | eighteen `STYLE_PRESETS`, CLAUDE.md slice 14 |
| 4 | 1 phone | the Galaxy A54; emulators are not phones |
| 4 | 0 people, 0 sales | not on Play; Known issues: "Nobody has ever bought anything" |
| 5 | "my computer swore it wasn't" | `head -1` under `pipefail` killing aapt2, `set -e` exiting `run.sh` with no output while the APK sat on disk |
| 5 | "one line to fix" | `_first_line` and `\|\| got=""` in `run.sh` |
| 6 | 3 saves → small mark | free tier went from 3 exports to unlimited watermarked exports, slice 12 |
| 7 | Play not there, iphone not started | Known issues: listing not live, iOS never built |

If the day count is off because work started before the repo's first commit,
change "13 days" on slide 1, slide 4 and the caption, then re-run
`make-slides.py`.
