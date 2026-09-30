/**
 * Auto clip: finding the short clips worth posting inside a long video.
 *
 * Pure TypeScript. No react-native imports belong in this directory.
 *
 * Three steps, each replaceable on its own. `sentenceUnits` cuts the transcript
 * where a sentence ends or the speaker stops for long enough; `clipCandidates`
 * joins runs of those units into every window of the right length; a
 * `ClipScorer` scores each window; `pickClips` takes the best that do not
 * overlap. A clip therefore always starts on the first word of a sentence and
 * ends on the last word of one — never in the middle of a word, and never in
 * the middle of a thought if the transcript can say where thoughts end.
 *
 * The scorer is a heuristic and says so. It is a class with its weights in the
 * open so a better one — a model, or the same rules tuned on what users keep —
 * can replace it without anything else here noticing.
 */
import type { Language } from './language';
import { endsSentence, normalizeForMatch } from './text';
import { isStopword } from './stopwords';
import type { Ms, Word } from './types';

export interface AutoClipOptions {
  minMs: Ms;
  maxMs: Ms;
  /** A pause at least this long ends a unit even without a full stop. */
  silenceMs: Ms;
  /** How many clips to suggest. */
  count: number;
}

export const AUTO_CLIP: AutoClipOptions = {
  minMs: 20_000,
  maxMs: 60_000,
  silenceMs: 700,
  count: 10,
};

/** A run of words that belong together: one sentence, or one breath. */
export interface Unit {
  first: number;
  last: number;
  startMs: Ms;
  endMs: Ms;
  /** False when the unit was ended by a pause or a split rather than a full stop. */
  complete: boolean;
}

export interface ClipCandidate {
  /** Word indices, inclusive, into the transcript the candidate came from. */
  first: number;
  last: number;
  startMs: Ms;
  endMs: Ms;
  endsOnSentence: boolean;
}

export interface ScoredClip extends ClipCandidate {
  /** 0..100, for showing and sorting. */
  score: number;
  /** Which features contributed, for the list and for tuning. */
  reasons: ClipReason[];
}

export type ClipReason = 'hook' | 'question' | 'dense' | 'repeats' | 'complete' | 'intro' | 'outro';

/**
 * Splits the transcript into units at sentence ends and long pauses.
 *
 * A unit longer than half the longest clip is split again at its widest gap,
 * and again, until it is not: a speaker who never lets a full stop into the
 * transcript would otherwise produce one unit the length of the episode, and a
 * window could never start inside it.
 */
export function sentenceUnits(words: Word[], opts: Partial<AutoClipOptions> = {}): Unit[] {
  const config = { ...AUTO_CLIP, ...opts };
  const units: Unit[] = [];
  let first = 0;

  for (let index = 0; index < words.length; index += 1) {
    const word = words[index];
    const next = words[index + 1];
    const sentence = endsSentence(word.text);
    const pause = next ? next.start - word.end >= config.silenceMs : true;

    if (sentence || pause || !next) {
      units.push({ first, last: index, startMs: words[first].start, endMs: word.end, complete: sentence });
      first = index + 1;
    }
  }

  return units.flatMap((unit) => splitLongUnit(words, unit, config.maxMs / 2));
}

function splitLongUnit(words: Word[], unit: Unit, limit: Ms): Unit[] {
  if (unit.endMs - unit.startMs <= limit || unit.last === unit.first) return [unit];

  // The widest gap inside the unit is the likeliest place a breath was taken.
  let cut = unit.first;
  let widest = -1;
  for (let index = unit.first; index < unit.last; index += 1) {
    const gap = words[index + 1].start - words[index].end;
    if (gap > widest) {
      widest = gap;
      cut = index;
    }
  }

  const left: Unit = { first: unit.first, last: cut, startMs: unit.startMs, endMs: words[cut].end, complete: false };
  const right: Unit = { ...unit, first: cut + 1, startMs: words[cut + 1].start };
  return [...splitLongUnit(words, left, limit), ...splitLongUnit(words, right, limit)];
}

/** Every run of whole units between `minMs` and `maxMs` long. */
export function clipCandidates(
  words: Word[],
  units: Unit[],
  opts: Partial<AutoClipOptions> = {}
): ClipCandidate[] {
  const config = { ...AUTO_CLIP, ...opts };
  const candidates: ClipCandidate[] = [];

  for (let start = 0; start < units.length; start += 1) {
    for (let end = start; end < units.length; end += 1) {
      const startMs = units[start].startMs;
      const endMs = units[end].endMs;
      const length = endMs - startMs;
      if (length > config.maxMs) break;
      if (length < config.minMs) continue;
      candidates.push({
        first: units[start].first,
        last: units[end].last,
        startMs,
        endMs,
        endsOnSentence: units[end].complete || endsSentence(words[units[end].last].text),
      });
    }
  }

  return candidates;
}

