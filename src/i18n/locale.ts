/**
 * Which language the interface speaks.
 *
 * Not the same question as which language a clip is spoken in. That one is a
 * property of a project and a batch (`project.language`), chosen per clip and
 * handed to whisper. This one is a property of the app: the words on its
 * buttons. The two are seeded together on first launch, because somebody who
 * reads Spanish most likely records in Spanish, and come apart the moment they
 * change one of them.
 *
 * The nine interface languages are the nine caption languages. A tenth caption
 * language without an interface in it would ship an app that can caption Turkish
 * and cannot tell a Turkish speaker how; the two lists stay one list on purpose.
 *
 * Until a choice has been made the interface follows the phone, through `Intl`,
 * so that Welcome itself — the screen the choice is made on — is already in the
 * right language for most people. A phone set to something outside the nine
 * reads English.
 */
import { useSyncExternalStore } from 'react';

import { languageFromLocale, type Language } from '../domain';
import { loadSettings, rememberLocale } from '../project/settings';

export type Locale = Language;

/** `undefined` until the stored choice has been read once; `null` is "follow the phone". */
let chosen: Locale | null | undefined;
const listeners = new Set<() => void>();

/** Hermes reports the device locale through `Intl`. Anything odd is no guess at all. */
export function deviceLocale(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale;
  } catch {
    return null;
  }
}

/** The interface language the phone itself suggests: one of the nine, or English. */
export function deviceLanguage(): Locale {
  return languageFromLocale(deviceLocale()) ?? 'en';
}

function stored(): Locale | null {
  try {
    return loadSettings().locale;
  } catch {
    // No file system here (a unit test), or a settings file that will not
    // parse. English is the one language that is always there.
    return null;
  }
}

export function currentLocale(): Locale {
  if (chosen === undefined) chosen = stored();
  return chosen ?? deviceLanguage();
}

/** The locale the user picked, or null while the interface still follows the phone. */
export function chosenLocale(): Locale | null {
  if (chosen === undefined) chosen = stored();
  return chosen;
}

/**
 * Picks the interface language and remembers it.
 *
 * Every mounted screen re-renders through `useLocale`, so a change made in
 * Settings reaches Home underneath it before Home is next looked at.
 */
export function setLocale(locale: Locale | null): void {
  chosen = locale;
  try {
    rememberLocale(locale);
  } catch {
    // Not persisted, but in force: a write that fails costs one relaunch.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useLocale(): Locale {
  return useSyncExternalStore(subscribe, currentLocale, currentLocale);
}

/** Forgets the in-memory choice, so the next read comes from disk. For tests. */
export function resetLocaleForTests(): void {
  chosen = undefined;
}
