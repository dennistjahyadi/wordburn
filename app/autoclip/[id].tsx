/**
 * Auto clip: the suggestions.
 *
 * The strongest moments in the long video, best first, each with enough to
 * judge it without playing it — a frame, its first line, its length, its score
 * and why — and one tap to hear it. Everything here is a proposal: a clip can be
 * moved, cut shorter, stripped of its dead air, removed, or joined by one the
 * user finds themselves. Nothing is rendered until they say which ones, and then
 * the chosen clips go to the batch queue like any other batch.
 */
import { useEvent } from 'expo';
import { router, useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { track } from '../../src/analytics/events';
import { setDraft } from '../../src/batch/draft';
import {
  cutName,
  deadAirEdit,
  projectLanguage,
  quietStretches,
  snapToWords,
  suggestClips,
  type ClipReason,
  type DeadAirEdit,
  type Ms,
  type Project,
  type Word,
} from '../../src/domain';
import { Sheet } from '../../src/editor/Sheet';
import { loadEnvelope, loadProject } from '../../src/project/store';
import { Divider, Label, PrimaryButton, QuietButton, Screen } from '../../src/ui/atoms';
import { autoclip as copy } from '../../src/ui/copy';
import { color, DEFAULT_ACCENT, MIN_TOUCH, radius, space } from '../../src/ui/theme';

interface ClipDraft {
  key: string;
  startMs: Ms;
  endMs: Ms;
  /** Null for a clip the user added: nothing scored it. */
  score: number | null;
  reasons: ClipReason[];
  deadAir: boolean;
  selected: boolean;
}

/** A clip the user sets by hand may be shorter or longer than a suggestion. */
const MIN_CLIP_MS = 3_000;
const MAX_CLIP_MS = 90_000;

export default function AutoClip() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const project = useMemo(() => (id ? loadProject(String(id)) : null), [id]);
  const envelope = useMemo(() => (project ? loadEnvelope(project.id) : null), [project]);

  const [clips, setClips] = useState<ClipDraft[]>(() => {
    if (!project) return [];
    return suggestClips(project.words, project.durationMs, projectLanguage(project)).map((clip, index) => ({
      key: `s${index}`,
      startMs: clip.startMs,
      endMs: clip.endMs,
      score: clip.score,
      reasons: clip.reasons,
      deadAir: false,
      // The top five, not all ten: a suggestion is a proposal, and ten renders
      // nobody chose is a queue the user has to empty by hand.
      selected: index < 5,
    }));
  });
  const [editing, setEditing] = useState<string | null>(null);

  // Once per visit to a freshly read video: how long it was, and how much it gave.
  const tracked = useRef(false);
  useEffect(() => {
    if (!project || tracked.current) return;
    tracked.current = true;
    track({
      name: 'autoclip_run',
      duration_min: Math.round(project.durationMs / 60_000),
      clips_found: clips.length,
    });
  }, [project, clips.length]);

  if (!project) {
    return (
      <Screen>
        <View style={styles.missing}>
          <Label variant="body" tone="mute">
            This video is no longer on the phone.
          </Label>
          <QuietButton title="Back" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  const selected = clips.filter((clip) => clip.selected);
  const editingClip = clips.find((clip) => clip.key === editing) ?? null;
  const language = projectLanguage(project);

  function update(key: string, change: Partial<ClipDraft>) {
    setClips((current) => current.map((clip) => (clip.key === key ? { ...clip, ...change } : clip)));
  }

  function addOwn() {
    if (!project) return;
    // Somewhere nobody has claimed yet: the middle of the longest stretch that
    // no clip covers, which is where a user is most likely to go looking.
    const middle = uncoveredMiddle(clips, project.durationMs);
    const snapped = snapToWords(project.words, middle - 15_000, middle + 15_000);
    if (!snapped) return;
    const key = `own${Date.now().toString(36)}`;
    setClips((current) => [
      ...current,
      {
        key,
        startMs: snapped.startMs,
        endMs: snapped.endMs,
        score: null,
        reasons: [],
        deadAir: false,
        selected: true,
      },
    ]);
    setEditing(key);
  }

  function caption() {
    if (!project || selected.length === 0) return;
    const sourceName = project.sourceName ?? 'clip';
    setDraft({
      language,
      jobs: selected.map((clip) => {
        const range = { startMs: clip.startMs, endMs: clip.endMs };
        const edit = clip.deadAir ? deadAirFor(project, envelope, clip) : null;
        return {
          name: cutName(sourceName, clip.startMs),
          durationMs: edit ? edit.keptMs : clip.endMs - clip.startMs,
          source: {
            kind: 'cut' as const,
            projectId: project.id,
            segments: edit ? edit.segments : [range],
            removedWordIds: edit ? edit.removedWordIds : [],
          },
        };
      }),
    });
    router.push('/batch/new');
  }

  return (
    <Screen>
      <View style={[styles.bar, { paddingTop: insets.top + space.sm }]}>
        <QuietButton title="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
        <Label variant="label" tone="mute">
          {copy.resultsTitle}
        </Label>
        <View style={styles.balance} />
      </View>

      <FlatList
        data={clips}
        keyExtractor={(clip) => clip.key}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + space.huge * 2 }]}
        ListHeaderComponent={
          <Label variant="label" tone="mute" style={styles.note}>
            {copy.resultsNote(clips.filter((clip) => clip.score !== null).length)}
          </Label>
        }
        ListFooterComponent={<QuietButton title={copy.addOwn} accent={DEFAULT_ACCENT} onPress={addOwn} />}
        renderItem={({ item }) => (
          <ClipRow
            clip={item}
            project={project}
            envelope={envelope}
            onToggle={() => update(item.key, { selected: !item.selected })}
            onAdjust={() => setEditing(item.key)}
            onRemove={() => setClips((current) => current.filter((clip) => clip.key !== item.key))}
          />
        )}
      />

      <View style={[styles.dock, { paddingBottom: insets.bottom + space.md }]}>
        <Divider />
        <PrimaryButton
          title={copy.caption(selected.length)}
          accent={DEFAULT_ACCENT}
          disabled={selected.length === 0}
          onPress={caption}
        />
      </View>

      {editingClip ? (
        <AdjustSheet
          clip={editingClip}
          project={project}
          envelope={envelope}
          onChange={(change) => update(editingClip.key, change)}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </Screen>
  );
}

function ClipRow({
  clip,
  project,
  envelope,
  onToggle,
  onAdjust,
  onRemove,
}: {
  clip: ClipDraft;
  project: Project;
  envelope: Float32Array | null;
  onToggle: () => void;
  onAdjust: () => void;
  onRemove: () => void;
}) {
  const [thumb, setThumb] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    VideoThumbnails.getThumbnailAsync(project.sourceUri, { time: clip.startMs + 500, quality: 0.5 })
      .then(({ uri }) => alive && setThumb(uri))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [project.sourceUri, clip.startMs]);

  const edit = clip.deadAir ? deadAirFor(project, envelope, clip) : null;
  const seconds = Math.round((edit ? edit.keptMs : clip.endMs - clip.startMs) / 1000);

  return (
    <View style={[styles.row, { borderColor: clip.selected ? DEFAULT_ACCENT : color.line }]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: clip.selected }}
        onPress={onToggle}
        style={styles.rowMain}
      >
        <View style={styles.thumb}>{thumb ? <Image source={{ uri: thumb }} style={styles.thumbImage} /> : null}</View>
        <View style={styles.rowBody}>
          <Label variant="body" numberOfLines={2}>
            {firstLine(project.words, clip.startMs, clip.endMs)}
          </Label>
          <Label variant="micro" tone="mute" numberOfLines={1}>
            {[
              `${formatClock(clip.startMs)} · ${copy.duration(seconds)}`,
              ...clip.reasons.filter((reason) => reason !== 'complete').slice(0, 1).map((reason) => copy.reasons[reason]),
            ].join(' · ')}
          </Label>
        </View>
        {clip.score !== null ? (
          <View style={styles.score}>
            <Label variant="label" style={styles.scoreText}>
              {copy.score(clip.score)}
            </Label>
          </View>
        ) : null}
      </Pressable>
      <View style={styles.rowActions}>
        <QuietButton title={copy.adjust} accent={DEFAULT_ACCENT} onPress={onAdjust} />
        <QuietButton title={copy.remove} onPress={onRemove} />
      </View>
    </View>
  );
}

