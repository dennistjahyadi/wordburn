/**
 * The languages a clip can be spoken in.
 *
 * Pure TypeScript. No react-native imports belong in this directory.
 *
 * Nine, and the choice is always the user's. Whisper can guess a language, but
 * guessing costs a whole extra encoder pass on every chunk and can change its
 * mind between two chunks of the same clip, so the app never asks it to: the
 * language is picked before the video is and passed on every call.
 *
 * English is transcribed by the model in the APK. The other eight share one
 * larger multilingual model that is downloaded once, on request — see
 * `src/asr/models.ts` for which, and `reports/` for why.
 *
 * That model knows about a hundred languages and this list is not a hundred,
 * for two reasons that are both checked rather than guessed. The caption faces
 * draw Latin script and nothing else — no Cyrillic, Greek, Arabic, Hebrew, Thai,
 * Devanagari, CJK or Hangul, and not Romanian's comma-below ș and ț — and a
 * caption the burn-in has no glyph for is a row of boxes. And of the Latin-script
 * languages, these are the ones large-v3 scores at or under Indonesian's 6.1%
 * word error on FLEURS in OpenAI's own breakdown (`language-breakdown.svg`):
 * Spanish 2.8, Italian 3.0, Portuguese 4.1, Polish 4.6, German 4.9, Dutch 5.2,
 * French 5.3. Turkish (6.7), Malay (7.3) and Swedish (7.6) are next and are
 * not here yet. Turbo runs a little behind large-v3; Indonesian was the bar
 * because it is the language the report already accepted at the edge.
 *
 * English first, because it needs nothing; the rest alphabetically, because
 * nine is past the length a list can be scanned in any other order.
 */

export type Language = 'en' | 'es' | 'de' | 'nl' | 'id' | 'fr' | 'it' | 'pt' | 'pl';

export const LANGUAGES: readonly { code: Language; name: string; native: string }[] = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'pl', name: 'Polish', native: 'Polski' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'es', name: 'Spanish', native: 'Español' },
];

export const DEFAULT_LANGUAGE: Language = 'en';

export function isLanguage(value: unknown): value is Language {
  return LANGUAGES.some((language) => language.code === value);
}

export function languageName(code: Language): string {
  return LANGUAGES.find((language) => language.code === code)?.name ?? code;
}

/**
 * The language a phone set to this locale most likely speaks, when it is one of
 * these: "pt-BR" is Portuguese, "in-ID" is Indonesian (Android still reports
 * Indonesian by its pre-1989 code, `in`), "ro-RO" is nothing. A first guess for
 * a list somebody is about to answer, never a decision.
 */
export function languageFromLocale(locale: string | null | undefined): Language | null {
  const code = (locale ?? '').toLowerCase().split(/[-_]/)[0];
  const mapped = code === 'in' ? 'id' : code;
  return isLanguage(mapped) ? mapped : null;
}

/** A project made before languages existed was English, because nothing else was. */
export function projectLanguage(project: { language?: Language }): Language {
  return project.language ?? DEFAULT_LANGUAGE;
}

/** Whether this language needs the downloaded model rather than the bundled one. */
export function needsDownloadedModel(language: Language): boolean {
  return language !== 'en';
}

/** The languages the downloaded model is for, in list order. */
export const DOWNLOADED_LANGUAGES = LANGUAGES.filter((language) => needsDownloadedModel(language.code));

