/**
 * The eight dictionaries against the English one.
 *
 * The type system already refuses a missing key. What it cannot refuse is a
 * key that was copied from English and never translated, a function that
 * returns an empty string for some count, or a preset name for a preset that
 * does not exist. These are those checks.
 */
import { STYLE_PRESETS, LANGUAGES } from '../../domain';
import { ALL_DICTIONARIES, presetName, type Copy } from '..';
import { en } from '../en';

type Node = string | string[] | ((...args: never[]) => string) | { [key: string]: Node };

/**
 * Every leaf under `node`, as `path → value`, so a failure names the key.
 *
 * The preset-name map is the one place a dictionary may say more or less than
 * English — it is opt-in by design — so it is one leaf, not one per preset.
 */
function leaves(node: Node, path: string[] = []): [string, Node][] {
  if (typeof node === 'string' || typeof node === 'function' || Array.isArray(node)) {
    return [[path.join('.'), node]];
  }
  if (path.join('.') === 'stylePicker.presets') return [[path.join('.'), 'presets']];
  return Object.entries(node).flatMap(([key, child]) => leaves(child, [...path, key]));
}

/**
 * Exercises a dictionary function with each shape of argument list the
 * dictionary uses — a count first, or a name first — and hands back what every
 * shape that applied returned. A shape that does not apply throws (a number
 * has no `toLowerCase`) and is skipped; at least one must apply.
 */
function outputs(fn: (...args: never[]) => string): string[] {
  const loose = fn as (...args: unknown[]) => string;
  const shapes: unknown[][] = [
    ...[0, 1, 2, 5, 12, 22, 100].map((count) => [count, 'Beta', 7]),
    ...[0, 1, 2, 5, 12, 22, 100].map((count) => [count, true]),
    ['Alpha', 'Beta', 7],
    ['Alpha', 'Beta', null],
    ['Alpha', 12],
  ];
  const results: string[] = [];
  for (const args of shapes) {
    try {
      results.push(loose(...args));
    } catch {
      // Not this shape.
    }
  }
  return results;
}

const locales = Object.keys(ALL_DICTIONARIES) as (keyof typeof ALL_DICTIONARIES)[];
const others = locales.filter((locale) => locale !== 'en');

describe('every dictionary has the English shape', () => {
  const english = leaves(en as unknown as Node);

  it.each(others)('%s has every English key and no extra ones', (locale) => {
    const theirs = leaves(ALL_DICTIONARIES[locale] as unknown as Node);
    expect(theirs.map(([path]) => path).sort()).toEqual(english.map(([path]) => path).sort());
  });

  it.each(others)('%s has the same kind of value at every key', (locale) => {
    const theirs = new Map(leaves(ALL_DICTIONARIES[locale] as unknown as Node));
    for (const [path, value] of english) {
      const other = theirs.get(path);
      expect([path, typeof other]).toEqual([path, typeof value]);
      if (Array.isArray(value)) expect(Array.isArray(other)).toBe(true);
    }
  });
});

describe('no dictionary says nothing', () => {
  it.each(locales)('%s: every string is non-empty and every function returns one', (locale) => {
    for (const [path, value] of leaves(ALL_DICTIONARIES[locale] as unknown as Node)) {
      if (typeof value === 'string') {
        // Preset names are an opt-in map and may be empty.
        if (!path.startsWith('stylePicker.presets')) expect([path, value.trim()]).not.toEqual([path, '']);
      } else if (Array.isArray(value)) {
        expect(value.length).toBeGreaterThan(0);
        value.forEach((entry) => expect(entry.trim()).not.toBe(''));
      } else if (typeof value === 'function') {
        const results = outputs(value);
        expect([path, results.length > 0]).toEqual([path, true]);
        for (const out of results) {
          expect([path, typeof out, out.trim() === '']).toEqual([path, 'string', false]);
        }
      }
    }
  });
});

