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
import { isPro } from '../src/policy/pro';
import { loadProStatus } from '../src/policy/entitlement-store';
import { autoclip, batch as batchCopy } from '../src/ui/copy';
import { requestNotifications } from '../src/native/foreground-service';
import { freeTierStatus } from '../src/policy/free-tier';
import { loadEntitlement } from '../src/policy/entitlement-store';
import { deleteProject, listProjects, loadPipeline, thumbnailFile } from '../src/project/store';
import { loadSettings, rememberLanguage } from '../src/project/settings';
import { makeThumbnail } from '../src/project/thumbnail';
import { Label, PrimaryButton, Screen } from '../src/ui/atoms';
import { Curtain } from '../src/ui/curtain';
import { describeProject, plural } from '../src/ui/describe';
import { ensureLanguageReady, LanguageChip } from '../src/ui/language';
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

  /**
   * One long video, read to find the clips worth posting. Anything under five
   * minutes is a clip already; anything over the cap is read up to the cap.
   */
  async function pickLong() {
    if (!proOnly(autoclip.proTitle, autoclip.proBody, 'autoclip')) return;
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
      const durationMs = Math.round(asset.duration ?? 0);
      const capMs = autoClipCapMs(language);

      if (durationMs > 0 && durationMs < AUTO_CLIP_MIN_MS) {
        setPicking(false);
        Alert.alert(autoclip.tooShortTitle, autoclip.tooShortBody);
        return;
      }

      const go = async () => {
        await requestNotifications();
        const project = beginProject(asset.uri, durationMs, language, {
          purpose: 'autoclip',
          sourceName: pickedClipName(asset.fileName, null, new Date()),
          ...(durationMs > capMs ? { transcribeUntilMs: capMs } : {}),
        });
        void makeThumbnail(project);
        router.push(`/processing/${project.id}`);
      };

      if (durationMs > capMs) {
        const minutes = Math.round(capMs / 60_000);
        Alert.alert(autoclip.tooLongTitle(minutes), autoclip.tooLongBody(minutes, Math.round(durationMs / 60_000)), [
          { text: autoclip.cancel, style: 'cancel', onPress: () => setPicking(false) },
          { text: autoclip.continue, onPress: () => void go() },
        ]);
        return;
      }
      await go();
    } catch (error) {
      setPicking(false);
      Alert.alert('That video could not be opened', describe(error));
    }
  }

  function open(project: Project) {
    if (project.status === 'ready') {
      router.push(project.purpose === 'autoclip' ? `/autoclip/${project.id}` : `/project/${project.id}`);
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
              Caption one clip, queue a batch, or cut shorts from a long video.
            </Label>

            <View style={styles.action}>
              <LanguageChip
                language={language}
                accent={DEFAULT_ACCENT}
                from="language"
                onChange={(next) => {
                  setLanguage(next);
                  rememberLanguage(next);
                }}
              />
              <PrimaryButton
                title="New video"
                onPress={pickVideo}
                accent={DEFAULT_ACCENT}
                busy={picking}
              />
              <View style={styles.more}>
                <SecondaryAction title={batchCopy.home} note={batchCopy.homeNote} onPress={pickBatch} />
                <SecondaryAction title={autoclip.home} note={autoclip.homeNote} onPress={pickLong} />
              </View>
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

/** Auto clip is for long videos; under this, New video is the right door. */
const AUTO_CLIP_MIN_MS = 5 * 60_000;

/**
 * How much of a long video auto clip reads. An hour in English, which the
 * Stage 0 budget of 45 seconds per minute of audio puts at up to 45 minutes of
 * phone time; half an hour in the other four, whose model is several times
 * heavier and whose speed on the A54 is not measured yet. Longer, and the phone
 * is busy for longer than anybody will leave it alone.
 */
function autoClipCapMs(language: Language): number {
  return language === 'en' ? 60 * 60_000 : 30 * 60_000;
}

function SecondaryAction({ title, note, onPress }: { title: string; note: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${note}.`}
      onPress={onPress}
      style={({ pressed }) => [styles.secondary, { opacity: pressed ? 0.7 : 1 }]}
    >
      <Label variant="heading">{title}</Label>
      <Label variant="micro" tone="mute">
        {note}
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
  more: { flexDirection: 'row', gap: space.sm },
  secondary: {
    flex: 1,
    minHeight: MIN_TOUCH + 20,
    justifyContent: 'center',
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: color.line,
    gap: 2,
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