/**
 * Where a clip starts and ends, heard and moved.
 *
 * The preview loops the range so the user hears exactly what they will get.
 * The timeline is a window a little wider than the clip, because a clip is
 * adjusted by seconds, not by minutes; the handles snap to whole words when
 * they are let go, so a cut can never land inside one.
 */
function AdjustSheet({
  clip,
  project,
  envelope,
  onChange,
  onClose,
}: {
  clip: ClipDraft;
  project: Project;
  envelope: Float32Array | null;
  onChange: (change: Partial<ClipDraft>) => void;
  onClose: () => void;
}) {
  const language = projectLanguage(project);
  const player = useVideoPlayer(project.sourceUri, (instance) => {
    instance.loop = false;
    instance.muted = false;
  });
  const playing = useEvent(player, 'playingChange', { isPlaying: player.playing })?.isPlaying ?? false;

  const range = useRef({ startMs: clip.startMs, endMs: clip.endMs });
  range.current = { startMs: clip.startMs, endMs: clip.endMs };

  useEffect(() => {
    player.currentTime = clip.startMs / 1000;
    player.play();
    // Loops the range, not the file: back to the start once playback passes the end.
    const timer = setInterval(() => {
      if (player.currentTime * 1000 >= range.current.endMs) player.currentTime = range.current.startMs / 1000;
    }, 100);
    return () => {
      clearInterval(timer);
      try {
        player.pause();
      } catch {
        // Released already, on unmount.
      }
    };
    // Only on open: a moved start is picked up by `restart`, not by re-running this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function restart(startMs: Ms) {
    player.currentTime = startMs / 1000;
    player.play();
  }

  function setRange(startMs: Ms, endMs: Ms) {
    const snapped = snapToWords(project.words, startMs, endMs);
    if (!snapped) return;
    const length = snapped.endMs - snapped.startMs;
    if (length < MIN_CLIP_MS || length > MAX_CLIP_MS) return;
    onChange({ startMs: snapped.startMs, endMs: snapped.endMs });
    if (snapped.startMs !== clip.startMs) restart(snapped.startMs);
  }

  /**
   * One whole word earlier or later, at either edge.
   *
   * By time, not by index: whisper's timestamps give neighbouring words the
   * same start often enough (58 of 985 on a seven-minute test) that stepping to
   * the next index can land on the same instant, and the button looks dead.
   */
  function nudge(edge: 'start' | 'end', direction: -1 | 1) {
    const words = project.words;
    if (edge === 'start') {
      const next =
        direction > 0
          ? words.find((word) => word.start > clip.startMs)
          : [...words].reverse().find((word) => word.start < clip.startMs);
      if (next) setRange(next.start, clip.endMs);
    } else {
      const next =
        direction > 0
          ? words.find((word) => word.end > clip.endMs)
          : [...words].reverse().find((word) => word.end < clip.endMs);
      if (next) setRange(clip.startMs, next.end);
    }
  }

  const edit = deadAirFor(project, envelope, clip);

  return (
    <Sheet onClose={onClose}>
      <ScrollView style={styles.sheet} contentContainerStyle={styles.sheetBody}>
        <Pressable
          onPress={() => (playing ? player.pause() : player.play())}
          style={styles.preview}
          accessibilityRole="button"
          accessibilityLabel={playing ? 'Pause' : 'Play'}
        >
          <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="contain" nativeControls={false} />
        </Pressable>

        <RangeTimeline
          durationMs={project.durationMs}
          startMs={clip.startMs}
          endMs={clip.endMs}
          onCommit={(startMs, endMs) => setRange(startMs, endMs)}
        />

        <View style={styles.steppers}>
          <Stepper label={`${copy.start} ${formatClock(clip.startMs)}`} onEarlier={() => nudge('start', -1)} onLater={() => nudge('start', 1)} />
          <Stepper label={`${copy.end} ${formatClock(clip.endMs)}`} onEarlier={() => nudge('end', -1)} onLater={() => nudge('end', 1)} />
        </View>

        <Label variant="label" tone="mute" numberOfLines={6}>
          {textOf(project.words, clip.startMs, clip.endMs)}
        </Label>

        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: clip.deadAir }}
          onPress={() => onChange({ deadAir: !clip.deadAir })}
          style={styles.toggle}
        >
          <View style={styles.toggleText}>
            <Label variant="body">{copy.deadAir}</Label>
            <Label variant="micro" tone="mute">
              {copy.deadAirSaving(Math.round(edit.originalMs / 1000), Math.round(edit.keptMs / 1000))}
            </Label>
          </View>
          <View style={[styles.switch, { backgroundColor: clip.deadAir ? DEFAULT_ACCENT : color.line }]}>
            <View style={[styles.knob, { alignSelf: clip.deadAir ? 'flex-end' : 'flex-start' }]} />
          </View>
        </Pressable>

        <PrimaryButton title={copy.done} accent={DEFAULT_ACCENT} onPress={onClose} />
      </ScrollView>
    </Sheet>
  );
}

