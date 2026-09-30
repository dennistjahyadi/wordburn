/**
 * Remove dead air: the edit list that cuts long pauses and stray fillers out of
 * a clip, from the word timestamps alone.
 *
 * Pure TypeScript. No react-native imports belong in this directory.
 *
 * The output is a list of stretches of the source to keep, in order. The burn-in
 * plays exactly those and nothing between them; `retime` moves a source time
 * onto the shorter clip's timeline so the captions land where the words now are.
 * All integer milliseconds (invariant 7).
 */
import type { SourceRange } from './batch';
import { ENVELOPE_FRAME_MS, speechMedian, toDb } from './envelope';
import type { Language } from './language';
import { normalizeForMatch } from './text';
import type { Ms, Word } from './types';

export interface DeadAirOptions {
  /** A pause longer than this is cut down. */
  maxSilenceMs: Ms;
  /** How much of a cut pause survives on each side of it, so words are not clipped. */
  padMs: Ms;
  /** "like" only counts as a filler with at least this much quiet on one side. */
  isolationMs: Ms;
  /** How far under the speaker's median level the audio must fall to count as silence. */
  quietDb: number;
}

export const DEAD_AIR: DeadAirOptions = {
  maxSilenceMs: 500,
  padMs: 120,
  isolationMs: 250,
  quietDb: -24,
};

/**
 * Where the audio itself is silent, from the loudness envelope.
 *
 * The word timestamps alone cannot find a pause: whisper stretches the last
 * word of a sentence across the silence after it, so "scratch." ran from 9.9 s
 * to 10.7 s on a clip where the voice stopped at 10.1 s and the next word
 * started at 10.72 s. The envelope does not guess. A stretch counts when every
 * frame in it sits `quietDb` or more under the speaker's median level, and it
 * lasts longer than `maxSilenceMs`.
 */
export function quietStretches(
  envelope: Float32Array,
  words: Word[],
  range: SourceRange,
  opts: Partial<DeadAirOptions> = {}
): SourceRange[] {
  const config = { ...DEAD_AIR, ...opts };
  const reference = speechMedian(
    envelope,
    words.filter((word) => word.start >= range.startMs && word.end <= range.endMs)
  );
  if (!(reference > 0)) return [];

  const first = Math.max(0, Math.floor(range.startMs / ENVELOPE_FRAME_MS));
  const last = Math.min(envelope.length, Math.ceil(range.endMs / ENVELOPE_FRAME_MS));
  const stretches: SourceRange[] = [];
  let open: number | null = null;

  for (let frame = first; frame <= last; frame += 1) {
    const quiet = frame < last && toDb(envelope[frame], reference) <= config.quietDb;
    if (quiet && open === null) open = frame;
    if (!quiet && open !== null) {
      const startMs = open * ENVELOPE_FRAME_MS;
      const endMs = frame * ENVELOPE_FRAME_MS;
      if (endMs - startMs > config.maxSilenceMs) stretches.push({ startMs, endMs });
      open = null;
    }
  }
  return stretches;
}

/** Sounds that are never words, per language. */
const FILLERS: Readonly<Record<Language, ReadonlySet<string>>> = {
  en: new Set(['um', 'umm', 'uh', 'uhh', 'erm', 'er', 'ah', 'hmm', 'mm']),
  es: new Set(['eh', 'em', 'mm', 'este']),
  de: new Set(['äh', 'ähm', 'hm', 'hmm', 'öhm']),
  nl: new Set(['eh', 'uh', 'ehm', 'uhm', 'hm']),
  id: new Set(['eh', 'em', 'hmm', 'anu', 'emm']),
};

/** Words that are sometimes fillers and sometimes not, counted only when isolated. */
const SOMETIMES: Readonly<Record<Language, ReadonlySet<string>>> = {
  en: new Set(['like']),
  es: new Set(['bueno', 'pues']),
  de: new Set(['also']),
  nl: new Set(['nou']),
  id: new Set(['gitu', 'kayak']),
};

export interface DeadAirEdit {
  /** What to keep, in source time. */
  segments: SourceRange[];
  /** The words that were cut as fillers. */
  removedWordIds: string[];
  originalMs: Ms;
  keptMs: Ms;
}

/**
 * Whether a word is a filler worth cutting.
 *
 * "um" always is. "like" only when it stands alone — set off by a comma or a
 * pause — because "I like this" is a sentence and "it was, like, huge" is a
 * tic, and cutting the first would change what somebody said.
 */
export function isFiller(words: Word[], index: number, language: Language, opts: DeadAirOptions = DEAD_AIR): boolean {
  const word = words[index];
  const normalized = normalizeForMatch(word.text);
  if (FILLERS[language].has(normalized)) return true;
  if (!SOMETIMES[language].has(normalized)) return false;

  const before = words[index - 1];
  const after = words[index + 1];
  const commaBefore = !!before && /,$/.test(before.text);
  const commaAfter = /,$/.test(word.text);
  const quietBefore = !before || word.start - before.end >= opts.isolationMs;
  const quietAfter = !after || after.start - word.end >= opts.isolationMs;
  return commaBefore || commaAfter || quietBefore || quietAfter;
}