export interface ScorerWeights {
  hook: number;
  question: number;
  density: number;
  repetition: number;
  completeness: number;
  length: number;
  introOutro: number;
}

export const DEFAULT_WEIGHTS: ScorerWeights = {
  hook: 3,
  question: 2,
  density: 1.5,
  repetition: 1,
  completeness: 1,
  length: 0.5,
  introOutro: -2.5,
};

/** Openings that promise the viewer something, per language. Matched on normalised text. */
export const HOOK_PHRASES: Readonly<Record<Language, readonly string[]>> = {
  en: [
    "here's the thing", 'heres the thing', 'nobody tells you', 'no one tells you', 'the biggest mistake',
    'the truth is', 'the secret', 'stop doing', 'you need to', "you're doing it wrong", 'the problem is',
    'let me tell you', 'this is why', "here's why", 'heres why', 'the reason', 'most people',
    'never', 'the one thing', 'what if', 'i was wrong', 'unpopular opinion',
  ],
  es: ['la verdad es', 'nadie te dice', 'el error más grande', 'el mayor error', 'el secreto', 'la mayoría de la gente', 'deja de', 'esto es lo que'],
  de: ['die wahrheit ist', 'niemand sagt dir', 'der größte fehler', 'das geheimnis', 'die meisten leute', 'hör auf', 'hier ist die sache'],
  nl: ['de waarheid is', 'niemand vertelt je', 'de grootste fout', 'het geheim', 'de meeste mensen', 'stop met'],
  id: ['kesalahan terbesar', 'tidak ada yang bilang', 'rahasianya', 'yang paling penting', 'kebanyakan orang', 'jangan pernah', 'sebenarnya'],
};

/** Words a clip should not open or close on: the channel talking about itself. */
export const INTRO_OUTRO_PHRASES: readonly string[] = [
  'welcome back', 'welcome to', 'subscribe', 'thanks for watching', 'thank you for watching',
  'see you next', 'link in the description', 'link below', "let's get started", 'lets get started',
  'bienvenidos', 'suscríbete', 'gracias por ver', 'willkommen', 'abonnieren', 'danke fürs zuschauen',
  'welkom', 'abonneer', 'bedankt voor het kijken', 'selamat datang', 'jangan lupa subscribe',
  'terima kasih sudah menonton',
];

const QUESTION_OPENERS: Readonly<Record<Language, readonly string[]>> = {
  en: ['what', 'why', 'how', 'who', 'when', 'where', 'did', 'do', 'does', 'have', 'is', 'are', 'can', 'would', 'should'],
  es: ['qué', 'por qué', 'cómo', 'quién', 'cuándo', 'dónde', 'sabes'],
  de: ['was', 'warum', 'wie', 'wer', 'wann', 'wo', 'weißt'],
  nl: ['wat', 'waarom', 'hoe', 'wie', 'wanneer', 'waar', 'weet'],
  id: ['apa', 'kenapa', 'mengapa', 'bagaimana', 'siapa', 'kapan', 'di mana', 'tahu'],
};

/** The first three seconds are the only ones a scroller is guaranteed to see. */
const HOOK_WINDOW_MS = 3000;
/** How close to either end of the video a clip counts as intro or outro. */
const EDGE_MS = 60_000;

export interface ScoreContext {
  words: Word[];
  durationMs: Ms;
  language: Language;
}

/**
 * Scores a candidate clip. A class so the rules can be swapped whole.
 *
 * Each feature is squeezed into 0..1 before it is weighted, so a weight means
 * the same thing for every feature and the total can be read as a percentage
 * of the best a clip could score.
 */
export class ClipScorer {
  constructor(readonly weights: ScorerWeights = DEFAULT_WEIGHTS) {}

