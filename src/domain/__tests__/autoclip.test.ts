import { word } from '../__fixtures__/project';
import {
  ClipScorer,
  clipCandidates,
  DEFAULT_WEIGHTS,
  pickClips,
  sentenceUnits,
  snapToWords,
  suggestClips,
  type ClipCandidate,
} from '../autoclip';
import type { Word } from '../types';

/**
 * A transcript built from sentences, each word 300 ms with 100 ms between words
 * and `pauseMs` after each sentence.
 */
function transcript(sentences: string[], startMs = 0, pauseMs = 400): Word[] {
  const words: Word[] = [];
  let t = startMs;
  for (const sentence of sentences) {
    const texts = sentence.split(' ');
    texts.forEach((text, index) => {
      words.push(word({ id: `w${words.length}`, text, start: t, end: t + 300 }));
      t += 300 + (index === texts.length - 1 ? pauseMs : 100);
    });
  }
  return words;
}

const filler = 'and then we talked about the plan for a while longer.';

describe('units', () => {
  it('ends a unit at a full stop and at a long pause, never inside a word', () => {
    const words = transcript(['One two three.', 'four five'], 0, 1000);
    const units = sentenceUnits(words);
    expect(units.map((u) => [u.first, u.last])).toEqual([
      [0, 2],
      [3, 4],
    ]);
    expect(units[0].complete).toBe(true);
    expect(units[1].complete).toBe(false);
  });

  it('splits a run-on with no punctuation at its widest gaps until it is short enough', () => {
    const words: Word[] = [];
    for (let i = 0; i < 200; i += 1) {
      const gap = i % 25 === 24 ? 600 : 100;
      const start = i === 0 ? 0 : words[i - 1].end + (i % 25 === 0 ? 600 : 100);
      words.push(word({ id: `w${i}`, text: 'word', start, end: start + 300 }));
      void gap;
    }
    const units = sentenceUnits(words, { silenceMs: 10_000 });
    expect(units.length).toBeGreaterThan(1);
    for (const unit of units) expect(unit.endMs - unit.startMs).toBeLessThanOrEqual(30_000);
  });
});

describe('candidates', () => {
  const words = transcript(Array.from({ length: 30 }, () => filler));
  const units = sentenceUnits(words);
  const candidates = clipCandidates(words, units);

  it('are all between 20 and 60 seconds', () => {
    expect(candidates.length).toBeGreaterThan(0);
    for (const c of candidates) {
      expect(c.endMs - c.startMs).toBeGreaterThanOrEqual(20_000);
      expect(c.endMs - c.startMs).toBeLessThanOrEqual(60_000);
    }
  });

  it('start on the first word of a unit and end on the last word of one', () => {
    const starts = new Set(units.map((u) => u.first));
    const ends = new Set(units.map((u) => u.last));
    for (const c of candidates) {
      expect(starts.has(c.first)).toBe(true);
      expect(ends.has(c.last)).toBe(true);
      expect(c.startMs).toBe(words[c.first].start);
      expect(c.endMs).toBe(words[c.last].end);
    }
  });
});

describe('the scorer', () => {
  const body = Array.from({ length: 8 }, () => filler);
  const scorer = new ClipScorer();
  const score = (words: Word[], durationMs = 3_600_000) =>
    scorer.score(
      { first: 0, last: words.length - 1, startMs: words[0].start, endMs: words[words.length - 1].end, endsOnSentence: true },
      { words, durationMs, language: 'en' }
    );

  it('rewards a hook phrase in the first three seconds', () => {
    const plain = score(transcript(['So we went.', ...body], 600_000));
    const hooked = score(transcript(["Here's the thing nobody tells you.", ...body], 600_000));
    expect(hooked.score).toBeGreaterThan(plain.score);
    expect(hooked.reasons).toContain('hook');
  });

  it('rewards an opening question', () => {
    const asked = score(transcript(['Why do people quit?', ...body], 600_000));
    expect(asked.reasons).toContain('question');
  });

  it('marks down the channel talking about itself', () => {
    const outro = score(transcript(['Thanks for watching and subscribe.', ...body], 600_000));
    const plain = score(transcript(['So we went.', ...body], 600_000));
    expect(outro.score).toBeLessThan(plain.score);
  });

  it('marks down the first and last minute of the video', () => {
    const early = score(transcript(['So we went.', ...body], 0));
    const middle = score(transcript(['So we went.', ...body], 600_000));
    expect(early.score).toBeLessThan(middle.score);
  });

  it('reads its weights from the constructor, so it can be retuned or replaced', () => {
    const words = transcript(["Here's the thing.", ...body], 600_000);
    const noHooks = new ClipScorer({ ...DEFAULT_WEIGHTS, hook: 0 });
    expect(noHooks.score(
      { first: 0, last: words.length - 1, startMs: words[0].start, endMs: words[words.length - 1].end, endsOnSentence: true },
      { words, durationMs: 3_600_000, language: 'en' }
    ).score).toBeLessThan(score(words).score);
  });

  it('scores on a 0..100 scale', () => {
    const s = score(transcript(["Here's the thing: why?", ...body], 600_000)).score;
    expect(s).toBeGreaterThanOrEqual(0);
    expect(s).toBeLessThanOrEqual(100);
  });
});

describe('picking', () => {
  const clip = (startMs: number, endMs: number, score: number) =>
    ({ first: 0, last: 0, startMs, endMs, endsOnSentence: true, score, reasons: [] }) as ClipCandidate & {
      score: number;
      reasons: [];
    };

  it('never suggests two clips that share a second of video', () => {
    const picked = pickClips([clip(0, 30_000, 90), clip(20_000, 50_000, 95), clip(50_000, 80_000, 80)]);
    expect(picked.map((c) => c.startMs)).toEqual([20_000, 50_000]);
    const again = pickClips([clip(0, 30_000, 90), clip(30_000, 60_000, 80)]);
    expect(again).toHaveLength(2);
  });

  it('suggests at most ten from a long transcript, best first', () => {
    const words = transcript(Array.from({ length: 400 }, (_, i) => (i % 17 === 0 ? "Here's the thing nobody tells you." : filler)), 0);
    const suggestions = suggestClips(words, words[words.length - 1].end + 90_000, 'en');
    expect(suggestions.length).toBe(10);
    for (let i = 1; i < suggestions.length; i += 1) {
      expect(suggestions[i].score).toBeLessThanOrEqual(suggestions[i - 1].score);
    }
  });

  it('suggests nothing from a transcript too short for one clip', () => {
    expect(suggestClips(transcript(['Too short.']), 5_000, 'en')).toEqual([]);
  });
});

describe('a hand-set range', () => {
  const words = transcript(['One two three.', 'four five six.']);

  it('snaps onto whole words, inward', () => {
    const snapped = snapToWords(words, words[0].start + 50, words[4].end + 50);
    expect(snapped).toMatchObject({ first: 1, last: 4, startMs: words[1].start, endMs: words[4].end });
  });

  it('gives nothing when no whole word fits', () => {
    expect(snapToWords(words, words[0].start + 10, words[0].end - 10)).toBeNull();
  });
});
