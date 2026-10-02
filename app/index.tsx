/**
 * Home.
 *
 * One primary action that opens the system picker directly, the language the
 * clip is spoken in above it, the free-tier line above the fold where it
 * belongs, and the projects already on this phone.
 */
import * as ImagePicker from 'expo-image-picker';
import { Redirect, router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Image, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  accentColor,
  MAX_BATCH_CLIPS,
  pickedClipName,
  projectStyle,
  summarize,
  type Batch,
  type Language,
  type Project,
} from '../src/domain';
import { beginProject } from '../src/asr/runner';
import { setDraft } from '../src/batch/draft';
import { currentBatch, subscribeBatch } from '../src/batch/queue';
import { DEV_TOOLS, describeOverride, QA_BUILD } from '../src/policy/dev-override';
import { isPro } from '../src/policy/pro';
import { loadProOverride, loadProStatus } from '../src/policy/entitlement-store';
import { batch as batchCopy } from '../src/ui/copy';
import { requestNotifications } from '../src/native/foreground-service';
import { freeTierStatus } from '../src/policy/free-tier';
import { loadEntitlement } from '../src/policy/entitlement-store';
import { deleteProject, listProjects, loadPipeline, thumbnailFile } from '../src/project/store';
import { loadSettings, rememberLanguage } from '../src/project/settings';
import { makeThumbnail } from '../src/project/thumbnail';
import { Label, PrimaryButton, Screen } from '../src/ui/atoms';
import { Curtain } from '../src/ui/curtain';
import { describeProject, plural } from '../src/ui/describe';
import { ensureLanguageReady, LanguageField } from '../src/ui/language';
import { FreeTierLine } from '../src/ui/tier';
import { color, DEFAULT_ACCENT, MIN_TOUCH, radius, space } from '../src/ui/theme';

