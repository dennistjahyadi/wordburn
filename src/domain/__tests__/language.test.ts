import { word } from '../__fixtures__/project';
import { EXCLUDED, scoreEmphasis } from '../emphasis';
import type { FeatureSet } from '../features';
import {
  DOWNLOADED_LANGUAGES,
  isLanguage,
  LANGUAGES,
  languageFromLocale,
  languageName,
  needsDownloadedModel,
  OTHER_STOPWORDS,
  projectLanguage,
} from '../language';
import { isStopword } from '../stopwords';

const flat: FeatureSet = { byId: new Map(), speechMedian: 0.1, medianMsPerChar: 50 };

describe('which language a clip is in', () => {
  it('reads a project made before languages existed as English', () => {
    expect(projectLanguage({})).toBe('en');
    expect(projectLanguage({ language: 'id' })).toBe('id');
  });

  it('knows the nine and nothing else', () => {
    expect(['en', 'es', 'de', 'nl', 'id', 'fr', 'it', 'pt', 'pl'].every(isLanguage)).toBe(true);
    expect(isLanguage('ro')).toBe(false);
    expect(isLanguage('ru')).toBe(false);
    expect(languageName('nl')).toBe('Dutch');
    expect(languageName('pt')).toBe('Portuguese');
  });

  it('lists English first and the rest alphabetically', () => {
    expect(LANGUAGES[0].code).toBe('en');
    const rest = LANGUAGES.slice(1).map((language) => language.name);
    expect(rest).toEqual([...rest].sort());
  });

  it('guesses a language from the phone’s locale, and only one it supports', () => {
    expect(languageFromLocale('pt-BR')).toBe('pt');
    expect(languageFromLocale('es_MX')).toBe('es');
    expect(languageFromLocale('id-ID')).toBe('id');
    expect(languageFromLocale('in-ID')).toBe('id');
    expect(languageFromLocale('en-US')).toBe('en');
    expect(languageFromLocale('ro-RO')).toBeNull();
    expect(languageFromLocale('')).toBeNull();
    expect(languageFromLocale(undefined)).toBeNull();
  });

  it('sends only English to the bundled model', () => {
    expect(needsDownloadedModel('en')).toBe(false);
    expect(DOWNLOADED_LANGUAGES.map((language) => language.code).sort()).toEqual(
      ['de', 'es', 'fr', 'id', 'it', 'nl', 'pl', 'pt'],
    );
  });
});

describe('emphasis in other languages', () => {
  it('bars each language’s own function words and not another’s', () => {
    expect(isStopword('und', 'de')).toBe(true);
    expect(isStopword('und', 'en')).toBe(false);
    expect(isStopword('the', 'es')).toBe(false);
    expect(isStopword('yang', 'id')).toBe(true);
    expect(isStopword('het', 'nl')).toBe(true);
    expect(isStopword("c'est", 'fr')).toBe(true);
    expect(isStopword('della', 'it')).toBe(true);
    expect(isStopword('você', 'pt')).toBe(true);
    expect(isStopword('się', 'pl')).toBe(true);
    expect(isStopword('della', 'pt')).toBe(false);
  });

  it('lists every stopword in the form normalizeForMatch leaves it: lowercase, no punctuation but apostrophes', () => {
    for (const list of Object.values(OTHER_STOPWORDS)) {
      for (const entry of list) expect(entry).toBe(entry.toLowerCase().replace(/[^\p{L}']/gu, ''));
    }
  });

  it('never makes a Spanish article the big word', () => {
    const words = [
      word({ id: 'a', text: 'Compré', start: 0, end: 400 }),
      word({ id: 'b', text: 'la', start: 400, end: 800 }),
    ];
    expect(scoreEmphasis(words, flat, [], {}, 'es').get('b')).toBe(EXCLUDED);
  });

  it('does not read a German noun’s capital letter as a name', () => {
    const words = [
      word({ id: 'a', text: 'wir', start: 0, end: 400 }),
      word({ id: 'b', text: 'kaufen', start: 400, end: 800 }),
      word({ id: 'c', text: 'Brot', start: 800, end: 1200 }),
    ];
    const german = scoreEmphasis(words, flat, [], {}, 'de').get('c')!;
    const english = scoreEmphasis(words, flat, [], {}, 'en').get('c')!;
    expect(english - german).toBeCloseTo(0.4);
  });
});
