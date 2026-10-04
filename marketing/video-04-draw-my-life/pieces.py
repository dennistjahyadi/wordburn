"""
Cut each generated doodle into the things in it, so they can pop on one by one.

For every scene this writes into the Remotion project's public folder:

  sNN-full.png   the original, which the scene settles on
  sNN-pK.png     piece K: the pixels of one object, cropped, on transparency
  sNN.json       where each piece goes, in the order they appear, plus where
                 the yellow and coral shapes are (for the overlays)

An object is ink that sits within ~5 px of other ink, with its holes filled,
so a pill and its fill are one thing. Every remaining painted pixel goes to the
nearest object, so the pieces together are the whole picture and nothing pops
on twice or not at all.

Run from the repository root:  python3 marketing/video-04-draw-my-life/pieces.py
"""
import glob
import json
import os
import re

import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from skimage.measure import label

SRC = 'references/ads'
OUT = 'marketing/remotion/public/drawmylife'

# Scene id → source file number (the number at the end of the file name) and an
# optional crop box. The files were generated out of script order; this is the
# script's order.
SCENES = [
    ('s00', 1, (1000, 0, 1536, 1024)),  # the waving view of the character sheet
    ('s01', 2, None),   # stack of clips
    ('s02', 3, None),   # typing against the clock
    ('s03', 4, None),   # stuck upload
    ('s04', 6, None),   # empty gauge
    ('s05', 7, None),   # lightbulb
    ('s06', 5, None),   # phone, chip, aeroplane
    ('s07', 8, None),   # word pills
    ('s08', 9, None),   # tap, hear, fix
    ('s09', 10, None),  # the word that pops
    ('s10', 13, None),  # preview equals file
    ('s11', 12, None),  # three free, crossed icons
    ('s12', 11, None),  # crown, eraser, infinity
    ('s13', 14, None),  # posting, logo, badge
]

# Scenes whose pieces arrive top to bottom rather than biggest first: the last
# page has to show its logo before the name is written beside it.
TOP_DOWN = {'s13'}

# Objects smaller than this join their nearest neighbour, so a scene is a
# handful of pops rather than forty.
MIN_PIECE = 2500


def main():
    os.makedirs(OUT, exist_ok=True)
    for old in glob.glob(f'{OUT}/s[0-9][0-9]-*.png'):
        os.remove(old)
    files = {int(re.search(r'-(\d+)\.png$', f).group(1)): f for f in glob.glob(f'{SRC}/*.png')}

    for sid, num, crop in SCENES:
        im = Image.open(files[num]).convert('RGB')
        if crop:
            im = im.crop(crop)
        rgb = np.asarray(im)
        h, w = rgb.shape[:2]
        a = rgb.astype(np.float32)
        lum = 0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2]
        chroma = a.max(-1) - a.min(-1)

        ink = (lum < 115) & (chroma < 70)
        # How much of each pixel is drawing rather than paper. The generated
        # images sit on an off-white with a faint tone of its own; that tone is
        # paper, and it is whitened out of both the pieces and the original,
        # or it shows as a grey card on the video's pure white page.
        paint = np.maximum(np.clip((248 - lum) / 20, 0, 1), np.clip((chroma - 8) / 40, 0, 1))
        painted = paint > 0.05
        rgb = np.clip(255 * (1 - paint[..., None]) + a * paint[..., None], 0, 255).astype(np.uint8)
        im = Image.fromarray(rgb)

        # Objects: ink near other ink, holes filled.
        objects = label(ndi.binary_dilation(ink, iterations=5), connectivity=2)
        objects = objects * ndi.binary_fill_holes(objects > 0)
        n = objects.max()

        # Fold small objects into their nearest neighbour.
        sizes = np.bincount(objects.ravel(), minlength=n + 1)
        small = [k for k in range(1, n + 1) if sizes[k] < MIN_PIECE]
        big = objects.copy()
        for k in small:
            big[big == k] = 0
        if big.max() > 0:
            _, (iy, ix) = ndi.distance_transform_edt(big == 0, return_indices=True)
            objects = np.where(np.isin(objects, small), big[iy, ix], objects)

        # Every painted pixel belongs to the nearest object.
        _, (iy, ix) = ndi.distance_transform_edt(objects == 0, return_indices=True)
        owner = objects[iy, ix] * painted
        ids = [k for k in np.unique(owner) if k != 0]

        def top(k):
            return int(np.nonzero((owner == k).any(1))[0][0])

        size = {k: int((owner == k).sum()) for k in ids}
        ids.sort(key=top if sid in TOP_DOWN else (lambda k: -size[k]))

        pieces = []
        alpha = (np.clip(paint, 0, 1) * 255).astype(np.uint8)
        for order, k in enumerate(ids):
            ys, xs = np.nonzero(owner == k)
            x0, y0, x1, y1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
            sub = rgb[y0:y1, x0:x1]
            al = np.where(owner[y0:y1, x0:x1] == k, alpha[y0:y1, x0:x1], 0).astype(np.uint8)
            Image.fromarray(np.dstack([sub, al]), 'RGBA').save(f'{OUT}/{sid}-p{order}.png', optimize=True)
            pieces.append({'x': int(x0), 'y': int(y0), 'w': int(x1 - x0), 'h': int(y1 - y0)})
        im.save(f'{OUT}/{sid}-full.png', optimize=True)

        ys, xs = np.nonzero(paint > 0.3)
        bbox = [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]

        def blobs(mask, min_area=150):
            lab, _ = label(mask, return_num=True, connectivity=2)
            out = []
            for i, sl in enumerate(ndi.find_objects(lab), start=1):
                area = int((lab[sl] == i).sum())
                if area >= min_area:
                    out.append({'x0': sl[1].start, 'y0': sl[0].start, 'x1': sl[1].stop, 'y1': sl[0].stop, 'area': area})
            return sorted(out, key=lambda b: -b['area'])

        c = rgb.astype(np.int16)
        yellow = (c[..., 0] > 200) & (c[..., 1] > 170) & (c[..., 2] < 120)
        coral = (c[..., 0] > 200) & (c[..., 1] < 140) & (c[..., 2] < 140)

        with open(f'{OUT}/{sid}.json', 'w') as f:
            json.dump({'id': sid, 'w': w, 'h': h, 'bbox': bbox, 'pieces': pieces,
                       'yellow': blobs(yellow), 'coral': blobs(coral)}, f, separators=(',', ':'))
        print(sid, f'{w}x{h}', 'pieces', len(pieces))


if __name__ == '__main__':
    main()
