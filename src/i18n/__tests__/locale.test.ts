/**
 * Which language the interface speaks, and how it changes.
 *
 * There is no file system here, so the stored choice is always "none" and the
 * interface follows the phone — which in a test is whatever `Intl` says, which
 * is English. What is tested is the rule and the subscription, not the disk.
 */
import { currentLocale, deviceLanguage, resetLocaleForTests, setLocale } from '../locale';
import { copy } from '..';

beforeEach(() => {
  resetLocaleForTests();
  setLocale(null);
  resetLocaleForTests();
});

describe('the interface language', () => {
  it('follows the phone until a choice is made, and the phone here speaks one of the nine', () => {
    expect(['en', 'es', 'de', 'nl', 'id', 'fr', 'it', 'pt', 'pl']).toContain(deviceLanguage());
    expect(currentLocale()).toBe(deviceLanguage());
  });

  it('speaks the chosen language the moment it is chosen', () => {
    setLocale('fr');
    expect(currentLocale()).toBe('fr');
    expect(copy().common.back).toBe('Retour');

    setLocale('pl');
    expect(copy().common.back).toBe('Wstecz');
  });

  it('hands the choice back to the phone with null', () => {
    setLocale('de');
    setLocale(null);
    expect(currentLocale()).toBe(deviceLanguage());
  });
});
