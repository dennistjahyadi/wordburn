/**
 * The batch's on-device test, and nothing a user can reach.
 *
 * `scripts/test-batch.sh` copies a sample clip into the app's cache and opens
 * `wordburn://dev/batch-test?clip=<name>`; this queues it twice as a two-clip
 * batch through the real queue — transcription, render, gallery — and the
 * script checks MediaStore for two new files. The picker is the one step it
 * skips, because the system photo picker cannot be driven reliably by a script.
 *
 * A release build renders nothing here: `__DEV__` is false and the route
 * redirects home.
 */
import { File, Paths } from 'expo-file-system';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { startBatch } from '../../src/batch/queue';
import { loadSettings } from '../../src/project/settings';
import { Label, Screen } from '../../src/ui/atoms';

export default function BatchTest() {
  const { clip } = useLocalSearchParams<{ clip?: string }>();
  const [status, setStatus] = useState('Starting');

  useEffect(() => {
    if (!__DEV__ || !clip) return;
    const settings = loadSettings();
    const stem = String(clip).replace(/\.[A-Za-z0-9]+$/, '');
    // Two copies, because the queue moves the picker's copy into the project.
    const copies = [1, 2].map((n) => {
      const target = new File(Paths.cache, `${stem}-${n}.mp4`);
      if (target.exists) target.delete();
      new File(Paths.cache, String(clip)).copy(target);
      return target.uri;
    });
    const started = startBatch({
      id: `test-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      language: 'en',
      styleId: settings.styleId,
      styleOverrides: settings.styleOverrides,
      jobs: copies.map((uri, index) => ({
        id: `job-${index}`,
        source: { kind: 'file', uri, durationMs: 30_000 },
        name: stem,
        status: 'queued',
        progress: 0,
      })),
    });
    setStatus(started ? 'Queued two clips' : 'A batch is already running');
  }, [clip]);

  if (!__DEV__) return <Redirect href="/" />;

  return (
    <Screen>
      <View style={styles.body}>
        <Label variant="title">Batch test</Label>
        <Label variant="body" tone="mute">
          {status}
        </Label>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({ body: { flex: 1, justifyContent: 'center', padding: 24, gap: 12 } });
