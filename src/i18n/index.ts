/**
 * The words the interface says, in whichever language it is speaking.
 *
 * `copy()` is for code that runs outside a render — an alert raised from a
 * store, a notification title, a queue's error — and `useCopy()` is for
 * components, which re-render when the language changes. Both hand back the
 * same object: `en.ts` is the shape, and the eight other dictionaries are typed
 * against it so a missing line is a compile error rather than an English word
 * on a Polish screen.
 *
 * Nothing in `src/domain` reaches in here. A preset's name, a language's native
 * name and a stopword list are data about the world and stay where they are;
 * this is only what the chrome says about them.
 */
import { STYLE_PRESETS } from '../domain';
import { de } from './de';
import { en, type Copy } from './en';
import { es } from './es';
import { fr } from './fr';
import { id } from './id';
import { it } from './it';
import { currentLocale, useLocale, type Locale } from './locale';
import { nl } from './nl';
import { pl } from './pl';
import { pt } from './pt';

export type { Copy } from './en';
export {
  chosenLocale,
  currentLocale,
  deviceLanguage,
  setLocale,
  useLocale,
  type Locale,
} from './locale';

const DICTIONARIES: Record<Locale, Copy> = { en, es, de, nl, id, fr, it, pt, pl };

/** The dictionary for the interface language in force right now. */
export function copy(): Copy {
  return DICTIONARIES[currentLocale()];
}

/** The same, subscribed: the component re-renders when the language changes. */
export function useCopy(): Copy {
  return DICTIONARIES[useLocale()];
}

/** A preset's name as this language says it, or as `STYLE_PRESETS` does. */
export function presetName(styleId: string, dictionary: Copy = copy()): string {
  return dictionary.stylePicker.presets[styleId] ?? STYLE_PRESETS.find((preset) => preset.id === styleId)?.name ?? styleId;
}

/** Every dictionary, for the test that holds them to one shape. */
export const ALL_DICTIONARIES: Readonly<Record<Locale, Copy>> = DICTIONARIES;