export default function Home() {
  const insets = useSafeAreaInsets();
  const [projects, setProjects] = useState<Project[]>([]);
  const [status, setStatus] = useState(() => freeTierStatus(loadEntitlement()));
  const [picking, setPicking] = useState(false);
  // Read once, synchronously, before the first paint. Settings is a small file
  // read straight off disk, so a first launch never flashes Home on its way to
  // Welcome the way an effect would make it.
  const [welcomeSeen] = useState(() => loadSettings().welcomeSeen);
  const [language, setLanguage] = useState<Language>(() => loadSettings().language);
  const [batch, setBatch] = useState<Batch | null>(currentBatch);
  useEffect(() => subscribeBatch(setBatch), []);

  useFocusEffect(
    useCallback(() => {
      setProjects(listProjects());
      setStatus(freeTierStatus(loadEntitlement()));
      // The curtain stays down across the push to Processing, so that Home is
      // not seen uncovering itself under the transition. Coming back is what
      // lifts it.
      setPicking(false);
    }, [])
  );

  if (!welcomeSeen) return <Redirect href="/welcome" />;

  /**
   * From the tap to the Processing screen, nothing else on Home can be touched.
   *
   * The picker copies the video into this app's cache before it returns, which
   * is seconds on a long clip, and the project is then made synchronously. The
   * curtain covers all of it; only cancelling or an error lifts it here.
   */
  async function pickVideo() {
    // Before the picker, not after it: a Spanish clip picked while the model is
    // still downloading would sit in Processing with nothing to run on.
    if (!ensureLanguageReady(language, 'language')) return;
    setPicking(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsMultipleSelection: false,
        quality: 1,
      });
      if (result.canceled) {
        setPicking(false);
        return;
      }

      const asset = result.assets[0];
      // The notification is what the foreground service needs to keep running
      // while the user is in another app. Asked for here, before any work, so a
      // denial is not a surprise halfway through a transcription.
      await requestNotifications();

      const project = beginProject(asset.uri, Math.round(asset.duration ?? 0), language);
      void makeThumbnail(project);
      router.push(`/processing/${project.id}`);
    } catch (error) {
      setPicking(false);
      Alert.alert('That video could not be opened', describe(error));
    }
  }

  /** Pro first, then a queue that is free, then the picker. */
  function proOnly(title: string, body: string, from: string): boolean {
    if (isPro(loadProStatus())) return true;
    Alert.alert(title, body, [
      { text: 'Not now', style: 'cancel' },
      { text: 'See Pro', onPress: () => router.push({ pathname: '/unlock', params: { from } }) },
    ]);
    return false;
  }

  /**
   * Many clips at once. The picker's own limit is set to the batch's, and a
   * batch still working is finished or cleared first: one queue, not a queue of
   * queues.
   */
  async function pickBatch() {
    if (!proOnly(batchCopy.proTitle, batchCopy.proBody, 'batch')) return;
    if (batch && !summarize(batch).finished) {
      Alert.alert(batchCopy.busyTitle, batchCopy.busyBody, [
        { text: 'OK', style: 'cancel' },
        { text: batchCopy.viewQueue, onPress: () => router.push('/batch') },
      ]);
      return;
    }

    setPicking(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsMultipleSelection: true,
        selectionLimit: MAX_BATCH_CLIPS,
        quality: 1,
      });
      if (result.canceled || result.assets.length === 0) {
        setPicking(false);
        return;
      }
      setDraft({
        jobs: result.assets.map((asset, index) => ({
          name: pickedClipName(asset.fileName, index, new Date()),
          durationMs: Math.round(asset.duration ?? 0),
          source: { kind: 'file' as const, uri: asset.uri, durationMs: Math.round(asset.duration ?? 0) },
        })),
      });
      router.push('/batch/new');
    } catch (error) {
      setPicking(false);
      Alert.alert('Those videos could not be opened', describe(error));
    }
  }

  function open(project: Project) {
    if (project.status === 'ready') {
      router.push(`/project/${project.id}`);
      return;
    }
    router.push(`/processing/${project.id}`);
  }

  function confirmDelete(project: Project) {
    // Named, because two clips of the same length with the same number of words
    // look identical in a dialog and only one of them is the one being deleted.
    Alert.alert(
      'Delete this project?',
      `${describeProject(project)}\n\nThe transcript goes with it. The video on your phone is not touched.`,
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteProject(project.id);
            setProjects(listProjects());
          },
        },
      ]
    );
  }

  return (
    <Screen>
      <FlatList
        data={projects}
        keyExtractor={(project) => project.id}
        contentContainerStyle={{
          paddingTop: insets.top + space.xxl,
          paddingBottom: insets.bottom + space.xxl,
          paddingHorizontal: space.lg,
          gap: space.md,
        }}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.title}>
              <Label variant="display">Wordburn</Label>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Settings"
                onPress={() => router.push('/settings')}
                style={({ pressed }) => [styles.settings, { opacity: pressed ? 0.6 : 1 }]}
              >
                <Label variant="heading" tone="mute">
                  ⚙
                </Label>
              </Pressable>
            </View>
            <Label variant="body" tone="mute" style={styles.blurb}>
              Caption one clip, or queue a batch of them.
            </Label>

            <View style={styles.action}>
              {/* One card for "the next thing you make": the language it is
                  spoken in, then the two ways to start. The setting sits above
                  the button it applies to, inside the same edge, so it reads as
                  part of the action rather than as a status line over it. */}
              <View style={styles.card}>
                <LanguageField
                  language={language}
                  accent={DEFAULT_ACCENT}
                  from="language"
                  framed={false}
                  onChange={(next) => {
                    setLanguage(next);
                    rememberLanguage(next);
                  }}
                />
                <View style={styles.cardRule} />
                <View style={styles.cardActions}>
                  <PrimaryButton
                    title="New video"
                    onPress={pickVideo}
                    accent={DEFAULT_ACCENT}
                    busy={picking}
                  />
                  <SecondaryAction title={batchCopy.home} note={batchCopy.homeNote} onPress={pickBatch} />
                </View>
              </View>
              {/* Never quiet: a developer who forgot an override would be testing
                  a customer who does not exist. */}
              {DEV_TOOLS && (QA_BUILD || loadProOverride().kind !== 'play') ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push('/settings/developer')}
                  style={({ pressed }) => [styles.devRow, { opacity: pressed ? 0.6 : 1 }]}
                >
                  <Label variant="micro" style={{ color: color.signal }}>
                    {[QA_BUILD ? 'QA build' : null, loadProOverride().kind !== 'play' ? `Pro override: ${describeOverride(loadProOverride())}` : null]
                      .filter(Boolean)
                      .join(' · ')}
                  </Label>
                </Pressable>
              ) : null}
              {batch && !summarize(batch).finished ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push('/batch')}
                  style={({ pressed }) => [styles.queueRow, { opacity: pressed ? 0.6 : 1 }]}
                >
                  <Label variant="label">
                    {batch.paused
                      ? batchCopy.homeRowPaused
                      : batchCopy.homeRow(summarize(batch).done, summarize(batch).total)}
                  </Label>
                  <Label variant="label" tone="mute">
                    ›
                  </Label>
                </Pressable>
              ) : null}
              {/* Invariant 5 at its earliest point: what an export costs is on
                  screen before the picker opens, not after the work is done. */}
              <FreeTierLine
                tier={status}
                accent={DEFAULT_ACCENT}
                onPress={() => router.push({ pathname: '/unlock', params: { from: 'home' } })}
              />
            </View>

            {projects.length > 0 ? (
              <Label variant="label" tone="mute" style={styles.listHead}>
                On this phone
              </Label>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <ProjectRow project={item} onPress={() => open(item)} onLongPress={() => confirmDelete(item)} />
        )}
      />

      {picking ? <Curtain title="Getting your video ready" note="A long clip takes a few seconds." /> : null}
    </Screen>
  );
}