/**
 * The clip on a strip of the video around it, with a handle at each end.
 *
 * Dragging moves a handle freely; letting go commits it, and the commit snaps
 * to words. The window is fixed while a handle is held so the strip does not
 * slide under the finger.
 */
function RangeTimeline({
  durationMs,
  startMs,
  endMs,
  onCommit,
}: {
  durationMs: Ms;
  startMs: Ms;
  endMs: Ms;
  onCommit: (startMs: Ms, endMs: Ms) => void;
}) {
  const [width, setWidth] = useState(0);
  const [draft, setDraftRange] = useState<{ startMs: Ms; endMs: Ms } | null>(null);
  const shown = draft ?? { startMs, endMs };

  const windowStart = Math.max(0, Math.min(startMs, shown.startMs) - 20_000);
  const windowEnd = Math.min(durationMs, Math.max(endMs, shown.endMs) + 20_000);
  const span = Math.max(1, windowEnd - windowStart);

  // Everything a responder reads goes through a ref: a PanResponder keeps the
  // callbacks of the render that built it (CLAUDE.md, "the hard way").
  const live = useRef({ width, windowStart, span, startMs, endMs, onCommit });
  live.current = { width, windowStart, span, startMs, endMs, onCommit };
  const dragging = useRef<{ edge: 'start' | 'end'; at: Ms } | null>(null);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (event) => {
          const { width: w, windowStart: ws, span: sp, startMs: s, endMs: e } = live.current;
          const at = ws + (event.nativeEvent.locationX / Math.max(1, w)) * sp;
          const edge = Math.abs(at - s) <= Math.abs(at - e) ? 'start' : 'end';
          dragging.current = { edge, at };
        },
        onPanResponderMove: (event) => {
          const { width: w, windowStart: ws, span: sp, startMs: s, endMs: e } = live.current;
          const at = ws + (Math.min(Math.max(event.nativeEvent.locationX, 0), w) / Math.max(1, w)) * sp;
          if (!dragging.current) return;
          dragging.current.at = at;
          setDraftRange(dragging.current.edge === 'start' ? { startMs: Math.min(at, e - MIN_CLIP_MS), endMs: e } : { startMs: s, endMs: Math.max(at, s + MIN_CLIP_MS) });
        },
        onPanResponderRelease: () => {
          const { startMs: s, endMs: e, onCommit: commit } = live.current;
          const held = dragging.current;
          dragging.current = null;
          setDraftRange(null);
          if (!held) return;
          if (held.edge === 'start') commit(Math.min(held.at, e - MIN_CLIP_MS), e);
          else commit(s, Math.max(held.at, s + MIN_CLIP_MS));
        },
      }),
    []
  );

  const left = ((shown.startMs - windowStart) / span) * width;
  const right = ((shown.endMs - windowStart) / span) * width;

  return (
    <View
      style={styles.timeline}
      onLayout={(event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width)}
      {...responder.panHandlers}
    >
      <View style={styles.track} />
      <View style={[styles.rangeFill, { left, width: Math.max(2, right - left) }]} />
      <View style={[styles.handle, { left: left - 6 }]} />
      <View style={[styles.handle, { left: right - 6 }]} />
    </View>
  );
}

