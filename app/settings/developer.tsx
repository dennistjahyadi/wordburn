/**
 * Settings → Developer. Debug and QA builds only.
 *
 * Be any customer without Google Play: free, subscribed on any plan, cancelled
 * but paid up, on hold, or the legacy lifetime unlock. The choice is laid over
 * what Play last said rather than written into it, so "Google Play" puts the
 * real answer straight back. See `src/policy/dev-override.ts` for why none of
 * this can reach a Play build.
 */
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DEV_TOOLS, QA_BUILD, type ProOverride } from '../../src/policy/dev-override';
import {
  loadProOverride,
  loadStoredEntitlement,
  saveProOverride,
} from '../../src/policy/entitlement-store';
import { proStatus, type ProStatus } from '../../src/policy/pro';
import { loadSettings, saveSettings } from '../../src/project/settings';
import { Divider, Label, QuietButton, Screen } from '../../src/ui/atoms';
import { color, DEFAULT_ACCENT, MIN_TOUCH, radius, space } from '../../src/ui/theme';

const CHOICES: { label: string; note: string; override: ProOverride }[] = [
  { label: 'Google Play', note: 'No override: what Play last said', override: { kind: 'play' } },
  { label: 'Free', note: 'Watermark, Pro doors closed', override: { kind: 'free' } },
  { label: 'Subscribed · weekly', note: 'Pro, renewing', override: { kind: 'subscribed', plan: 'weekly' } },
  { label: 'Subscribed · monthly', note: 'Pro, renewing', override: { kind: 'subscribed', plan: 'monthly' } },
  { label: 'Subscribed · yearly', note: 'Pro, renewing', override: { kind: 'subscribed', plan: 'yearly' } },
  { label: 'Cancelled · yearly', note: 'Pro until the period ends', override: { kind: 'cancelled', plan: 'yearly' } },
  { label: 'On hold · yearly', note: 'Payment failed or paused: not Pro', override: { kind: 'on-hold', plan: 'yearly' } },
  { label: 'Lifetime unlock', note: 'The legacy one-time purchase', override: { kind: 'lifetime' } },
];

export default function Developer() {
  const insets = useSafeAreaInsets();
  const [override, setOverride] = useState<ProOverride>(loadProOverride);
  const [welcomeAgain, setWelcomeAgain] = useState(false);

  if (!DEV_TOOLS) return <Redirect href="/settings" />;

  const play = proStatus(loadStoredEntitlement());

  function choose(next: ProOverride) {
    saveProOverride(next);
    setOverride(next);
  }

  return (
    <Screen>
      <View style={[styles.bar, { paddingTop: insets.top + space.sm }]}>
        <QuietButton title="Back" onPress={() => router.back()} />
        <Label variant="label" tone="mute">
          Developer
        </Label>
        <View style={styles.balance} />
      </View>

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + space.xxl }]}>
        <Label variant="micro" tone="mute">
          {QA_BUILD ? 'QA build' : 'Debug build'} · nothing on this screen exists in a build uploaded to Google Play.
        </Label>

        <View style={styles.block}>
          <Label variant="heading">Pro</Label>
          <Label variant="label" tone="mute">
            Google Play says: {describePlay(play)}
          </Label>
          <View style={styles.choices} accessibilityRole="radiogroup">
            {CHOICES.map((choice) => {
              const selected = JSON.stringify(choice.override) === JSON.stringify(override);
              return (
                <Pressable
                  key={choice.label}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => choose(choice.override)}
                  style={({ pressed }) => [
                    styles.choice,
                    { borderColor: selected ? DEFAULT_ACCENT : color.line, opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <Label variant="body">{choice.label}</Label>
                  <Label variant="micro" tone="mute">
                    {choice.note}
                  </Label>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Divider />

        <View style={styles.block}>
          <Label variant="heading">First launch</Label>
          <QuietButton
            title={welcomeAgain ? 'Welcome shows on the next launch' : 'Show Welcome on the next launch'}
            accent={DEFAULT_ACCENT}
            onPress={() => {
              saveSettings({ ...loadSettings(), welcomeSeen: false });
              setWelcomeAgain(true);
            }}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

function describePlay(status: ProStatus): string {
  switch (status.kind) {
    case 'free':
      return 'free';
    case 'lifetime':
      return 'lifetime unlock';
    case 'subscribed':
      return `${status.plan ?? 'a'} plan${status.renewing ? '' : ', cancelled'}`;
    case 'suspended':
      return 'on hold';
  }
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
  body: { paddingHorizontal: space.lg, paddingTop: space.md, gap: space.lg },
  block: { gap: space.sm },
  choices: { gap: space.xs, marginTop: space.xs },
  choice: {
    minHeight: MIN_TOUCH + 8,
    justifyContent: 'center',
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderWidth: 1.5,
    borderRadius: radius.control,
  },
});
