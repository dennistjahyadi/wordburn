/**
 * What "working" looks like while a clip is transcribed.
 *
 * Processing is the screen people watch longest without touching, and a bar
 * that moves once per 28-second chunk reads as stuck between moves. Three
 * small things say otherwise: a meter that listens, a bar that eases forward
 * and carries a light across it, and words that arrive rather than appear.
 *
 * All of it runs on the native driver, because the JS thread is exactly what
 * transcription keeps busy and an animation driven from it would stutter in
 * the place it most needs to be smooth. Under reduced motion every piece holds
 * still and the screen is the plain one it was before.
 */
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { Label } from './atoms';
import { readableOn } from './color';
import { useReducedMotion } from './motion';
import { color, ON_ACCENT, radius, space } from './theme';

/**
 * Five bars rising and falling out of step, like a level meter. Stops — bars
 * flat — when `active` is false, so a paused or failed run does not look as if
 * it is still listening.
 */
export function ListeningBars({ accent, active }: { accent: string; active: boolean }) {
  const reducedMotion = useReducedMotion();
  const bars = useRef([0, 1, 2, 3, 4].map(() => new Animated.Value(0.3))).current;

  useEffect(() => {
    if (reducedMotion || !active) {
      bars.forEach((bar) => bar.setValue(0.3));
      return;
    }

    // Each bar its own period and height, so the five never fall into step and
    // read as one thing bouncing.
    const loops = bars.map((bar, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(bar, {
            toValue: [0.9, 0.6, 1, 0.7, 0.85][index],
            duration: [380, 460, 340, 520, 420][index],
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(bar, {
            toValue: [0.25, 0.35, 0.2, 0.3, 0.4][index],
            duration: [420, 360, 480, 400, 440][index],
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      )
    );
    loops.forEach((loop, index) => setTimeout(() => loop.start(), index * 90));
    return () => loops.forEach((loop) => loop.stop());
  }, [active, bars, reducedMotion]);

  return (
    <View style={styles.bars} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {bars.map((bar, index) => (
        <Animated.View
          key={index}
          style={[styles.bar, { backgroundColor: accent, transform: [{ scaleY: bar }] }]}
        />
      ))}
    </View>
  );
}

/**
 * The determinate bar, made to look alive.
 *
 * The fill eases to each new value instead of jumping: progress arrives once
 * per chunk, and a bar that leaps 30% and then sits still for half a minute
 * looks broken in both halves. A soft light sweeps along the filled part while
 * the work is running, which is the part that says "still going" between
 * chunks. Scale and translate only, so both stay on the native driver.
 */
export function LiveProgressBar({
  fraction,
  accent,
  active,
}: {
  fraction: number;
  accent: string;
  active: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const [width, setWidth] = useState(0);
  const fill = useRef(new Animated.Value(clamp(fraction))).current;
  const sweep = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reducedMotion) {
      fill.setValue(clamp(fraction));
      return;
    }
    Animated.timing(fill, {
      toValue: clamp(fraction),
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [fill, fraction, reducedMotion]);

  useEffect(() => {
    if (reducedMotion || !active) {
      sweep.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(sweep, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [active, reducedMotion, sweep]);

  // The fill is the full width scaled from the left: a scale about the centre
  // shifted by half the lost width, which is what transformOrigin would do.
  const fillTranslate = fill.interpolate({ inputRange: [0, 1], outputRange: [-width / 2, 0] });
  const glint = 64;
  const sweepTranslate = Animated.multiply(sweep, fill).interpolate({
    inputRange: [0, 1],
    outputRange: [-glint, width],
  });

  return (
    <View
      style={styles.track}
      onLayout={(event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width)}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamp(fraction) * 100) }}
    >
      <Animated.View
        style={[
          styles.fill,
          { backgroundColor: accent, transform: [{ translateX: fillTranslate }, { scaleX: fill }] },
        ]}
      />
      {active && !reducedMotion && width > 0 ? (
        <Animated.View style={[styles.glint, { width: glint, transform: [{ translateX: sweepTranslate }] }]} />
      ) : null}
    </View>
  );
}

/**
 * A transcript line that arrives: it fades up from a few points below, and
 * while it is the newest line its last word wears the box highlight — the
 * product's own mark, on the word the engine just wrote.
 */
export function ArrivingLine({
  text,
  latest,
  accent,
}: {
  text: string;
  latest: boolean;
  accent: string;
}) {
  const reducedMotion = useReducedMotion();
  const enter = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;

  useEffect(() => {
    if (reducedMotion) return;
    Animated.timing(enter, {
      toValue: 1,
      duration: 360,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [enter, reducedMotion]);

  const translateY = enter.interpolate({ inputRange: [0, 1], outputRange: [10, 0] });
  const words = text.split(' ');
  const last = words.pop() ?? '';

  return (
    <Animated.View style={[styles.line, { opacity: enter, transform: [{ translateY }] }]}>
      {latest ? (
        <Label variant="body" tone="mute">
          {words.length > 0 ? `${words.join(' ')} ` : ''}
          <Label variant="body" style={[styles.newest, { backgroundColor: accent, color: readableOn(accent, ON_ACCENT, color.paper) }]}>
            {` ${last} `}
          </Label>
        </Label>
      ) : (
        <Label variant="body">{text}</Label>
      )}
    </Animated.View>
  );
}

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}

const styles = StyleSheet.create({
  bars: { flexDirection: 'row', alignItems: 'center', gap: 3, height: 16 },
  bar: { width: 3, height: 16, borderRadius: radius.pill },
  track: { height: 4, borderRadius: radius.pill, backgroundColor: color.line, overflow: 'hidden' },
  fill: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, borderRadius: radius.pill },
  glint: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: radius.pill,
  },
  line: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  newest: { borderRadius: radius.control, overflow: 'hidden' },
});