  score(candidate: ClipCandidate, context: ScoreContext): ScoredClip {
    const { words, durationMs, language } = context;
    const clipWords = words.slice(candidate.first, candidate.last + 1);
    const reasons: ClipReason[] = [];
    const w = this.weights;
    let total = 0;

    const opening = clipWords.filter((word) => word.start < candidate.startMs + HOOK_WINDOW_MS);
    const openingText = ` ${opening.map((word) => normalizeForMatch(word.text)).join(' ')} `;

    if (HOOK_PHRASES[language].some((phrase) => openingText.includes(` ${normalizePhrase(phrase)} `))) {
      total += w.hook;
      reasons.push('hook');
    }

    const asks = opening.some((word) => /\?/.test(word.text)) ||
      QUESTION_OPENERS[language].some((opener) => openingText.startsWith(` ${normalizePhrase(opener)} `));
    if (asks) {
      total += w.question;
      reasons.push('question');
    }

    const seconds = Math.max(1, (candidate.endMs - candidate.startMs) / 1000);
    const density = clamp01((clipWords.length / seconds - 1.5) / 2);
    total += w.density * density;
    if (density > 0.6) reasons.push('dense');

    const repetition = clamp01(repeatedKeywords(clipWords, language) / 6);
    total += w.repetition * repetition;
    if (repetition >= 0.5) reasons.push('repeats');

    if (candidate.endsOnSentence) {
      total += w.completeness;
      reasons.push('complete');
    }

    // Mildly prefers the middle of the allowed range: long enough to land a
    // point, short enough to be watched to the end.
    const ideal = 37_500;
    total += w.length * clamp01(1 - Math.abs(candidate.endMs - candidate.startMs - ideal) / 22_500);

    const text = ` ${clipWords.map((word) => normalizeForMatch(word.text)).join(' ')} `;
    const talksAboutChannel = INTRO_OUTRO_PHRASES.some((phrase) => text.includes(` ${normalizePhrase(phrase)} `));
    if (candidate.startMs < EDGE_MS || talksAboutChannel) {
      total += w.introOutro * (talksAboutChannel ? 1 : 0.5);
      reasons.push('intro');
    }
    if (durationMs - candidate.endMs < EDGE_MS) {
      total += w.introOutro * 0.5;
      reasons.push('outro');
    }

    const best = w.hook + w.question + w.density + w.repetition + w.completeness + w.length;
    const score = Math.round(clamp01(total / best) * 100);
    return { ...candidate, score, reasons };
  }
}

/** Content words said twice or more in the clip: what the clip is about. */
function repeatedKeywords(words: Word[], language: Language): number {
  const counts = new Map<string, number>();
  for (const word of words) {
    const normalized = normalizeForMatch(word.text);
    if (normalized.length < 4 || isStopword(normalized, language)) continue;
    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  }
  let repeated = 0;
  for (const count of counts.values()) if (count >= 2) repeated += count;
  return repeated;
}

function normalizePhrase(phrase: string): string {
  return phrase.split(/\s+/).map(normalizeForMatch).join(' ');
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/**
 * The best clips that do not overlap, best first.
 *
 * Greedy, which is enough: the candidates overlap heavily and the good ones
 * cluster, so the best clip in each cluster is taken and its neighbours fall
 * away. Two clips that share any second of video are never both suggested.
 */
export function pickClips(scored: ScoredClip[], count: number = AUTO_CLIP.count): ScoredClip[] {
  const sorted = [...scored].sort((a, b) => b.score - a.score || a.startMs - b.startMs);
  const picked: ScoredClip[] = [];

  for (const clip of sorted) {
    if (picked.length >= count) break;
    if (picked.some((other) => clip.startMs < other.endMs && other.startMs < clip.endMs)) continue;
    picked.push(clip);
  }

  return picked;
}

/** The whole pipeline: a transcript in, the suggestions out. */
export function suggestClips(
  words: Word[],
  durationMs: Ms,
  language: Language,
  scorer: ClipScorer = new ClipScorer(),
  opts: Partial<AutoClipOptions> = {}
): ScoredClip[] {
  const config = { ...AUTO_CLIP, ...opts };
  const units = sentenceUnits(words, config);
  const candidates = clipCandidates(words, units, config);
  const context = { words, durationMs, language };
  return pickClips(
    candidates.map((candidate) => scorer.score(candidate, context)),
    config.count
  );
}

/**
 * Snaps a hand-set range onto word edges: the start moves to the first word
 * that begins at or after it, the end to the last word that ends at or before
 * it. What the user drags is a time; what gets cut is always a set of whole
 * words.
 */
export function snapToWords(words: Word[], startMs: Ms, endMs: Ms): ClipCandidate | null {
  const first = words.findIndex((word) => word.start >= startMs);
  let last = -1;
  for (let index = words.length - 1; index >= 0; index -= 1) {
    if (words[index].end <= endMs) {
      last = index;
      break;
    }
  }
  if (first < 0 || last < first) return null;
  return {
    first,
    last,
    startMs: words[first].start,
    endMs: words[last].end,
    endsOnSentence: endsSentence(words[last].text),
  };
}