/**
 * The edit list for one range of a transcript.
 *
 * The first kept stretch opens at the range's start and the last closes at its
 * end, so the clip is exactly as long as asked for minus what was cut. Between
 * two kept words a pause longer than `maxSilenceMs` keeps `padMs` either side
 * and loses the middle; a removed filler becomes part of the pause around it.
 */
export function deadAirEdit(
  words: Word[],
  range: SourceRange,
  language: Language,
  opts: Partial<DeadAirOptions> = {},
  quiet: SourceRange[] = []
): DeadAirEdit {
  const config = { ...DEAD_AIR, ...opts };
  const inRange = words
    .map((word, index) => ({ word, index }))
    .filter(({ word }) => word.start >= range.startMs && word.end <= range.endMs);

  const removed = new Set<string>();
  for (const { index } of inRange) {
    if (isFiller(words, index, language, config)) removed.add(words[index].id);
  }
  const kept = inRange.map(({ word }) => word).filter((word) => !removed.has(word.id));

  const originalMs = range.endMs - range.startMs;
  if (kept.length === 0) {
    return { segments: [{ ...range }], removedWordIds: [], originalMs, keptMs: originalMs };
  }

  // Every stretch to cut, before padding: long gaps between kept words (a
  // removed filler becomes part of the gap around it) and long silences the
  // envelope heard, which catches the pauses whisper hid inside a word's span.
  const cuts: SourceRange[] = [];
  for (let index = 0; index < kept.length - 1; index += 1) {
    const current = kept[index];
    const next = kept[index + 1];
    if (next.start - current.end > config.maxSilenceMs) cuts.push({ startMs: current.end, endMs: next.start });
  }
  cuts.push(...quiet.filter((stretch) => stretch.endMs - stretch.startMs > config.maxSilenceMs));

  // Padded, clipped to the range, and merged where they touch.
  const padded = cuts
    .map((cut) => ({
      startMs: Math.max(range.startMs, cut.startMs + config.padMs),
      endMs: Math.min(range.endMs, cut.endMs - config.padMs),
    }))
    .filter((cut) => cut.endMs > cut.startMs)
    .sort((a, b) => a.startMs - b.startMs);
  const merged: SourceRange[] = [];
  for (const cut of padded) {
    const previous = merged[merged.length - 1];
    if (previous && cut.startMs <= previous.endMs) previous.endMs = Math.max(previous.endMs, cut.endMs);
    else merged.push({ ...cut });
  }

  const segments: SourceRange[] = [];
  let open = range.startMs;
  for (const cut of merged) {
    if (cut.startMs > open) segments.push({ startMs: open, endMs: cut.startMs });
    open = Math.max(open, cut.endMs);
  }
  if (range.endMs > open) segments.push({ startMs: open, endMs: range.endMs });

  const keptMs = segments.reduce((sum, segment) => sum + segment.endMs - segment.startMs, 0);
  return { segments, removedWordIds: [...removed], originalMs, keptMs };
}

/**
 * A source time on the cut clip's timeline, or null when that moment was cut.
 *
 * Each kept stretch starts where the previous one ended on the new timeline,
 * so the clip is the stretches laid end to end with nothing between them.
 */
export function retime(sourceMs: Ms, segments: SourceRange[]): Ms | null {
  let offset = 0;
  for (const segment of segments) {
    if (sourceMs >= segment.startMs && sourceMs <= segment.endMs) {
      return offset + (sourceMs - segment.startMs);
    }
    offset += segment.endMs - segment.startMs;
  }
  return null;
}

/**
 * The words of a cut, on the cut's own timeline.
 *
 * A word is kept when its start survived the cut and it was not removed as a
 * filler; its end is clamped to the stretch it started in, which only matters
 * for a word whose tail ran into a pause that was trimmed. Text, confidence and
 * every user edit ride along untouched (invariant 1: moving a clip is not
 * editing a word).
 */
export function wordsForCut(words: Word[], segments: SourceRange[], removedWordIds: readonly string[] = []): Word[] {
  const removed = new Set(removedWordIds);
  const result: Word[] = [];

  for (const word of words) {
    if (removed.has(word.id)) continue;
    // A word whose timestamp starts inside a cut silence really starts where the
    // sound resumes — whisper's start times drift into the pause before a word
    // as its end times drift into the pause after one. It moves to the next kept
    // stretch rather than being dropped, if it reaches that far.
    const containing = segments.find((candidate) => word.start >= candidate.startMs && word.start <= candidate.endMs);
    const segment =
      containing ?? segments.find((candidate) => candidate.startMs > word.start && candidate.startMs < word.end);
    if (!segment) continue;

    const start = retime(Math.max(word.start, segment.startMs), segments)!;
    const end = retime(Math.min(word.end, segment.endMs), segments)!;
    result.push({ ...word, start, end: Math.max(end, start + 1) });
  }

  return result;
}
