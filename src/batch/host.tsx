/**
 * Keeps the batch queue supplied from the root of the app.
 *
 * The queue renders captions, and a render needs the caption fonts loaded into
 * Skia and a measurer over them — the same one every preview uses, or the file
 * disagrees with what was shown (invariant 2). Fonts load through a hook, and a
 * hook needs a component, so this is that component: mounted once in the root
 * layout, drawing nothing, handing the measurer over as soon as it exists and
 * picking up a batch the app was killed in the middle of.
 */
import { useEffect, useMemo } from 'react';

import { summarize } from '../domain';
import { createMeasureText } from '../render/measure';
import { useCaptionFonts } from '../render/typefaces';
import { currentBatch, provideMeasure, resumeBatch } from './queue';

export function QueueHost() {
  const fonts = useCaptionFonts();
  const measure = useMemo(() => (fonts ? createMeasureText(fonts) : null), [fonts]);

  useEffect(() => {
    if (!measure) return;
    provideMeasure(measure);
    // A batch the user started and did not pause carries on where it stopped:
    // its checkpoints are on disk and nobody asked it to wait. One the user
    // paused, or that stopped for want of space, stays stopped until they say.
    const batch = currentBatch();
    if (batch && !summarize(batch).finished && batch.paused !== 'user' && batch.paused !== 'storage') {
      resumeBatch();
    }
  }, [measure]);

  return null;
}
