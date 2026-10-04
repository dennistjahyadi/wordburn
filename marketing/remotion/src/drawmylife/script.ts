/**
 * Video 04, draw my life: the recording's words, the subtitle phrases, and
 * the fourteen drawings cut to them.
 *
 * Word times come from `words.drawmylife.json`, measured once off the
 * ElevenLabs read with faster-whisper (the same recipe as video 03), with two
 * words corrected by hand: "Time" → "Timed" and "GoPro" → "Go Pro".
 */
import words from '../../../video-04-draw-my-life/words.drawmylife.json';

import { buildScript } from '../voiced/script';
import { F, FPS } from '../voiced/time';

export const VOICE = 'drawmylife/voice.mp3';

/** One subtitle per entry; every phrase is subtitled. */
const PHRASE_SIZES = [
  3, 4, 6, 6, 5, 3, 4, 5, 5, 3, 5, 3, 6, 2, 3, 4, 4, 5, 4, 2, 6, 4, 7, 6, 3, 7, 5, 6, 4, 6, 4, 4,
  6, 1, 6,
];

export const SCRIPT = buildScript(
  words,
  PHRASE_SIZES,
  PHRASE_SIZES.map((_, i) => i),
  51.68
);

/** Frames the page takes to slide in: the whiteboard pan between drawings. */
export const PAN = 14;

export type SceneDef = {
  id: string;
  /** Recording second the scene's first word is spoken. */
  word: number;
  /** Recording second the first piece lands, when it should wait for something. */
  drawAt?: number;
  /** Seconds over which the pieces arrive. Defaults to a third of the scene. */
  drawSec?: number;
};

/**
 * In script order. Each scene's page arrives so that the pan has finished
 * just before its first word.
 */
export const SCENES: SceneDef[] = [
  { id: 's00', word: 0 }, // Hi, it's me.
  { id: 's01', word: 1.58 }, // I make short videos…
  { id: 's02', word: 5.74 }, // Typing them by hand…
  { id: 's03', word: 10.04 }, // Upload your video…
  { id: 's04', word: 12.5 }, // Then the credits run out…
  { id: 's05', word: 16.08 }, // So I built my own…
  { id: 's06', word: 19.1 }, // It runs right on your phone…
  { id: 's07', word: 23.4, drawSec: 1.5 }, // Drop in a clip…
  { id: 's08', word: 27.82, drawSec: 1.4 }, // Wrong word?…
  { id: 's09', word: 32.5, drawSec: 1.5 }, // Lean on a word…
  { id: 's10', word: 35.4, drawAt: 36.15, drawSec: 1.5 }, // Pick a look…
  { id: 's11', word: 38.8, drawSec: 1.9 }, // Your first three videos…
  { id: 's12', word: 44.38, drawSec: 1.8 }, // Go Pro…
  { id: 's13', word: 49.2, drawSec: 1.3 }, // Wordburn. Get it free…
];

export const TOTAL_FRAMES = SCRIPT.TOTAL_FRAMES;

/**
 * Each scene's start frame and length. The first scene starts at 0; every
 * later one starts PAN frames (plus a breath) before its first word, so the
 * slide lands as the word does.
 */
export const TIMELINE = SCENES.map((s, i) => {
  const from = i === 0 ? 0 : F(s.word) - PAN - 2;
  const next = SCENES[i + 1];
  const to = next ? F(next.word) - PAN - 2 : TOTAL_FRAMES;
  return { ...s, from, frames: to - from };
});

/** A recording second, as a frame relative to a scene's own start. */
export const local = (sceneIndex: number, sec: number): number => F(sec) - TIMELINE[sceneIndex].from;

export { FPS };
