import { word } from '../__fixtures__/project';
import { deadAirEdit, isFiller, quietStretches, retime, wordsForCut } from '../deadair';
import type { Word } from '../types';

const w = (id: string, text: string, start: number, end: number): Word => word({ id, text, start, end });

describe('fillers', () => {
  it('always cuts "um" and "uh"', () => {
    const words = [w('a', 'so', 0, 200), w('b', 'um', 300, 500), w('c', 'yes', 600, 800)];
    expect(isFiller(words, 1, 'en')).toBe(true);
  });

  it('cuts "like" only when it stands alone', () => {
    const tic = [w('a', 'was,', 0, 200), w('b', 'like,', 300, 500), w('c', 'huge', 600, 800)];
    const verb = [w('a', 'I', 0, 100), w('b', 'like', 150, 400), w('c', 'this', 450, 700)];
    expect(isFiller(tic, 1, 'en')).toBe(true);
    expect(isFiller(verb, 1, 'en')).toBe(false);
  });

  it('knows each language’s own fillers', () => {
    expect(isFiller([w('a', 'ähm', 0, 300)], 0, 'de')).toBe(true);
    expect(isFiller([w('a', 'um', 0, 300)], 0, 'de')).toBe(false);
  });
});

describe('the edit list', () => {
  const words = [
    w('a', 'First', 1_000, 1_400),
    w('b', 'point.', 1_500, 1_900),
    // 2.1 s of silence
    w('c', 'Um,', 4_000, 4_300),
    w('d', 'second', 4_400, 4_800),
    w('e', 'point.', 4_900, 5_300),
  ];
  const range = { startMs: 1_000, endMs: 5_300 };

  it('cuts a pause longer than half a second down to its padding', () => {
    const edit = deadAirEdit(words, range, 'en');
    expect(edit.segments).toEqual([
      { startMs: 1_000, endMs: 1_900 + 120 },
      { startMs: 4_400 - 120, endMs: 5_300 },
    ]);
  });

  it('treats a removed filler as part of the pause around it', () => {
    expect(deadAirEdit(words, range, 'en').removedWordIds).toEqual(['c']);
  });

  it('says how long the clip was and how long it is now', () => {
    const edit = deadAirEdit(words, range, 'en');
    expect(edit.originalMs).toBe(4_300);
    expect(edit.keptMs).toBe(1_020 + 1_020);
  });

  it('leaves a clip with no long pauses whole', () => {
    const tight = [w('a', 'One', 0, 300), w('b', 'two', 400, 700)];
    expect(deadAirEdit(tight, { startMs: 0, endMs: 700 }, 'en').segments).toEqual([{ startMs: 0, endMs: 700 }]);
  });

  it('keeps everything in integer milliseconds', () => {
    for (const s of deadAirEdit(words, range, 'en').segments) {
      expect(Number.isInteger(s.startMs) && Number.isInteger(s.endMs)).toBe(true);
    }
  });
});

describe('retiming onto the cut', () => {
  const segments = [
    { startMs: 1_000, endMs: 2_000 },
    { startMs: 5_000, endMs: 6_000 },
  ];

  it('lays the kept stretches end to end', () => {
    expect(retime(1_000, segments)).toBe(0);
    expect(retime(1_500, segments)).toBe(500);
    expect(retime(5_000, segments)).toBe(1_000);
    expect(retime(5_999, segments)).toBe(1_999);
  });

  it('has no answer for a moment that was cut', () => {
    expect(retime(3_000, segments)).toBeNull();
  });

  it('moves the words onto the new timeline without touching their text', () => {
    const words = [w('a', 'Hello', 1_100, 1_500), w('b', 'gone', 3_000, 3_300), w('c', 'there', 5_100, 5_400)];
    const cut = wordsForCut(words, segments);
    expect(cut.map((x) => [x.id, x.text, x.start, x.end])).toEqual([
      ['a', 'Hello', 100, 500],
      ['c', 'there', 1_100, 1_400],
    ]);
  });

  it('drops the fillers the edit removed', () => {
    const words = [w('a', 'Hello', 1_100, 1_500), w('b', 'um', 1_600, 1_800)];
    expect(wordsForCut(words, segments, ['b']).map((x) => x.id)).toEqual(['a']);
  });
});

describe('silence the timestamps hide', () => {
  // Speech at 0.1 from 0–1.0 s and 2.2–3.0 s, true silence between. whisper
  // stretched "scratch." across the pause, so no gap between words exists.
  const envelope = new Float32Array(300).map((_, frame) => (frame < 100 || frame >= 220 ? 0.1 : 0.0005));
  const words = [
    w('a', 'from', 0, 400),
    w('b', 'scratch.', 500, 2150),
    w('c', 'My', 2150, 2500),
    w('d', 'turn.', 2500, 3000),
  ];
  const range = { startMs: 0, endMs: 3000 };

  it('finds the silence in the audio when the words run straight through it', () => {
    expect(deadAirEdit(words, range, 'en').segments).toEqual([range]);
    expect(quietStretches(envelope, words, range)).toEqual([{ startMs: 1000, endMs: 2200 }]);
  });

  it('cuts it down to its padding either side', () => {
    const edit = deadAirEdit(words, range, 'en', {}, quietStretches(envelope, words, range));
    expect(edit.segments).toEqual([
      { startMs: 0, endMs: 1_120 },
      { startMs: 2_080, endMs: 3_000 },
    ]);
    expect(edit.keptMs).toBe(3_000 - 960);
  });

  it('keeps a word whose start drifted into the cut, at the point the sound comes back', () => {
    const segments = [
      { startMs: 0, endMs: 1_120 },
      { startMs: 2_300, endMs: 3_000 },
    ];
    const cut = wordsForCut(words, segments);
    expect(cut.map((x) => x.id)).toEqual(['a', 'b', 'c', 'd']);
    expect(cut.find((x) => x.id === 'c')).toMatchObject({ start: 1_120 });
  });

  it('finds nothing in audio that never goes quiet', () => {
    expect(quietStretches(new Float32Array(300).fill(0.1), words, range)).toEqual([]);
  });
});