function Stepper({ label, onEarlier, onLater }: { label: string; onEarlier: () => void; onLater: () => void }) {
  return (
    <View style={styles.stepper}>
      <Pressable accessibilityRole="button" accessibilityLabel={`${label}, earlier`} onPress={onEarlier} style={styles.stepButton}>
        <Label variant="label">{copy.earlier}</Label>
      </Pressable>
      <Label variant="label" tone="mute">
        {label}
      </Label>
      <Pressable accessibilityRole="button" accessibilityLabel={`${label}, later`} onPress={onLater} style={styles.stepButton}>
        <Label variant="label">{copy.later}</Label>
      </Pressable>
    </View>
  );
}

/**
 * The dead-air edit for one clip. The envelope is what finds the pauses —
 * whisper's word timings run straight through them — and a project without one
 * falls back to the gaps between words, which is better than nothing.
 */
function deadAirFor(project: Project, envelope: Float32Array | null, clip: { startMs: Ms; endMs: Ms }): DeadAirEdit {
  const range = { startMs: clip.startMs, endMs: clip.endMs };
  const language = projectLanguage(project);
  const quiet = envelope ? quietStretches(envelope, project.words, range) : [];
  return deadAirEdit(project.words, range, language, {}, quiet);
}

function textOf(words: Word[], startMs: Ms, endMs: Ms): string {
  return words
    .filter((word) => word.start >= startMs && word.end <= endMs)
    .map((word) => word.text)
    .join(' ');
}