function SecondaryAction({ title, note, onPress }: { title: string; note: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${note}.`}
      onPress={onPress}
      style={({ pressed }) => [styles.secondary, { opacity: pressed ? 0.7 : 1 }]}
    >
      <View style={styles.secondaryText}>
        <Label variant="heading">{title}</Label>
        <Label variant="micro" tone="mute">
          {note}
        </Label>
      </View>
      <Label variant="heading" tone="mute">
        ›
      </Label>
    </Pressable>
  );
}

function ProjectRow({
  project,
  onPress,
  onLongPress,
}: {
  project: Project;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const accent = accentColor(projectStyle(project));
  const thumb = thumbnailFile(project.id);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
    >
      <View style={styles.thumb}>
        {thumb.exists ? <Image source={{ uri: thumb.uri }} style={styles.thumbImage} /> : null}
      </View>

      <View style={styles.rowBody}>
        <Label variant="heading" numberOfLines={1}>
          {formatDuration(project.durationMs)}
        </Label>
        <StatusLine project={project} accent={accent} />
      </View>
    </Pressable>
  );
}

function StatusLine({ project, accent }: { project: Project; accent: string }) {
  if (project.status === 'failed') {
    const pipeline = loadPipeline(project.id);
    return (
      <Label variant="label" tone="signal" numberOfLines={2}>
        {pipeline?.error ?? 'Transcription stopped'} · tap to try again
      </Label>
    );
  }

  if (project.status === 'ready') {
    return (
      <Label variant="label" tone="mute">
        {plural(project.words.length, 'word')} · ready
      </Label>
    );
  }

  const done = project.progress.totalMs > 0 ? project.progress.processedMs / project.progress.totalMs : 0;
  return (
    <View style={styles.rowProgress}>
      <View style={styles.rowTrack}>
        <View style={[styles.rowFill, { width: `${Math.round(done * 100)}%`, backgroundColor: accent }]} />
      </View>
      <Label variant="micro" tone="mute">
        {Math.round(done * 100)}%
      </Label>
    </View>
  );
}

function formatDuration(ms: number): string {
  const total = Math.round(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

const styles = StyleSheet.create({
  title: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settings: { width: MIN_TOUCH, height: MIN_TOUCH, alignItems: 'center', justifyContent: 'center' },
  header: { gap: space.md, marginBottom: space.lg },
  blurb: { maxWidth: 320 },
  action: { gap: space.sm, marginTop: space.lg },
  card: {
    backgroundColor: color.surface,
    borderRadius: radius.sheet,
    borderWidth: 1,
    borderColor: color.line,
    overflow: 'hidden',
  },
  cardRule: { height: StyleSheet.hairlineWidth, backgroundColor: color.line, marginHorizontal: space.lg },
  cardActions: { padding: space.md, gap: space.sm },
  secondary: {
    minHeight: MIN_TOUCH + 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: color.line,
  },
  secondaryText: { flex: 1, gap: 2 },
  devRow: {
    minHeight: MIN_TOUCH,
    justifyContent: 'center',
    paddingHorizontal: space.md,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: color.signal,
  },
  queueRow: {
    minHeight: MIN_TOUCH,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.md,
    borderRadius: radius.control,
    backgroundColor: color.surface,
  },
  listHead: { marginTop: space.xxl },
  row: {
    flexDirection: 'row',
    gap: space.lg,
    alignItems: 'center',
    backgroundColor: color.surface,
    borderRadius: radius.sheet,
    borderWidth: 1,
    borderColor: color.line,
    padding: space.md,
  },
  thumb: {
    width: 48,
    height: 84,
    backgroundColor: color.ink,
    overflow: 'hidden',
    borderRadius: radius.control,
  },
  thumbImage: { width: '100%', height: '100%' },
  rowBody: { flex: 1, gap: space.xs },
  rowProgress: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  rowTrack: { flex: 1, height: 4, borderRadius: radius.pill, backgroundColor: color.line, overflow: 'hidden' },
  rowFill: { height: '100%' },
});
