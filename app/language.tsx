/**
 * First launch, step two: what this person captions in.
 *
 * Between Welcome and the style step. The language was a chip on Home that
 * started in English for everybody, so a creator who speaks Polish found out
 * what Polish costs only by tapping the chip — or, worse, by transcribing a
 * Polish clip with the English model. Asked here, the answer is the starting
 * language for every video and batch, and what it costs is said on
 * the row before anything is chosen (invariant 5, applied to a language).
 *
 * The phone's own language is the first guess, when it is one of the nine.
 *
 * A free user who picks a Pro language hears it once, here, and is offered Pro
 * or English. Saving the language anyway would leave Home on a choice that asks
 * for money on every pick, which is a nag rather than a setting. A subscriber is
 * offered the download on the spot, and it runs while they pick a style.
 */
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { track } from '../src/analytics/events';
import { canRunModel, downloadModel, modelSizeLabel, modelState, NOT_ENOUGH_MEMORY } from '../src/asr/model-store';
import { languageFromLocale, needsDownloadedModel, type Language } from '../src/domain';
import { loadProStatus } from '../src/policy/entitlement-store';
import { isPro } from '../src/policy/pro';
import { loadSettings, rememberLanguage } from '../src/project/settings';
import { Label, PrimaryButton, Screen } from '../src/ui/atoms';
import { firstLanguage, languages as copy } from '../src/ui/copy';
import { LanguageOptions } from '../src/ui/language';
import { DEFAULT_ACCENT, space } from '../src/ui/theme';

/** Hermes reports the device locale through `Intl`. Anything odd is no guess at all. */
function deviceLocale(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale;
  } catch {
    return null;
  }
}

export default function FirstLanguage() {
  const insets = useSafeAreaInsets();
  const [chosen, setChosen] = useState<Language>(
    () => languageFromLocale(deviceLocale()) ?? loadSettings().language
  );

  const proceed = useCallback((language: Language) => {
    rememberLanguage(language);
    track({ name: 'language_selected', language });
    router.replace({ pathname: '/settings/style', params: { onboarding: '1' } });
  }, []);

  // Every branch does its work in a button's own callback, never on the
  // alert's dismissal: see "Things Android taught us" on `onDismiss`.
  const next = useCallback(() => {
    if (!needsDownloadedModel(chosen)) {
      proceed(chosen);
      return;
    }

    if (!isPro(loadProStatus())) {
      Alert.alert(copy.proTitle, copy.proBody, [
        { text: firstLanguage.useEnglish, style: 'cancel', onPress: () => proceed('en') },
        { text: copy.proCta, onPress: () => router.push({ pathname: '/unlock', params: { from: 'onboarding' } }) },
      ]);
      return;
    }

    if (!canRunModel()) {
      Alert.alert(copy.lowMemoryTitle, NOT_ENOUGH_MEMORY);
      return;
    }

    const model = modelState();
    if (model.kind === 'absent' || model.kind === 'failed') {
      Alert.alert(copy.downloadTitle, copy.downloadBody(modelSizeLabel()), [
        { text: copy.notNow, style: 'cancel', onPress: () => proceed(chosen) },
        {
          text: copy.download,
          onPress: () => {
            void downloadModel();
            proceed(chosen);
          },
        },
      ]);
      return;
    }

    proceed(chosen);
  }, [chosen, proceed]);

  return (
    <Screen>
      <View style={[styles.bar, { paddingTop: insets.top + space.sm }]}>
        <Label variant="label" tone="mute">
          {firstLanguage.title}
        </Label>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Label variant="heading">{firstLanguage.heading}</Label>
        <Label variant="label" tone="mute">
          {copy.sheetNote}
        </Label>
        <LanguageOptions selected={chosen} accent={DEFAULT_ACCENT} onPick={setChosen} />
      </ScrollView>

      <View style={[styles.foot, { paddingBottom: insets.bottom + space.md }]}>
        <Label variant="micro" tone="mute">
          {firstLanguage.note}
        </Label>
        <PrimaryButton title={firstLanguage.continue} accent={DEFAULT_ACCENT} onPress={next} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: 'center',
    paddingHorizontal: space.sm,
    paddingBottom: space.sm,
    minHeight: 44,
    justifyContent: 'flex-end',
  },
  body: { paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.lg, gap: space.sm },
  foot: { paddingHorizontal: space.lg, paddingTop: space.sm, gap: space.md },
});