/** The clip's opening, cut at a sentence end or about a line's length. */
function firstLine(words: Word[], startMs: Ms, endMs: Ms): string {
  const text = textOf(words, startMs, endMs);
  const sentence = /^.{20,90}?[.?!](\s|$)/.exec(text)?.[0].trim();
  if (sentence) return sentence;
  return text.length > 90 ? `${text.slice(0, 88).trimEnd()}…` : text;
}

function uncoveredMiddle(clips: ClipDraft[], durationMs: Ms): Ms {
  const covered = [...clips].sort((a, b) => a.startMs - b.startMs);
  let best = { from: 0, to: durationMs, length: -1 };
  let cursor = 0;
  for (const clip of [...covered, { startMs: durationMs, endMs: durationMs } as ClipDraft]) {
    const length = clip.startMs - cursor;
    if (length > best.length) best = { from: cursor, to: clip.startMs, length };
    cursor = Math.max(cursor, clip.endMs);
  }
  return Math.round((best.from + best.to) / 2);
}

function formatClock(ms: Ms): string {
  const total = Math.floor(ms / 1000);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = String(total % 60).padStart(2, '0');
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}:${seconds}` : `${minutes}:${seconds}`;
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
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md },
  list: { paddingHorizontal: space.lg, gap: space.sm },
  note: { marginBottom: space.md },
  row: {
    backgroundColor: color.surface,
    borderRadius: radius.sheet,
    borderWidth: 1.5,
    padding: space.md,
    gap: space.xs,
  },
  rowMain: { flexDirection: 'row', gap: space.md, alignItems: 'center' },
  thumb: { width: 45, height: 80, backgroundColor: color.ink, borderRadius: radius.control, overflow: 'hidden' },
  thumbImage: { width: '100%', height: '100%' },
  rowBody: { flex: 1, gap: space.xs },
  score: {
    minWidth: 40,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: DEFAULT_ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.sm,
  },
  scoreText: { color: color.ink },
  rowActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: space.sm },
  dock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: space.lg,
    gap: space.md,
    backgroundColor: color.ink,
  },
  sheet: { maxHeight: 640 },
  sheetBody: { gap: space.md, paddingBottom: space.md },
  preview: { height: 220, backgroundColor: color.ink, borderRadius: radius.video, overflow: 'hidden' },
  timeline: { height: 44, justifyContent: 'center' },
  track: { height: 6, borderRadius: radius.pill, backgroundColor: color.line },
  rangeFill: { position: 'absolute', height: 6, borderRadius: radius.pill, backgroundColor: DEFAULT_ACCENT },
  handle: {
    position: 'absolute',
    width: 12,
    height: 32,
    borderRadius: 4,
    backgroundColor: color.paper,
  },
  steppers: { gap: space.xs },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepButton: {
    minWidth: MIN_TOUCH + 12,
    minHeight: MIN_TOUCH,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: color.line,
  },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: MIN_TOUCH },
  toggleText: { flex: 1 },
  switch: { width: 44, height: 26, borderRadius: radius.pill, padding: 3, justifyContent: 'center' },
  knob: { width: 20, height: 20, borderRadius: radius.pill, backgroundColor: color.paper },
});
