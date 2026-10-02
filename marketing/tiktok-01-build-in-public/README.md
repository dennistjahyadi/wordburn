# TikTok carousel 01 — build in public, the two-week update

Eight 1080 × 1920 slides for a photo-mode post on @dennisleandros, following
the kitverify → wordburn journey post. `caption.md` has the post text and the
source of every number on the slides.

```sh
python3 marketing/tiktok-01-build-in-public/make-slides.py   # → slides/*.png, contact.jpg
```

Copy lives in `slides.json`; `{braces}` around a word set it in the app's
yellow. Backgrounds are darkened so the type holds, and nothing is drawn inside
the app's own `safeZoneUnion()` for a 1080 × 1920 frame, so the caption and the
rail TikTok draws never cover a word.

## Shape

1. hook — 13 days in, the unfiltered update
2. recap — from kitverify to wordburn
3. the product — the app's own editor screenshot, five claims beside it
4. the numbers — commits, tests, install size, phones, sales
5. the bug of the week — the build script that exited with no output
6. what i got wrong — rationing exports instead of the watermark
7. what's next — Play listing, first purchase, iOS
8. follow along — the question for the comments

Slide 3 is the one slide that shows the app, from
`store/play-screenshots/01-editor.png`. The rest are text on stock.

## Stock photos, all Pexels

Pexels licence: free to use, no attribution required, modification allowed.
Recorded here anyway so the source is findable.

| file | page |
|---|---|
| `stock/6424589.jpg` | https://www.pexels.com/photo/computer-coding-on-a-computer-screen-6424589/ |
| `stock/15543114.jpg` | https://www.pexels.com/photo/white-board-with-colorful-sticky-notes-15543114/ |
| `stock/5483075.jpg` | https://www.pexels.com/photo/coding-on-a-laptop-5483075/ |
| `stock/34803969.jpg` | https://www.pexels.com/photo/focused-coding-session-with-laptop-and-coffee-34803969/ |
| `stock/8360007.jpg` | https://www.pexels.com/photo/a-man-recording-himself-using-his-phone-and-tripod-8360007/ |
| `stock/6424590.jpg` | https://www.pexels.com/photo/programming-code-on-laptop-screen-6424590/ |
| `stock/7514824.jpg` | https://www.pexels.com/photo/a-person-holding-a-smartphone-on-a-tripod-7514824/ |

Fetched at 1600 px wide from `images.pexels.com`. They are pictures of other
people's desks and living rooms, which is the honest limit of stock: the next
carousel should be shot on the A54 and this one's script is the template.

`slides/` and `contact.jpg` are build output, like `remotion/out/`.
