/**
 * Processing.
 *
 * The video is the hero and it plays with sound while the work happens, because
 * a minute of staring at a progress bar is a minute the user spends deciding
 * whether to leave. Underneath: one determinate bar driven by real audio
 * processed, one short status line, and the transcript arriving as it lands —
 * each of them animated (`src/ui/working.tsx`) so that the long stretch
 * between two chunks never looks like a hang.
 */
import { router, useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AppState,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { accentColor, projectStyle, projectUnits, type Project } from '../../src/domain';
import { cancelRun, currentRun, startRun, subscribe, type RunState } from '../../src/asr/runner';
import { useCopy } from '../../src/i18n';
import { loadProject } from '../../src/project/store';
import { Label, QuietButton, Screen } from '../../src/ui/atoms';
import { SteppingLine } from '../../src/ui/curtain';
import { ArrivingLine, ListeningBars, LiveProgressBar } from '../../src/ui/working';
import { color, radius, space } from '../../src/ui/theme';

export default function Processing() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [stored] = useState<Project | null>(() => (id ? loadProject(id) : null));
  const [run, setRun] = useState<RunState | null>(() => currentRun());
  const copy = useCopy().processing;

  useEffect(() => {
    if (!stored) return;

    const unsubscribe = subscribe((state) => {
      if (state.projectId === stored.id) setRun(state);
    });

    const resume = () => {
      const latest = loadProject(stored.id);
      // Reopening the app on an unfinished project picks up from the last
      // checkpoint rather than starting the clip again.
      if (latest && latest.status !== 'ready') startRun(latest);
    };

    resume();
    // iOS stops at the end of the current chunk when the app leaves the screen,
    // so coming back is what starts the rest of the work.
    const appState = AppState.addEventListener('change', (status) => {
      if (status === 'active') resume();
    });

    return () => {
      unsubscribe();
      appState.remove();
    };
  }, [stored]);

  const project = run?.project ?? stored;

  useEffect(() => {
    // Straight into the editor. No "Done!" interstitial, and `replace` so that
    // going back from the editor lands on Home rather than on a finished bar.
    if (run?.stage === 'ready') router.replace(`/project/${run.project.id}`);
  }, [run?.stage]);

  if (!project) {
    return (
      <Screen>
        <View style={[styles.empty, { paddingTop: insets.top + space.huge }]}>
          <Label variant="heading">{copy.gone}</Label>
          <QuietButton title={copy.backHome} onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  const accent = accentColor(projectStyle(project));
  const stage = run?.stage ?? (project.status === 'failed' ? 'failed' : 'queued');
  // Moving only while something is actually happening: a paused or failed run
  // with a meter still bouncing would be lying about it.
  const working = stage === 'queued' || stage === 'extracting' || stage === 'transcribing' || stage === 'aligning';

  return (
    <Screen>
      <View style={{ paddingTop: insets.top, height: insets.top + windowHeight * 0.5 }}>
        <Preview project={project} />
      </View>

      <View style={styles.status}>
        <LiveProgressBar fraction={run?.fraction ?? 0} accent={accent} active={working} />
        <View style={styles.statusRow}>
          <View style={styles.stageLine}>
            <ListeningBars accent={accent} active={working} />
            <Label variant="label" tone={stage === 'failed' ? 'signal' : 'mute'}>
              {stage === 'failed' ? (run?.error ?? copy.stage.failed) : copy.stage[stage]}
            </Label>
          </View>
          <Label variant="label" tone="mute">
            {Math.round((run?.fraction ?? 0) * 100)}%
          </Label>
        </View>
        {run?.etaMs !== undefined && stage === 'transcribing' ? (
          <Label variant="micro" tone="mute">
            {copy.aboutLeft(formatSeconds(run.etaMs, copy))}
          </Label>
        ) : null}
      </View>

      <Transcript project={project} settled={stage === 'ready'} accent={accent} />

      <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
        {stage === 'ready' ? (
          <QuietButton title={copy.backHome} onPress={() => router.back()} />
        ) : (
          <QuietButton
            title={copy.cancel}
            tone="signal"
            onPress={() => {
              cancelRun();
              router.back();
            }}
          />
        )}
      </View>
    </Screen>
  );
}

/** Tap to play or pause, with sound. Nothing about this screen is muted. */
function Preview({ project }: { project: Project }) {
  const player = useVideoPlayer(project.sourceUri, (instance) => {
    instance.loop = true;
    instance.muted = false;
  });
  const [playing, setPlaying] = useState(false);
  const words = useCopy();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={playing ? words.common.pause : words.common.play}
      onPress={() => {
        if (playing) player.pause();
        else player.play();
        setPlaying(!playing);
      }}
      style={styles.preview}
    >
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="contain"
        nativeControls={false}
      />
      {!playing ? (
        <View style={styles.playHint}>
          <Label variant="label" tone="mute">
            {words.processing.tapToPlay}
          </Label>
        </View>
      ) : null}
    </Pressable>
  );
}

/**
 * Lines as they land.
 *
 * Each line rises in as it arrives, and the newest is greyed with its last word
 * in the box highlight, so the user can see the difference between a line that
 * is finished and one that is still arriving. Before the first words, the
 * highlight steps along a line of its own. Nothing here is editable until the
 * whole pass is done.
 */
function Transcript({ project, settled, accent }: { project: Project; settled: boolean; accent: string }) {
  const scroller = useRef<ScrollView>(null);
  const lines = useMemo(() => projectUnits(project), [project]);
  const copy = useCopy().processing;

  useEffect(() => {
    scroller.current?.scrollToEnd({ animated: true });
  }, [lines.length]);

  if (lines.length === 0) {
    return (
      <View style={styles.transcriptEmpty}>
        <SteppingLine text={copy.listening} variant="heading" accent={accent} />
      </View>
    );
  }

  return (
    <ScrollView ref={scroller} style={styles.transcript} contentContainerStyle={styles.transcriptBody}>
      {lines.map((line, index) => (
        <ArrivingLine
          key={line.words[0].id}
          text={line.words.map((word) => word.text).join(' ')}
          latest={!settled && index === lines.length - 1}
          accent={accent}
        />
      ))}
    </ScrollView>
  );
}

function formatSeconds(ms: number, copy: { seconds: (s: number) => string; minutes: (m: number, s: number) => string }): string {
  const seconds = Math.max(1, Math.round(ms / 1000));
  if (seconds < 60) return copy.seconds(seconds);
  return copy.minutes(Math.floor(seconds / 60), seconds % 60);
}

const styles = StyleSheet.create({
  preview: {
    flex: 1,
    width: '100%',
    backgroundColor: '#000000',
    // Never rounded: the export is not rounded either.
    borderRadius: radius.video,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  playHint: { paddingBottom: space.lg },
  status: { paddingHorizontal: space.lg, paddingTop: space.lg, gap: space.sm },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stageLine: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexShrink: 1 },
  transcript: { flex: 1, marginTop: space.lg },
  transcriptBody: { paddingHorizontal: space.lg, paddingBottom: space.lg, gap: space.sm },
  transcriptEmpty: { flex: 1, paddingHorizontal: space.lg, paddingTop: space.xl, alignItems: 'center' },
  footer: {
    borderTopWidth: 1,
    borderTopColor: color.line,
    alignItems: 'center',
    paddingTop: space.sm,
  },
  empty: { flex: 1, alignItems: 'center', gap: space.lg },
});
