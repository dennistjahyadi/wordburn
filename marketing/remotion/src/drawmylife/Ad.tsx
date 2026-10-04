import { slide } from '@remotion/transitions/slide';
import { linearTiming, TransitionSeries } from '@remotion/transitions';
import React, { useEffect, useState } from 'react';
import {
  AbsoluteFill,
  Audio,
  continueRender,
  delayRender,
  Easing,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

import { font } from '../brand';
import { useFonts } from '../useFonts';
import { F } from '../voiced/time';

import { BoardCaptions } from './Captions';
import { Drawing, fit, type Blob, type DrawingData } from './Drawing';
import { Circle, Label, PillWord, TapedShot } from './Extras';
import { local, PAN, SCRIPT, TIMELINE, TOTAL_FRAMES, VOICE } from './script';

import s00 from '../../public/drawmylife/s00.json';
import s01 from '../../public/drawmylife/s01.json';
import s02 from '../../public/drawmylife/s02.json';
import s03 from '../../public/drawmylife/s03.json';
import s04 from '../../public/drawmylife/s04.json';
import s05 from '../../public/drawmylife/s05.json';
import s06 from '../../public/drawmylife/s06.json';
import s07 from '../../public/drawmylife/s07.json';
import s08 from '../../public/drawmylife/s08.json';
import s09 from '../../public/drawmylife/s09.json';
import s10 from '../../public/drawmylife/s10.json';
import s11 from '../../public/drawmylife/s11.json';
import s12 from '../../public/drawmylife/s12.json';
import s13 from '../../public/drawmylife/s13.json';

export { TOTAL_FRAMES };

const DATA = [s00, s01, s02, s03, s04, s05, s06, s07, s08, s09, s10, s11, s12, s13] as unknown as DrawingData[];

const biggest = (blobs: Blob[], keep: (b: Blob) => boolean = () => true): Blob =>
  blobs.filter(keep).sort((a, b) => b.area - a.area)[0];
const cy = (b: Blob) => (b.y0 + b.y1) / 2;
const union = (bs: Blob[]): Blob => ({
  x0: Math.min(...bs.map((b) => b.x0)),
  y0: Math.min(...bs.map((b) => b.y0)),
  x1: Math.max(...bs.map((b) => b.x1)),
  y1: Math.max(...bs.map((b) => b.y1)),
  area: bs.reduce((a, b) => a + b.area, 0),
});

/**
 * Video 04 — "draw my life".
 *
 * Fourteen generated doodles, built up one after another on a white page
 * while Dennis's ElevenLabs voice tells the story: the person who
 * needed captions, the apps that metered them, and the app he built instead.
 * 52 s at 30 fps, 9:16.
 *
 * Each drawing pops on a piece at a time (`Drawing`) and settles on the
 * original; the page then pans left to the next one (`slide`, 14 frames).
 * The beats that make a claim get a beat of their own: the real editor and
 * the real style sheet taped onto the board, "Wordbern" corrected inside the
 * drawn pills, "pops" written into the speech bubble, a marker circle round
 * each "no", and the name and store line written into the last page.
 *
 * Subtitles run the whole way in the app's Box highlight, because a muted
 * viewer is most viewers and because they are the product. The
 * `drawmylife-nocaptions` cut leaves them off and lets the drawings take the
 * band they used.
 */
export const DrawMyLifeAd: React.FC<{ captions?: boolean }> = ({ captions = true }) => {
  useFonts();
  usePreload();
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: '#fff' }}>
      <Sequence from={F(0)}>
        <Audio src={staticFile(VOICE)} />
      </Sequence>

      <TransitionSeries>
        {TIMELINE.map((scene, i) => {
          const last = i === TIMELINE.length - 1;
          return (
            <React.Fragment key={scene.id}>
              <TransitionSeries.Sequence
                durationInFrames={last ? durationInFrames - scene.from : scene.frames + PAN}
              >
                <Scene index={i} captions={captions} />
              </TransitionSeries.Sequence>
              {last ? null : (
                <TransitionSeries.Transition
                  presentation={slide({ direction: 'from-right' })}
                  timing={linearTiming({ durationInFrames: PAN, easing: Easing.inOut(Easing.cubic) })}
                />
              )}
            </React.Fragment>
          );
        })}
      </TransitionSeries>

      {captions ? <BoardCaptions cues={SCRIPT.CUES} /> : null}
    </AbsoluteFill>
  );
};

