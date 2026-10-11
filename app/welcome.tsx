/**
 * Welcome. First launch, once, and never again.
 *
 * No carousel. One line of what the app is for — one clip or a queue of them —
 * a language, and a way in. It used to lead with what the app does not do with
 * your video; that is still true and is said once, in Settings, rather than as
 * the pitch.
 *
 * The language is asked here and nowhere else on first launch. It decides two
 * things at once: what this screen and every screen after it is written in,
 * and what the first video is assumed to be spoken in. Somebody who reads
 * Spanish most likely records in Spanish; the two come apart in Settings and
 * on Home for anybody who does not. It used to be a step of its own after
 * this screen, asking only the second question, which meant a French speaker
 * read a whole screen of English before reaching the one that let them say so.
 *
 * The chips start on the phone's own language when it is one of the nine, so
 * most people see this screen in their language before touching anything, and
 * the download for a language that needs it is offered on the way out and runs
 * while they pick a style.
 *
 * Restore is here rather than only in Settings because a reinstall lands on this
 * screen, and a paying user should not have to hunt through a settings list to
 * prove they already pay.
 */
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { track } from '../src/analytics/events';
import { chosenLocale, deviceLanguage, setLocale, useCopy, useLocale } from '../src/i18n';
import { syncEntitlement } from '../src/policy/entitlement-store';
import { isPro, proStatus } from '../src/policy/pro';
import { markWelcomeSeen, rememberLanguage } from '../src/project/settings';
import { AppLanguageChips } from '../src/ui/app-language';
import { Label, PrimaryButton, QuietButton, Screen } from '../src/ui/atoms';
import { offerDownloadThen } from '../src/ui/language';
import { DEFAULT_ACCENT, space } from '../src/ui/theme';

export default function Welcome() {
  const insets = useSafeAreaInsets();
  const [restoring, setRestoring] = useState(false);
  const [message, setMessage] = useState('');
  const words = useCopy();
  const locale = useLocale();

  // Written the moment it is tapped, not on Get started: the screen has to
  // change language under the finger, and a choice made here is a choice
  // however the person leaves.
  const pick = useCallback((next: typeof locale) => {
    setLocale(next);
    setMessage('');
  }, []);

  // Into the style step rather than straight Home: it is answered once and
  // every clip after starts on the answer. The language chosen here is the
  // spoken one too, until Home says otherwise.
  const start = useCallback(() => {
    const language = chosenLocale() ?? deviceLanguage();
    markWelcomeSeen();
    rememberLanguage(language);
    track({ name: 'language_selected', language });
    offerDownloadThen(language, () =>
      router.replace({ pathname: '/settings/style', params: { onboarding: '1' } })
    );
  }, []);

  const restore = useCallback(async () => {
    setRestoring(true);
    setMessage('');

    // Seen or not, this person has now been through Welcome. Restoring is a
    // stronger signal than "Get started": they have used this app before.
    const synced = await syncEntitlement({ restore: true });
    setRestoring(false);

    if (synced && isPro(proStatus(synced))) {
      markWelcomeSeen();
      router.replace({ pathname: '/unlock', params: { from: 'welcome' } });
      return;
    }
    setMessage(words.welcome.nothingFound);
  }, [words]);

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={[
          styles.body,
          { paddingTop: insets.top + space.huge, paddingBottom: insets.bottom + space.xl },
        ]}
      >
        <Label variant="serif" style={styles.headline}>
          {words.welcome.headline}
        </Label>

        <Label variant="body" tone="mute" style={styles.blurb}>
          {words.welcome.blurb}
        </Label>

        <View style={styles.language}>
          <Label variant="label" tone="mute">
            {words.welcome.yourLanguage}
          </Label>
          <AppLanguageChips selected={locale} accent={DEFAULT_ACCENT} onPick={pick} />
          <Label variant="micro" tone="mute">
            {words.welcome.languageNote}
          </Label>
        </View>

        <View style={styles.actions}>
          <PrimaryButton title={words.welcome.start} accent={DEFAULT_ACCENT} onPress={start} busy={restoring} />
          <QuietButton title={words.welcome.restore} onPress={restore} />
          {message ? (
            <Label variant="micro" tone="mute" style={styles.message}>
              {message}
            </Label>
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flexGrow: 1, paddingHorizontal: space.lg, justifyContent: 'flex-end', gap: space.lg },
  headline: { color: DEFAULT_ACCENT, maxWidth: 340 },
  blurb: { maxWidth: 320 },
  language: { gap: space.sm, marginTop: space.md },
  actions: { marginTop: space.lg, gap: space.xs },
  message: { textAlign: 'center' },
});
