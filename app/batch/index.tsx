/**
 * The queue.
 *
 * Every clip in the batch, where it is, and the one thing that can be done
 * about it: retry a failed one, open a finished one in the editor. The batch
 * runs whether or not this screen is open — it is a window onto `queue.ts`, not
 * the thing driving it — so leaving it costs nothing and coming back shows where
 * things got to.
 */
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  clearBatch,
  currentBatch,
  isBatchRunning,
  pauseBatch,
  resumeBatch,
  retryBatchJob,
  subscribeBatch,
} from '../../src/batch/queue';
import { summarize, type Batch, type BatchJob } from '../../src/domain';
import { thumbnailFile } from '../../src/project/store';
import { Label, ProgressBar, QuietButton, Screen } from '../../src/ui/atoms';
import { batch as copy } from '../../src/ui/copy';
import { color, DEFAULT_ACCENT, MIN_TOUCH, radius, space } from '../../src/ui/theme';

export default function Queue() {
  const insets = useSafeAreaInsets();
  const [batch, setBatch] = useState<Batch | null>(currentBatch);
  useEffect(() => subscribeBatch(setBatch), []);

  const summary = batch ? summarize(batch) : null;
  const running = isBatchRunning();

  return (
    <Screen>
      <View style={[styles.bar, { paddingTop: insets.top + space.sm }]}>
        <QuietButton title="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
        <Label variant="label" tone="mute">
          {copy.queueTitle}
        </Label>
        {batch && summary && !summary.finished ? (
          batch.paused === 'user' || batch.paused === 'storage' ? (
            <QuietButton title={copy.resume} accent={DEFAULT_ACCENT} onPress={resumeBatch} />
          ) : (
            <QuietButton title={copy.pause} onPress={pauseBatch} />
          )
        ) : (
          <View style={styles.balance} />
        )}
      </View>

      {!batch || !summary ? (
        <View style={styles.empty}>
          <Label variant="body" tone="mute">
            {copy.empty}
          </Label>
        </View>
      ) : (
        <FlatList
          data={batch.jobs}
          keyExtractor={(job) => job.id}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + space.xxl }]}
          ListHeaderComponent={
            <View style={styles.head}>
              <Label variant="title">{copy.summary(summary.done, summary.total)}</Label>
              {summary.failed > 0 ? (
                <Label variant="label" tone="signal">
                  {copy.failedCount(summary.failed)}
                </Label>
              ) : null}
              <ProgressBar fraction={summary.fraction} accent={DEFAULT_ACCENT} />
              {batch.paused ? (
                <Label variant="label" tone={batch.paused === 'storage' ? 'signal' : 'mute'}>
                  {copy.paused[batch.paused]}
                </Label>
              ) : null}
              {summary.finished ? (
                <>
                  <Label variant="label" tone="mute">
                    {copy.finished}
                  </Label>
                  {!running ? <QuietButton title={copy.clear} onPress={clearBatch} /> : null}
                </>
              ) : null}
            </View>
          }
          renderItem={({ item }) => <JobRow job={item} />}
        />
      )}
    </Screen>
  );
}

function JobRow({ job }: { job: BatchJob }) {
  const thumb = job.projectId ? thumbnailFile(job.projectId) : null;
  const active = job.status === 'transcribing' || job.status === 'rendering';

  return (
    <View style={styles.row}>
      <View style={styles.thumb}>
        {thumb?.exists ? <Image source={{ uri: thumb.uri }} style={styles.thumbImage} /> : null}
      </View>

      <View style={styles.rowBody}>
        <Label variant="body" numberOfLines={1}>
          {job.outputName ?? job.name}
        </Label>
        <Label
          variant="label"
          tone={job.status === 'failed' ? 'signal' : 'mute'}
          numberOfLines={2}
          style={job.status === 'done' ? { color: color.good } : undefined}
        >
          {job.status === 'failed' && job.error ? `${copy.status.failed} · ${job.error}` : copy.status[job.status]}
        </Label>
        {active ? <ProgressBar fraction={job.progress} accent={DEFAULT_ACCENT} /> : null}
      </View>

      {job.status === 'failed' ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => retryBatchJob(job.id)}
          style={({ pressed }) => [styles.action, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Label variant="label" style={{ color: DEFAULT_ACCENT }}>
            {copy.retry}
          </Label>
        </Pressable>
      ) : null}
      {job.status === 'done' && job.projectId ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/project/${job.projectId}`)}
          style={({ pressed }) => [styles.action, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Label variant="label" tone="mute">
            {copy.open}
          </Label>
        </Pressable>
      ) : null}
    </View>
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
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: space.lg, gap: space.sm },
  head: { gap: space.sm, marginBottom: space.lg, marginTop: space.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: color.surface,
    borderRadius: radius.sheet,
    borderWidth: 1,
    borderColor: color.line,
    padding: space.md,
  },
  thumb: { width: 36, height: 64, backgroundColor: color.ink, borderRadius: radius.control, overflow: 'hidden' },
  thumbImage: { width: '100%', height: '100%' },
  rowBody: { flex: 1, gap: space.xs },
  action: { minWidth: MIN_TOUCH, minHeight: MIN_TOUCH, alignItems: 'center', justifyContent: 'center' },
});
