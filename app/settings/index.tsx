/**
 * Settings.
 *
 * Six rows and an honest About. Everything here is either the user's own words,
 * what they have paid for, what the app speaks, or what the app is — there are
 * no preferences beyond that, because a caption app with a preferences screen
 * has usually failed to decide something.
 */
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { useCallback, useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { modelSizeLabel, type ModelState } from '../../src/asr/model-store';
import { presetName, setLocale, useCopy, useLocale, type Copy } from '../../src/i18n';
import { loadDictionary } from '../../src/project/dictionary-store';
import { loadSettings } from '../../src/project/settings';
import { DEV_TOOLS, describeOverride } from '../../src/policy/dev-override';
import { loadEntitlement, loadProOverride, loadProStatus, syncEntitlement } from '../../src/policy/entitlement-store';
import { freeTierStatus } from '../../src/policy/free-tier';
import { proStatus, type ProStatus } from '../../src/policy/pro';
import { AppLanguageSheet } from '../../src/ui/app-language';
import { Divider, Label, QuietButton, Screen } from '../../src/ui/atoms';
import { words as countWords } from '../../src/ui/describe';
import { useModelState } from '../../src/ui/language';
import { askHowToSendFeedback } from '../../src/ui/feedback';
import { LINKS } from '../../src/ui/links';
import { DEFAULT_ACCENT, MIN_TOUCH, space } from '../../src/ui/theme';

export default function Settings() {
  const insets = useSafeAreaInsets();
  const [words, setWords] = useState(0);
  const [styleId, setStyleId] = useState('');
  const [status, setStatus] = useState(() => loadProStatus());
  const [choosingLanguage, setChoosingLanguage] = useState(false);
  const model = useModelState();
  const copy = useCopy();
  const locale = useLocale();

  useFocusEffect(
    useCallback(() => {
      setWords(loadDictionary().length);
      setStatus(loadProStatus());
      // A subscription can end, pause or come back while the app is closed, and
      // this is the screen somebody opens to find out which.
      void syncEntitlement().then((synced) => {
        if (synced) setStatus(proStatus(synced));
      });
      setStyleId(loadSettings().styleId);
    }, [])
  );

  return (
    <Screen>
      <View style={[styles.bar, { paddingTop: insets.top + space.sm }]}>
        <QuietButton title={copy.common.back} onPress={() => router.back()} />
        <Label variant="label" tone="mute">
          {copy.settings.title}
        </Label>
        <View style={styles.balance} />
      </View>

      <View style={styles.rows}>
        <Row
          title={copy.settings.yourWords}
          detail={words === 0 ? copy.settings.nothingYet : countWords(words)}
          onPress={() => router.push('/settings/dictionary')}
        />
        <Divider />
        {/* The title names the destination and the detail says where they
            stand, which is this list's shape everywhere else in it. The row
            opens the same screen for everybody: a price for the free tier, the
            plan and Manage for a subscriber, Restore for somebody on a new
            phone. */}
        <Row
          title={copy.settings.pro}
          detail={proDetail(status, copy)}
          onPress={() => router.push({ pathname: '/unlock', params: { from: 'settings' } })}
        />
        <Divider />
        {/* What the interface speaks. The detail is the language's own name for
            itself, which is the one thing on this screen that must still be
            readable by somebody who picked the wrong language. */}
        <Row
          title={copy.settings.appLanguage}
          detail={copy.languageNames[locale]}
          onPress={() => setChoosingLanguage(true)}
        />
        <Divider />
        <Row
          title={copy.languages.settingsTitle}
          detail={languageDetail(model, copy)}
          onPress={() => router.push('/settings/languages')}
        />
        <Divider />
        <Row
          title={copy.settings.defaultStyle}
          detail={styleId ? presetName(styleId, copy) : ''}
          onPress={() => router.push('/settings/style')}
        />
        <Divider />
        {/* Permanent, and the half of this feature that matters. The card on Saved
            is one nudge at a good moment; this is the channel it points at, and it
            is here for the person who thinks of something a fortnight later. */}
        <Row title={copy.settings.feedback} detail={copy.settings.feedbackDetail} onPress={askHowToSendFeedback} />
        <Divider />
        <Row title={copy.settings.about} onPress={() => about(copy)} />
        {/* Debug and QA builds only: dead code in anything uploaded to Play. */}
        {DEV_TOOLS ? (
          <>
            <Divider />
            <Row
              title={copy.settings.developer}
              detail={describeOverride(loadProOverride())}
              onPress={() => router.push('/settings/developer')}
            />
          </>
        ) : null}
      </View>

      <View style={styles.foot}>
        <Label variant="micro" tone="mute">
          Wordburn {Constants.expoConfig?.version ?? ''} · {copy.settings.onDevice}
        </Label>
      </View>

      {choosingLanguage ? (
        <AppLanguageSheet
          selected={locale}
          accent={DEFAULT_ACCENT}
          onClose={() => setChoosingLanguage(false)}
          onPick={(next) => {
            setLocale(next);
            setChoosingLanguage(false);
          }}
        />
      ) : null}
    </Screen>
  );
}

/** Whether the languages beyond English are on the phone. */
function languageDetail(model: ModelState, copy: Copy): string {
  switch (model.kind) {
    case 'ready':
      return copy.languages.settingsDetail.ready(modelSizeLabel());
    case 'downloading':
      return copy.languages.settingsDetail.downloading(Math.floor(model.fraction * 100));
    default:
      return copy.languages.settingsDetail.absent;
  }
}

/** Where this account stands, in the few words a settings row has room for. */
function proDetail(status: ProStatus, copy: Copy): string {
  switch (status.kind) {
    case 'free':
      // The same line Home shows, so the count of free videos left is one fact.
      return freeTierStatus(loadEntitlement()).line || copy.settings.proDetail.free;
    case 'lifetime':
      return copy.settings.proDetail.lifetime;
    case 'subscribed':
      return copy.settings.proDetail.subscribed(status.plan ? copy.pro.plan[status.plan] : 'Pro');
    case 'suspended':
      return copy.settings.proDetail.suspended;
  }
}

function about(copy: Copy) {
  // The one place the app says where the work happens. It is still true of
  // every caption, and it is a fact for somebody who goes looking rather than
  // the pitch. Language models are downloaded once, which is why the line says
  // "processing" and not "everything".
  Alert.alert(
    `Wordburn ${Constants.expoConfig?.version ?? ''}`,
    [
      `${copy.settings.onDevice} ${copy.settings.aboutPrivacy}`,
      '',
      copy.settings.aboutFonts,
      copy.settings.aboutWhisper,
    ].join('\n'),
    [
      { text: copy.pro.terms, onPress: () => void Linking.openURL(LINKS.terms) },
      { text: copy.pro.privacy, onPress: () => void Linking.openURL(LINKS.privacy) },
      { text: copy.common.ok, style: 'cancel' },
    ]
  );
}

function Row({
  title,
  detail,
  onPress,
}: {
  title: string;
  detail?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed && onPress ? 0.6 : 1 }]}
    >
      <Label variant="body" style={styles.title}>
        {title}
      </Label>
      <View style={styles.detail}>
        {detail ? (
          <Label variant="label" tone="mute" style={styles.detailText}>
            {detail}
          </Label>
        ) : null}
        {onPress ? (
          <Label variant="label" tone="mute">
            ›
          </Label>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.sm,
    paddingBottom: space.sm,
  },
  balance: { width: 72 },
  rows: { paddingHorizontal: space.lg, marginTop: space.lg },
  row: {
    minHeight: MIN_TOUCH + 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
  },
  // Both sides may shrink and the detail wraps against the right edge. In
  // English every detail fit beside its title; the Spanish free-tier line ran
  // off the screen on the emulator, and German and Polish run longer still.
  title: { flexShrink: 1 },
  detail: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: space.sm },
  detailText: { flexShrink: 1, textAlign: 'right' },
  foot: { marginTop: 'auto', padding: space.lg, alignItems: 'center' },
});