const Scene: React.FC<{ index: number; captions: boolean }> = ({ index, captions }) => {
  const frame = useCurrentFrame();
  const scene = TIMELINE[index];
  const data = DATA[index];
  const box = fit(data, captions);

  // When the first piece lands, and how far apart the rest follow.
  const start = scene.drawAt !== undefined ? local(index, scene.drawAt) : index === 0 ? 2 : PAN + 1;
  const build = scene.drawSec
    ? Math.round(scene.drawSec * 30)
    : Math.max(10, Math.min(36, Math.round((scene.frames - start) * 0.35)));
  const n = data.pieces.length;
  const gap = n > 1 ? Math.max(3, Math.min(9, Math.round(build / (n - 1)))) : 0;

  const beats = BEATS[scene.id]?.(index, data) ?? {};

  // The camera: a slow push over the whole scene, plus a scene's own move.
  const push = interpolate(frame, [0, scene.frames + PAN], [1, 1.04], { extrapolateRight: 'clamp' });
  const focus = beats.focus;
  const z = focus ? 1 + (focus.zoom - 1) * focusAmount(frame, focus.at) : 1;
  const ox = focus ? box.left + focus.x * box.scale : box.left + box.cx * box.scale;
  const oy = focus ? box.top + focus.y * box.scale : box.top + box.cy * box.scale;
  const k = focus ? focusAmount(frame, focus.at) : 0;
  const tx = (540 - ox) * k * 0.35;
  const ty = (780 - oy) * k * 0.35;

  return (
    <AbsoluteFill style={{ background: '#fff', overflow: 'hidden' }}>
      <AbsoluteFill
        style={{
          transformOrigin: `${ox}px ${oy}px`,
          transform: `translate(${tx}px, ${ty}px) scale(${push * z})`,
        }}
      >
        <div style={{ position: 'absolute', left: box.left, top: box.top, width: box.width, height: box.height }}>
          <Drawing data={data} start={start} gap={gap}>
            {beats.svg}
          </Drawing>
        </div>
      </AbsoluteFill>
      {beats.html}
    </AbsoluteFill>
  );
};

const focusAmount = (frame: number, at: number) =>
  spring({ frame: frame - at, fps: 30, config: { damping: 200, stiffness: 90, mass: 0.9 } });

type Beats = {
  svg?: React.ReactNode;
  html?: React.ReactNode;
  focus?: { x: number; y: number; zoom: number; at: number };
};

/** What each scene does beyond being drawn, keyed to the voice. */
const BEATS: Record<string, (i: number, d: DrawingData) => Beats> = {
  // "It's called Wordburn." — the camera leans into the laptop and its logo.
  s05: (i, d) => {
    const logo = biggest(d.yellow, (b) => cy(b) > d.h * 0.5);
    return { focus: { x: (logo.x0 + logo.x1) / 2, y: cy(logo), zoom: 1.16, at: local(i, 18.0) } };
  },

  // "…every word shows up, timed to your voice." — the real editor.
  s07: (i) => ({
    html: (
      <TapedShot src="drawmylife/shot-editor.jpg" ratio={1250 / 900} width={640} centerY={760} at={local(i, 25.0)} out={local(i, 27.35)} />
    ),
  }),

  // "Wrong word? Tap it, hear it, fix it."
  s08: (i, d) => {
    const wrong = [...d.coral].sort((a, b) => b.x1 - b.x0 - (a.x1 - a.x0))[0];
    const right = biggest(d.yellow);
    return {
      svg: (
        <>
          <PillWord box={wrong} text="Wordbern" at={local(i, 27.95)} size={0.29} color="#E5533F" />
          <PillWord box={right} text="Wordburn" at={local(i, 29.98)} size={0.4} pop={0.4} />
        </>
      ),
    };
  },

  // "…and that's the word that pops."
  s09: (i, d) => ({
    svg: <PillWord box={biggest(d.yellow)} text="pops" at={local(i, 34.5)} size={0.62} pop={0.7} />,
  }),

  // "Pick a look," — the real style sheet, then the drawing.
  s10: (i) => ({
    html: (
      <TapedShot src="drawmylife/shot-style.jpg" ratio={762 / 900} width={760} centerY={760} at={local(i, 35.25)} out={local(i, 36.05)} />
    ),
  }),

  // "No account. No card. No ads." — a marker circle round each.
  s11: (i, d) => {
    const band = d.coral.filter((b) => cy(b) > d.h * 0.33 && cy(b) < d.h * 0.52);
    const third = (n: number) => union(band.filter((b) => Math.floor(((b.x0 + b.x1) / 2 / d.w) * 3) === n));
    return {
      svg: (
        <>
          <Circle box={third(0)} at={local(i, 41.78)} />
          <Circle box={third(1)} at={local(i, 42.56)} />
          <Circle box={third(2)} at={local(i, 43.3)} />
        </>
      ),
    };
  },

  // "Wordburn. Get it free on Google Play."
  s13: (i, d) => {
    const logo = biggest(d.yellow, (b) => cy(b) < d.h * 0.35);
    const badge = { x0: 232, y0: 1320, x1: 708, y1: 1437 };
    return {
      svg: (
        <>
          <Label x={logo.x1 + 26} y={cy(logo) + 2} text="Wordburn" at={local(i, 49.45)} size={58} anchor="start" />
          <Label x={(badge.x0 + badge.x1) / 2} y={badge.y0 + 36} text="GET IT FREE ON" at={local(i, 50.45)} size={22} weight={font.semibold} spacing={3} />
          <Label x={(badge.x0 + badge.x1) / 2} y={badge.y0 + 78} text="Google Play" at={local(i, 51.1)} size={46} />
        </>
      ),
    };
  },
};

/** Hold the first frame until every picture is decoded, in every render tab. */
const usePreload = () => {
  const [handle] = useState(() => delayRender('decoding the drawings'));
  useEffect(() => {
    const files = [
      ...DATA.flatMap((d) => [`drawmylife/${d.id}-full.png`, ...d.pieces.map((_, k) => `drawmylife/${d.id}-p${k}.png`)]),
      'drawmylife/shot-editor.jpg',
      'drawmylife/shot-style.jpg',
    ];
    Promise.all(
      files.map((f) => {
        const img = new Image();
        img.src = staticFile(f);
        return img.decode().catch(() => undefined);
      })
    ).then(() => continueRender(handle));
  }, [handle]);
};