/**
 * Function words and fillers that never carry a sentence's emphasis, for the
 * languages beyond English (English's list lives in `stopwords.ts`).
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
  // French elides, and whisper writes the elided pair as one word: "c'est" is
  // one token here, so the commonest pairs are listed whole.
  fr: new Set([
    'le', 'la', 'les', 'un', 'une', 'des', 'du', 'au', 'aux', "l'", "d'",
    'je', 'tu', 'il', 'elle', 'on', 'nous', 'vous', 'ils', 'elles', 'me', 'te', 'se', 'lui', 'leur',
    'moi', 'toi', 'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'son', 'sa', 'ses', 'notre', 'votre',
    'est', 'sont', 'suis', 'es', 'était', 'être', 'ai', 'as', 'a', 'avons', 'avez', 'ont', 'avoir',
    'va', 'vais', 'fait', 'peut', 'faut',
    "c'est", "j'ai", "c'était", "qu'il", "qu'on", "n'est", "s'il",
    'de', 'à', 'en', 'dans', 'sur', 'sous', 'avec', 'pour', 'par', 'sans', 'chez', 'entre', 'vers',
    'et', 'ou', 'mais', 'donc', 'car', 'que', 'qui', 'si', 'comme', 'quand', 'parce',
    'ce', 'cet', 'cette', 'ces', 'ça', 'cela', 'ici', 'là', 'très', 'plus', 'aussi', 'ne', 'pas', 'y',
    'euh', 'ben', 'bah', 'bon', 'genre', 'voilà', 'enfin', 'quoi',
  ]),
  it: new Set([
    'il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una', "un'", "l'",
    'del', 'della', 'dei', 'delle', 'al', 'alla', 'ai', 'nel', 'nella', 'sul', 'sulla',
    'io', 'tu', 'lui', 'lei', 'noi', 'voi', 'loro', 'mi', 'ti', 'si', 'ci', 'vi', 'ne',
    'mio', 'mia', 'tuo', 'tua', 'suo', 'sua', 'nostro', 'vostro',
    'è', 'sono', 'sei', 'era', 'essere', 'ho', 'hai', 'ha', 'abbiamo', 'hanno', 'avere', 'sto', 'sta',
    'va', 'fa', 'può', "c'è", "c'era",
    'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra',
    'e', 'ed', 'o', 'ma', 'che', 'se', 'come', 'quando', 'perché', 'anche', 'poi', 'quindi',
    'questo', 'questa', 'quello', 'quella', 'qui', 'qua', 'lì', 'là', 'molto', 'più', 'già', 'non',
    'ehm', 'cioè', 'allora', 'tipo', 'insomma', 'praticamente', 'boh',
  ]),
  pt: new Set([
    'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas',
    'do', 'da', 'dos', 'das', 'no', 'na', 'nos', 'nas', 'ao', 'aos', 'pelo', 'pela', 'num', 'numa',
    'eu', 'tu', 'você', 'vocês', 'ele', 'ela', 'nós', 'eles', 'elas', 'me', 'te', 'se', 'lhe',
    'meu', 'minha', 'teu', 'tua', 'seu', 'sua', 'nosso', 'nossa',
    'é', 'são', 'era', 'foi', 'ser', 'estar', 'está', 'estão', 'estou', 'tem', 'têm', 'tenho',
    'ter', 'há', 'vai', 'vou', 'vamos',
    'de', 'em', 'com', 'por', 'para', 'pra', 'sem', 'sobre', 'entre', 'até', 'desde',
    'e', 'ou', 'mas', 'que', 'se', 'como', 'quando', 'porque', 'então',
    'este', 'esta', 'isto', 'esse', 'essa', 'isso', 'aqui', 'aí', 'muito', 'mais', 'também', 'já', 'não',
    'né', 'tipo', 'assim', 'bom', 'hum', 'ahn',
  ]),
  pl: new Set([
    'ja', 'ty', 'on', 'ona', 'ono', 'my', 'wy', 'oni', 'one', 'mnie', 'mi', 'cię', 'ci', 'go', 'mu',
    'jej', 'nas', 'was', 'ich', 'im', 'się', 'mój', 'moja', 'moje', 'twój', 'twoja', 'jego', 'nasz',
    'jest', 'są', 'był', 'była', 'było', 'być', 'jestem', 'jesteś', 'mam', 'ma', 'mamy', 'mają',
    'będzie', 'można', 'trzeba',
    'w', 'we', 'na', 'z', 'ze', 'do', 'od', 'o', 'po', 'za', 'przez', 'dla', 'pod', 'nad', 'przy', 'u',
    'i', 'a', 'oraz', 'albo', 'lub', 'ale', 'że', 'żeby', 'bo', 'jak', 'jeśli', 'gdy', 'kiedy', 'czy',
    'to', 'ten', 'ta', 'te', 'tu', 'tam', 'tak', 'bardzo', 'też', 'także', 'już', 'nie', 'tylko',
    'no', 'więc', 'jakby', 'właśnie', 'generalnie', 'yyy', 'eee',
  ]),
};
