"""Cut the video-05 assets out of existing captures, app screens only, into one
flat folder: just the moments where the real app beats an illustration. Run from the repo root.

iOS shots: store/ios-shots (1206 x 2622, iPhone 17 simulator, Release 1.0.7).
Android frames: video 02's screen recordings in marketing/remotion/public/tutorial.
"""
import os, subprocess, tempfile
from PIL import Image

IOS = 'store/ios-shots'
TUT = 'marketing/remotion/public/tutorial'
OUT = 'marketing/video-05-why-i-built-it/assets'
TMP = tempfile.mkdtemp()
os.makedirs(OUT, exist_ok=True)

def frame(video, t):
    p = f'{TMP}/{os.path.basename(video)}_{t}.png'
    if not os.path.exists(p):
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(t), '-i', f'{TUT}/{video}', '-frames:v', '1', p], check=True)
    return p

def ios(name):
    return f'{IOS}/{name}.png'

# (output name, source, box)
CROPS = [
    # hook: "See that word get big? I didn't pick it."
    ('01-hook-lean-on-a-word-transcript', ios('26-editor-playing-negative-2'), (0, 1560, 1206, 2000)),
    # "built my own. It's called Wordburn. No account."
    ('02-wordburn-home-title', ios('04-home-empty'), (30, 300, 1170, 600)),
    ('03-no-account-new-video', ios('04-home-empty'), (30, 670, 1170, 1075)),
    # "it writes every word, timed to your voice"
    ('04-listening-for-first-words', ios('06-processing-listening'), (0, 1550, 1206, 1880)),
    ('05-every-word-transcribed', frame('pick.mp4', 42.5), (0, 1350, 1080, 2170)),
    # "nine languages", one row per name; 13 names Spanish and Portuguese, which are off screen in the list
    ('06-lang-english', ios('41-home-language-sheet'), (40, 968, 1166, 1148)),
    ('07-lang-dutch', ios('41-home-language-sheet'), (40, 1268, 1166, 1448)),
    ('08-lang-french', ios('41-home-language-sheet'), (40, 1472, 1166, 1652)),
    ('09-lang-german', ios('41-home-language-sheet'), (40, 1676, 1166, 1856)),
    ('10-lang-indonesian', ios('41-home-language-sheet'), (40, 1880, 1166, 2060)),
    ('11-lang-italian', ios('41-home-language-sheet'), (40, 2084, 1166, 2264)),
    ('12-lang-polish', ios('41-home-language-sheet'), (40, 2288, 1166, 2468)),
    ('13-lang-all-eight-one-download', ios('37-languages'), (40, 410, 1170, 1210)),
    # "Wrong word? Tap it, hear it, fix it. The timing stays put."
    ('14-wrong-word-not-sure', ios('15-word-sheet-low-confidence'), (30, 1700, 1180, 1880)),
    ('15-word-sheet-play-edit', ios('12-word-sheet'), (0, 1690, 1206, 2622)),
    ('16-timing-waveform', ios('13-timing-sheet-waveform'), (0, 1575, 1206, 1900)),
    # "the ones you lean on": emphasised words are bold in the transcript
    ('17-big-words-bold-in-transcript', ios('08-editor-first-flagged'), (0, 1665, 1206, 1870)),
    # "Pick a look, pick a colour"
    ('18-style-bold-yellow', ios('16-style-sheet-tiles'), (40, 1465, 595, 1830)),
    ('19-style-karaoke-fill', ios('16-style-sheet-tiles'), (600, 1465, 1160, 1830)),
    ('20-style-box-highlight', ios('16-style-sheet-tiles'), (40, 1835, 595, 2205)),
    ('21-style-focus-preview', ios('16-style-sheet-tiles'), (40, 2210, 595, 2525)),
    ('22-styles-more', ios('23-style-neon-glow'), (0, 1525, 1206, 2622)),
    ('23-colour-picker', ios('20-style-colour-red'), (0, 1850, 1206, 2300)),
    # "what you see is the file you get": pair with 21, the same Focus look
    ('24-exported-file-focus', frame('export.mp4', 3), (90, 1350, 990, 1530)),
    # "these captions? Yep. Wordburn."
    ('25-watermark-captions-by-wordburn', frame('export.mp4', 3), (30, 200, 240, 345)),
    # "first three videos are free"
    ('26-three-free-videos', ios('04-home-empty'), (70, 1320, 1110, 1445)),
]

for name, src, box in CROPS:
    path = f'{OUT}/{name}.png'
    Image.open(src).convert('RGB').crop(box).save(path)

# Brand files as they are
import shutil
os.makedirs(OUT, exist_ok=True)
shutil.copy('store/play-icon-512.png', f'{OUT}/27-app-icon.png')
print(len(CROPS), 'crops')
