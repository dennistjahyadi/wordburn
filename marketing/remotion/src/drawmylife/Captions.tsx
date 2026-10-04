import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { ACCENT, font } from '../brand';
import type { Cue } from '../tutorial/Captions';

/**
 * The voice, subtitled in the app's own Box highlight: ink words, and the one
 * being said sitting on the yellow box.
 *
 * Video 02 and 03 set paper type on a dark band because their ground was
 * black. This ground is a white page, so the subtitles are the other way up,
 * the way the app draws Box highlight over a light frame: dark words, a
 * yellow box, and a paper halo to keep them off any line of the drawing they
 * cross. Every word carries the box's padding whether or not it has the box,
 * so the line does not shuffle as the highlight moves (the app does the same).
 *
 * One word is shown off: "pops" grows when it is said, which is the feature
 * that line is about.
 */
const GROW = new Set(['pops.']);

export const BoardCaptions: React.FC<{ cues: Cue[]; centerY?: number; size?: number }> = ({
  cues,
  centerY = 1425,
  size = 60,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const HOLD = 0.24;
  const i = cues.findIndex((c, n) => {
    const next = cues[n + 1];
    const end = Math.min(c.toSec + HOLD, next ? next.fromSec : Infinity);
    return t >= c.fromSec && t < end;
  });
  if (i < 0) return null;
  const cue = cues[i];
  const next = cues[i + 1];
  const end = Math.min(cue.toSec + HOLD, next ? next.fromSec : Infinity);

  const rise = spring({
    frame: frame - Math.round(cue.fromSec * fps),
    fps,
    config: { damping: 200, stiffness: 190, mass: 0.5 },
    durationInFrames: 9,
  });
  const out = next && next.fromSec <= cue.toSec + HOLD ? 1 : interpolate(t, [end - 0.12, end], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const halo = '0 0 10px #fff, 0 0 18px #fff, 0 0 26px #fff';

  return (
    <div
      style={{
        position: 'absolute',
        left: 80,
        width: 920,
        top: centerY,
        transform: `translateY(-50%) translateY(${(1 - rise) * 22}px)`,
        opacity: Math.min(rise, out),
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '6px 4px',
      }}
    >
      {cue.words.map((w, n) => {
        const nxt = cue.words[n + 1];
        const live = t >= w.s - 0.03 && (!nxt || t < nxt.s - 0.03);
        const grow = GROW.has(w.w)
          ? 1 +
            0.32 *
              spring({
                frame: frame - Math.round(w.s * fps),
                fps,
                config: { damping: 8, stiffness: 170, mass: 0.6 },
              })
          : 1;
        return (
          <span
            key={`${w.w}-${n}`}
            style={{
              fontFamily: font.bold,
              fontSize: size,
              lineHeight: 1.12,
              letterSpacing: -1,
              color: '#111',
              padding: '2px 14px 6px',
              borderRadius: 14,
              background: live ? ACCENT : 'transparent',
              textShadow: live ? 'none' : halo,
              display: 'inline-block',
              transform: `scale(${grow})`,
            }}
          >
            {w.w}
          </span>
        );
      })}
    </div>
  );
};