describe('the dictionaries are translated, not copied', () => {
  /**
   * A handful of keys that no language shares with English. "OK", "Pro" and
   * "TikTok" are the same everywhere, so the sample avoids them.
   */
  const MUST_DIFFER = [
    'common.back',
    'common.cancel',
    'common.delete',
    'welcome.headline',
    'welcome.start',
    'home.newVideo',
    'settings.title',
    'languages.fieldLabel',
    'editor.undo',
    'export.saveToGallery',
    'feedback.title',
    'dictionary.title',
  ];

  it.each(others)('%s differs from English on the keys that must differ', (locale) => {
    const theirs = new Map(leaves(ALL_DICTIONARIES[locale] as unknown as Node));
    const english = new Map(leaves(en as unknown as Node));
    for (const path of MUST_DIFFER) {
      expect([locale, path, theirs.get(path)]).not.toEqual([locale, path, english.get(path)]);
    }
  });

  it.each(others)('%s names all nine languages, in its own words', (locale) => {
    const names = ALL_DICTIONARIES[locale].languageNames;
    for (const language of LANGUAGES) {
      expect(names[language.code]).toBeTruthy();
    }
    // At least the big neighbours must not be the English word.
    expect(names.nl).not.toBe('Dutch');
    expect(names.de).not.toBe('German');
    expect(names.es).not.toBe('Spanish');
  });

  it('every language names itself as the domain spells it, or close enough to recognise', () => {
    // The domain's native names are what the picker shows; each dictionary's
    // own-name entry is what Settings shows, and the two may differ by case or
    // by a "Bahasa" in front, but the word itself has to be there.
    for (const language of LANGUAGES) {
      const own = ALL_DICTIONARIES[language.code].languageNames[language.code].toLowerCase();
      expect(language.native.toLowerCase()).toContain(own);
    }
  });
});

describe('preset names', () => {
  it.each(locales)('%s only names presets that exist', (locale) => {
    const ids = new Set(STYLE_PRESETS.map((preset) => preset.id));
    for (const id of Object.keys(ALL_DICTIONARIES[locale].stylePicker.presets)) {
      expect([locale, id, ids.has(id)]).toEqual([locale, id, true]);
    }
  });

  it('falls back to the preset’s own name where a dictionary says nothing', () => {
    expect(presetName('focus', en)).toBe('Focus');
    expect(presetName('box', en)).toBe('Box highlight');
    expect(presetName('box', ALL_DICTIONARIES.fr)).toBe('Encadré');
    expect(presetName('focus', ALL_DICTIONARIES.fr)).toBe('Focus');
    expect(presetName('no-such-preset', en)).toBe('no-such-preset');
  });
});

describe('counts', () => {
  it('pluralises in English', () => {
    expect(en.common.words(1)).toBe('1 word');
    expect(en.common.words(2)).toBe('2 words');
  });

  it('pluralises in Polish, teens included', () => {
    const { words } = ALL_DICTIONARIES.pl.common;
    expect(words(1)).toBe('1 słowo');
    expect(words(2)).toBe('2 słowa');
    expect(words(4)).toBe('4 słowa');
    expect(words(5)).toBe('5 słów');
    expect(words(12)).toBe('12 słów');
    expect(words(22)).toBe('22 słowa');
    expect(words(100)).toBe('100 słów');
  });

  it('keeps the shape a screen indexes into', () => {
    // These are indexed by a union elsewhere; a dictionary that renamed a key
    // would fail the typecheck, and this pins the keys the screens rely on.
    const keys = (copy: Copy) => ({
      status: Object.keys(copy.batch.status).sort(),
      paused: Object.keys(copy.batch.paused).sort(),
      stage: Object.keys(copy.processing.stage).sort(),
      plan: Object.keys(copy.pro.plan).sort(),
      period: Object.keys(copy.pro.perPeriod).sort(),
    });
    for (const locale of others) expect(keys(ALL_DICTIONARIES[locale])).toEqual(keys(en));
  });
});
