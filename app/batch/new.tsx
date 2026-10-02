/**
 * New batch: the clips just picked, one language, one look, and a button.
 *
 * Everything that could stop a batch halfway is asked here instead: the
 * language model, the gallery, the notification. A queue of twenty that fails on
 * clip one for want of a permission is a batch the user has to babysit, which is
 * the one thing it exists to spare them.
 */
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { takeDraft } from '../../src/batch/draft';
import { startBatch } from '../../src/batch/queue';
import {
  MAX_BATCH_CLIPS,
  STYLE_PRESETS,
  type Batch,
  type Language,
  type StyleOverrides,
} from '../../src/domain';
import { canSaveToGallery } from '../../src/export/run';
import { requestNotifications } from '../../src/native/foreground-service';
import { loadLooks } from '../../src/project/presets-store';
import { loadSettings, rememberLanguage } from '../../src/project/settings';
import { Divider, Label, PrimaryButton, QuietButton, Screen } from '../../src/ui/atoms';
import { batch as copy } from '../../src/ui/copy';
import { ensureLanguageReady, LanguageField } from '../../src/ui/language';
import { color, DEFAULT_ACCENT, MIN_TOUCH, radius, space } from '../../src/ui/theme';

type Look = {
  key: string;
  name: string;
  styleId: string;
  styleOverrides: StyleOverrides;
};

export default function NewBatch() {
  const insets = useSafeAreaInsets();
  const draft = useMemo(() => takeDraft(), []);
  const picked = draft.jobs;
  const clips = picked.slice(0, MAX_BATCH_CLIPS);
  const [language, setLanguage] = useState<Language>(() => loadSettings().language);
  const [starting, setStarting] = useState(false);

  const looks = useMemo(() => {
    const settings = loadSettings();
    const current: Look = {
      key: 'current',
      name: `${copy.currentLook} · ${STYLE_PRESETS.find((preset) => preset.id === settings.styleId)?.name ?? ''}`,
      styleId: settings.styleId,
      styleOverrides: settings.styleOverrides,
    };
    const saved: Look[] = loadLooks().map((look) => ({
      key: look.id,
      ...look,
    }));
    const presets: Look[] = STYLE_PRESETS.map((preset) => ({
      key: `preset-${preset.id}`,
      name: preset.name,
      styleId: preset.id,
      styleOverrides: {},
    }));
    return { current, saved, presets };
  }, []);
  // The default style, always: it is what the user said every video should
  // start in, and a batch that quietly started in some other look would make
  // them check every time.
  const [lookKey, setLookKey] = useState('current');
  const all = [looks.current, ...looks.saved, ...looks.presets];
  const look = all.find((candidate) => candidate.key === lookKey) ?? looks.current;

  const totalMs = clips.reduce((sum, clip) => sum + clip.durationMs, 0);

  async function start() {
    if (clips.length === 0) return;
    if (!ensureLanguageReady(language, 'batch')) return;

    setStarting(true);
    try {
      if (!(await canSaveToGallery())) {
        Alert.alert(copy.galleryDenied);
        return;
      }
      await requestNotifications();

      const batch: Batch = {
        id: `batch-${Date.now().toString(36)}`,
        createdAt: new Date().toISOString(),
        language,
        styleId: look.styleId,
        styleOverrides: look.styleOverrides,
        jobs: clips.map((clip, index) => ({
          id: `job-${index}`,
          source: clip.source,
          name: clip.name,
          status: 'queued',
          progress: 0,
        })),
      };

      if (!startBatch(batch)) {
        Alert.alert(copy.busyTitle, copy.busyBody);
        return;
      }
      router.replace('/batch');
    } finally {
      setStarting(false);
    }
  }

  return (
    <Screen>
      <View style={[styles.bar, { paddingTop: insets.top + space.sm }]}>
        <QuietButton title="Back" onPress={() => router.back()} />
        <Label variant="label" tone="mute">
          {copy.setupTitle}
        </Label>
        <View style={styles.balance} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + space.huge * 2 }]}
      >
        <View style={styles.block}>
          <Label variant="title">{copy.clips(clips.length)}</Label>
          <Label variant="label" tone="mute">
            {copy.totalLength(formatLength(totalMs))}
          </Label>
          {picked.length > MAX_BATCH_CLIPS ? (
            <Label variant="label" tone="signal">
              {copy.tooMany(MAX_BATCH_CLIPS)}
            </Label>
          ) : null}
        </View>

        <View style={styles.block}>
          <LanguageField
            language={language}
            accent={DEFAULT_ACCENT}
            from="batch"
            onChange={(next) => {
              setLanguage(next);
              rememberLanguage(next);
            }}
          />
        </View>

        <View style={styles.block}>
          <Label variant="label" tone="mute">
            {copy.style}
          </Label>
          <View style={styles.looks} accessibilityRole="radiogroup">
            <LookRow
              look={looks.current}
              selected={lookKey === 'current'}
              onPress={() => setLookKey('current')}
            />
            {looks.saved.length > 0 ? (
              <Label variant="micro" tone="mute" style={styles.groupHead}>
                {copy.savedLooks}
              </Label>
            ) : null}
            {looks.saved.map((candidate) => (
              <LookRow
                key={candidate.key}
                look={candidate}
                selected={lookKey === candidate.key}
                onPress={() => setLookKey(candidate.key)}
              />
            ))}
            <Label variant="micro" tone="mute" style={styles.groupHead}>
              {copy.presets}
            </Label>
            {looks.presets.map((candidate) => (
              <LookRow
                key={candidate.key}
                look={candidate}
                selected={lookKey === candidate.key}
                onPress={() => setLookKey(candidate.key)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.dock, { paddingBottom: insets.bottom + space.md }]}>
        <Divider />
        <PrimaryButton
          title={copy.start(clips.length)}
          accent={DEFAULT_ACCENT}
          busy={starting}
          disabled={clips.length === 0}
          onPress={start}
        />
      </View>
    </Screen>
  );
}

function LookRow({
  look,
  selected,
  onPress,
}: {
  look: Look;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.look,
        {
          borderColor: selected ? DEFAULT_ACCENT : color.line,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Label variant="body">{look.name}</Label>
      {selected ? (
        <Label variant="label" style={{ color: DEFAULT_ACCENT }}>
          ✓
        </Label>
      ) : null}
    </Pressable>
  );
}

function formatLength(ms: number): string {
  const minutes = Math.floor(ms / 60_000);
  const seconds = Math.round((ms % 60_000) / 1000);
  return minutes > 0 ? `${minutes} min ${seconds} s` : `${seconds} s`;
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
  body: { paddingHorizontal: space.lg, paddingTop: space.md, gap: space.xl },
  block: { gap: space.sm },
  looks: { gap: space.xs },
  groupHead: { marginTop: space.md },
  look: {
    minHeight: MIN_TOUCH + 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    borderWidth: 1,
    borderRadius: radius.control,
  },
  dock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: space.lg,
    gap: space.md,
    backgroundColor: color.ink,
  },
});
