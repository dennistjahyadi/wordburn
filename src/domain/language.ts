/**
 * The languages a clip can be spoken in.
 *
 * Pure TypeScript. No react-native imports belong in this directory.
 *
 * Five, and the choice is always the user's. Whisper can guess a language, but
 * guessing costs a whole extra encoder pass on every chunk and can change its
 * mind between two chunks of the same clip, so the app never asks it to: the
 * language is picked before the video is and passed on every call.
 *
 * English is transcribed by the model in the APK. The other four share one
 * larger multilingual model that is downloaded once, on request — see
 * `src/asr/models.ts` for which, and `reports/` for why.
 */

export type Language = 'en' | 'es' | 'de' | 'nl' | 'id';

export const LANGUAGES: readonly { code: Language; name: string; native: string }[] = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' },
];

export const DEFAULT_LANGUAGE: Language = 'en';

export function isLanguage(value: unknown): value is Language {
  return LANGUAGES.some((language) => language.code === value);
}

export function languageName(code: Language): string {
  return LANGUAGES.find((language) => language.code === code)?.name ?? code;
}

/** A project made before languages existed was English, because nothing else was. */
export function projectLanguage(project: { language?: Language }): Language {
  return project.language ?? DEFAULT_LANGUAGE;
}

/** Whether this language needs the downloaded model rather than the bundled one. */
export function needsDownloadedModel(language: Language): boolean {
  return language !== 'en';
}

/**
 * Function words and fillers that never carry a sentence's emphasis, for the
 * four languages beyond English (English's list lives in `stopwords.ts`).
 *
 * Shorter than the English list and deliberately so: articles, pronouns,
 * auxiliaries, the commonest prepositions and conjunctions, and the fillers a
 * speaker leans on without meaning to. A word missing from here can still be
 * picked, and will only be picked if it was said louder or longer than the
 * rest; a content word wrongly listed here can never be, which is the worse
 * failure. Lowercase and without punctuation, as `normalizeForMatch` leaves them.
 */
export const OTHER_STOPWORDS: Readonly<Record<Exclude<Language, 'en'>, ReadonlySet<string>>> = {
  es: new Set([
    'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'lo', 'al', 'del',
    'yo', 'tú', 'tu', 'él', 'ella', 'usted', 'nosotros', 'nosotras', 'ellos', 'ellas', 'ustedes',
    'me', 'te', 'se', 'nos', 'le', 'les', 'mi', 'mis', 'tus', 'su', 'sus', 'nuestro', 'nuestra',
    'es', 'son', 'era', 'fue', 'ser', 'estar', 'está', 'están', 'estoy', 'estás', 'hay', 'ha', 'he',
    'has', 'han', 'haber', 'tengo', 'tiene', 'voy', 'va', 'vamos',
    'de', 'a', 'en', 'con', 'por', 'para', 'sin', 'sobre', 'entre', 'hasta', 'desde',
    'y', 'e', 'o', 'u', 'pero', 'que', 'qué', 'si', 'como', 'cuando', 'porque', 'pues',
    'este', 'esta', 'esto', 'ese', 'esa', 'eso', 'aquí', 'ahí', 'muy', 'más', 'también', 'ya', 'no',
    'bueno', 'entonces', 'eh', 'tipo', 'vale',
  ]),
  de: new Set([
    'der', 'die', 'das', 'den', 'dem', 'des', 'ein', 'eine', 'einen', 'einem', 'einer', 'eines',
    'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'mich', 'dich', 'sich', 'uns', 'euch', 'mir',
    'dir', 'ihm', 'ihn', 'ihnen', 'mein', 'meine', 'dein', 'deine', 'sein', 'seine', 'unser',
    'ist', 'sind', 'war', 'waren', 'bin', 'bist', 'hat', 'habe', 'hast', 'haben', 'hatte', 'wird',
    'werden', 'kann', 'können', 'muss', 'soll', 'will',
    'in', 'im', 'an', 'am', 'auf', 'aus', 'bei', 'mit', 'nach', 'von', 'vom', 'zu', 'zum', 'zur',
    'für', 'über', 'unter', 'um', 'durch',
    'und', 'oder', 'aber', 'dass', 'wenn', 'weil', 'als', 'wie', 'so', 'auch', 'noch', 'schon',
    'nur', 'dann', 'da', 'hier', 'nicht', 'kein', 'keine', 'sehr', 'mal', 'ja', 'doch',
    'also', 'halt', 'eben', 'äh', 'ähm', 'quasi', 'genau',
  ]),
  nl: new Set([
    'de', 'het', 'een', "'t", 'die', 'dat', 'deze', 'dit',
    'ik', 'jij', 'je', 'u', 'hij', 'zij', 'ze', 'wij', 'we', 'jullie', 'mij', 'me', 'jou',
    'hem', 'haar', 'ons', 'hun', 'hen', 'mijn', 'jouw', 'zijn', 'onze', 'zich',
    'is', 'ben', 'bent', 'was', 'waren', 'heb', 'hebt', 'heeft', 'hebben', 'had', 'wordt',
    'worden', 'kan', 'kunnen', 'moet', 'zal', 'wil', 'ga', 'gaat', 'gaan',
    'in', 'op', 'aan', 'met', 'van', 'voor', 'naar', 'bij', 'uit', 'om', 'over', 'door', 'tot',
    'en', 'of', 'maar', 'als', 'dan', 'want', 'omdat', 'wanneer', 'zo', 'ook', 'nog', 'al',
    'wel', 'niet', 'geen', 'er', 'hier', 'daar', 'heel', 'erg',
    'eh', 'uh', 'nou', 'gewoon', 'eigenlijk', 'dus', 'zeg', 'toch',
  ]),
  id: new Set([
    'yang', 'ini', 'itu', 'sang', 'si', 'para',
    'aku', 'saya', 'kamu', 'anda', 'engkau', 'dia', 'ia', 'kami', 'kita', 'mereka', 'beliau',
    'gue', 'gua', 'lo', 'lu', 'nya', 'ku', 'mu',
    'adalah', 'ialah', 'ada', 'akan', 'sudah', 'telah', 'sedang', 'lagi', 'bisa', 'dapat',
    'mau', 'harus', 'boleh',
    'di', 'ke', 'dari', 'pada', 'dengan', 'untuk', 'dalam', 'oleh', 'sama', 'bagi', 'tentang',
    'dan', 'atau', 'tapi', 'tetapi', 'karena', 'kalau', 'jika', 'bahwa', 'supaya', 'agar',
    'juga', 'saja', 'aja', 'sangat', 'banget', 'tidak', 'nggak', 'gak', 'enggak', 'bukan',
    'ya', 'kan', 'sih', 'dong', 'deh', 'kok', 'nah', 'eh', 'hmm', 'anu', 'gitu', 'begitu',
    'jadi', 'terus', 'trus',
  ]),
};
