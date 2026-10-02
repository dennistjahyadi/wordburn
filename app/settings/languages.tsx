/**
 * Settings → Languages.
 *
 * What the downloaded model is, how big, and the two things anybody would come
 * here to do with it: get it, or get rid of it. English needs nothing and is
 * said to need nothing, so nobody goes looking for an English download.
 */
import { router } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  cancelModelDownload,
  deleteModel,
  modelSizeLabel,
} from '../../src/asr/model-store';
import { Divider, Label, PrimaryButton, ProgressBar, QuietButton, Screen } from '../../src/ui/atoms';
import { languages as copy } from '../../src/ui/copy';
import { ensureLanguageReady, useModelState } from '../../src/ui/language';
import { DEFAULT_ACCENT, space } from '../../src/ui/theme';

export default function Languages() {
  const insets = useSafeAreaInsets();
  const model = useModelState();
  const size = modelSizeLabel();

  function remove() {
    Alert.alert(copy.manage.removeTitle, copy.manage.removeBody(size), [
      { text: copy.notNow, style: 'cancel' },
      { text: copy.manage.remove, style: 'destructive', onPress: () => deleteModel() },
    ]);
  }

  function get() {
    // The same checks as everywhere else: memory first, then the size, then the
    // bytes. Asked as Spanish because any downloaded language means this file.
    ensureLanguageReady('es');
  }

  return (
    <Screen>
      <View style={[styles.bar, { paddingTop: insets.top + space.sm }]}>
        <QuietButton title="Back" onPress={() => router.back()} />
        <Label variant="label" tone="mute">
          {copy.manage.title}
        </Label>
        <View style={styles.balance} />
      </View>

      <View style={styles.body}>
        <View style={styles.block}>
          <Label variant="body">English</Label>
          <Label variant="label" tone="mute">
            {copy.manage.english}
          </Label>
        </View>

        <Divider />

        <View style={styles.block}>
          <Label variant="body">{copy.manage.model}</Label>
          <Label variant="label" tone="mute">
            {copy.manage.modelNote(size)}
          </Label>

          {model.kind === 'downloading' ? (
            <View style={styles.progress}>
              <ProgressBar fraction={model.fraction} accent={DEFAULT_ACCENT} />
              <Label variant="micro" tone="mute">
                {copy.downloading(Math.floor(model.fraction * 100))}
              </Label>
              <QuietButton title={copy.manage.cancel} onPress={cancelModelDownload} />
            </View>
          ) : null}

          {model.kind === 'failed' ? (
            <Label variant="label" tone="signal">
              {model.message}
            </Label>
          ) : null}

          {model.kind === 'ready' ? (
            <View style={styles.actions}>
              <Label variant="label" style={{ color: DEFAULT_ACCENT }}>
                {copy.settingsDetail.ready(size)}
              </Label>
              <QuietButton title={copy.manage.remove} tone="signal" onPress={remove} />
            </View>
          ) : null}

          {model.kind === 'absent' || model.kind === 'failed' ? (
            <View style={styles.actions}>
              <PrimaryButton
                title={model.kind === 'failed' ? copy.retry : `${copy.download} · ${size}`}
                accent={DEFAULT_ACCENT}
                onPress={get}
              />
            </View>
          ) : null}
        </View>
      </View>
    </Screen>
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
  body: { paddingHorizontal: space.lg, marginTop: space.lg, gap: space.lg },
  block: { gap: space.xs },
  progress: { gap: space.sm, marginTop: space.md },
  actions: { gap: space.sm, marginTop: space.md, alignItems: 'stretch' },
});
