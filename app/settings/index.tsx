/**
 * Settings.
 *
 * Five rows and an honest About. Everything here is either the user's own words,
 * what they have paid for, or what the app is — there are no preferences, because
 * a caption app with a preferences screen has usually failed to decide something.
 */
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { useCallback, useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { modelSizeLabel, type ModelState } from '../../src/asr/model-store';
import { STYLE_PRESETS } from '../../src/domain';
import { loadDictionary } from '../../src/project/dictionary-store';
import { loadSettings } from '../../src/project/settings';
import { DEV_TOOLS, describeOverride } from '../../src/policy/dev-override';
import { loadProOverride, loadProStatus, syncEntitlement } from '../../src/policy/entitlement-store';
import { proStatus, type ProStatus } from '../../src/policy/pro';
import { Divider, Label, QuietButton, Screen } from '../../src/ui/atoms';
import { plural } from '../../src/ui/describe';
import { languages, LINKS, pro, settings as copy } from '../../src/ui/copy';
import { useModelState } from '../../src/ui/language';
import { askHowToSendFeedback } from '../../src/ui/feedback';
import { MIN_TOUCH, space } from '../../src/ui/theme';

export default function Settings() {
  const insets = useSafeAreaInsets();
  const [words, setWords] = useState(0);
  const [styleName, setStyleName] = useState('');
  const [status, setStatus] = useState(() => loadProStatus());
  const model = useModelState();

  useFocusEffect(
    useCallback(() => {
      setWords(loadDictionary().length);
      setStatus(loadProStatus());
      // A subscription can end, pause or come back while the app is closed, and
      // this is the screen somebody opens to find out which.
      void syncEntitlement().then((synced) => {
        if (synced) setStatus(proStatus(synced));
      });
      const { styleId } = loadSettings();
      setStyleName(STYLE_PRESETS.find((preset) => preset.id === styleId)?.name ?? '');
    }, [])
  );

  return (
    <Screen>
      <View style={[styles.bar, { paddingTop: insets.top + space.sm }]}>
        <QuietButton title="Back" onPress={() => router.back()} />
        <Label variant="label" tone="mute">
          Settings
        </Label>
        <View style={styles.balance} />
      </View>

      <View style={styles.rows}>
        <Row
          title="Your words"
          detail={words === 0 ? 'Nothing yet' : plural(words, 'word')}
          onPress={() => router.push('/settings/dictionary')}
        />
        <Divider />
        {/* The title names the destination and the detail says where they
            stand, which is this list's shape everywhere else in it. The row
            opens the same screen for everybody: a price for the free tier, the
            plan and Manage for a subscriber, Restore for somebody on a new
            phone. */}
        <Row
          title={copy.pro}
          detail={proDetail(status)}
          onPress={() => router.push({ pathname: '/unlock', params: { from: 'settings' } })}
        />
        <Divider />
        <Row
          title={languages.settingsTitle}
          detail={languageDetail(model)}
          onPress={() => router.push('/settings/languages')}
        />
        <Divider />
        <Row
          title="Default caption style"
          detail={styleName}
          onPress={() => router.push('/settings/style')}
        />
        <Divider />
        {/* Permanent, and the half of this feature that matters. The card on Saved
            is one nudge at a good moment; this is the channel it points at, and it
            is here for the person who thinks of something a fortnight later. */}
        <Row title="Give feedback" detail="Email or TikTok" onPress={askHowToSendFeedback} />
        <Divider />
        <Row title="About" onPress={about} />
        {/* Debug and QA builds only: dead code in anything uploaded to Play. */}
        {DEV_TOOLS ? (
          <>
            <Divider />
            <Row
              title="Developer"
              detail={describeOverride(loadProOverride())}
              onPress={() => router.push('/settings/developer')}
            />
          </>
        ) : null}
      </View>

      <View style={styles.foot}>
        <Label variant="micro" tone="mute">
          Wordburn {Constants.expoConfig?.version ?? ''} · {copy.onDevice}
        </Label>
      </View>
    </Screen>
  );
}

/** Whether the other four languages are on the phone. */
function languageDetail(model: ModelState): string {
  switch (model.kind) {
    case 'ready':
      return languages.settingsDetail.ready(modelSizeLabel());
    case 'downloading':
      return languages.settingsDetail.downloading(Math.floor(model.fraction * 100));
    default:
      return languages.settingsDetail.absent;
  }
}

/** Where this account stands, in the few words a settings row has room for. */
function proDetail(status: ProStatus): string {
  switch (status.kind) {
    case 'free':
      return copy.proDetail.free;
    case 'lifetime':
      return copy.proDetail.lifetime;
    case 'subscribed':
      return copy.proDetail.subscribed(status.plan ? pro.plan[status.plan] : 'Pro');
    case 'suspended':
      return copy.proDetail.suspended;
  }
}

function about() {
  // The one place the app says where the work happens. It is still true of
  // every caption, and it is a fact for somebody who goes looking rather than
  // the pitch. Language models are downloaded once, which is why the line says
  // "processing" and not "everything".
  Alert.alert(
    `Wordburn ${Constants.expoConfig?.version ?? ''}`,
    [
      `${copy.onDevice} Your videos, audio and transcripts are never uploaded, and there is no account.`,
      '',
      'Type is set in Be Vietnam Pro and Spectral, both under the SIL Open Font License.',
      'Speech recognition by whisper.cpp, MIT licensed.',
    ].join('\n'),
    [
      { text: pro.terms, onPress: () => void Linking.openURL(LINKS.terms) },
      { text: pro.privacy, onPress: () => void Linking.openURL(LINKS.privacy) },
      { text: 'OK', style: 'cancel' },
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
      <Label variant="body">{title}</Label>
      <View style={styles.detail}>
        {detail ? (
          <Label variant="label" tone="mute">
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
  detail: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  foot: { marginTop: 'auto', padding: space.lg, alignItems: 'center' },
});
