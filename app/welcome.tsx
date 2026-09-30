/**
 * Welcome. First launch, once, and never again.
 *
 * No carousel. One line of what the app is for — one clip or a queue of them —
 * and a way in. It used to lead with what the app does not do with your video;
 * that is still true and is said once, in Settings, rather than as the pitch.
 *
 * Restore is here rather than only in Settings because a reinstall lands on this
 * screen, and a paying user should not have to hunt through a settings list to
 * prove they already pay.
 */
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { syncEntitlement } from '../src/policy/entitlement-store';
import { isPro, proStatus } from '../src/policy/pro';
import { markWelcomeSeen } from '../src/project/settings';
import { Label, PrimaryButton, QuietButton, Screen } from '../src/ui/atoms';
import { welcome } from '../src/ui/copy';
import { DEFAULT_ACCENT, space } from '../src/ui/theme';

export default function Welcome() {
  const insets = useSafeAreaInsets();
  const [restoring, setRestoring] = useState(false);
  const [message, setMessage] = useState('');

  const start = useCallback(() => {
    markWelcomeSeen();
    router.replace('/');
  }, []);

  const restore = useCallback(async () => {
    setRestoring(true);
    setMessage('');

    // Seen or not, this person has now been through Welcome. Restoring is a
    // stronger signal than "Get started": they have used this app before.
    const synced = await syncEntitlement();
    setRestoring(false);

    if (synced && isPro(proStatus(synced))) {
      markWelcomeSeen();
      router.replace({ pathname: '/unlock', params: { from: 'welcome' } });
      return;
    }
    setMessage(welcome.nothingFound);
  }, []);

  return (
    <Screen>
      <View style={[styles.body, { paddingTop: insets.top + space.huge, paddingBottom: insets.bottom + space.xl }]}>
        <Label variant="serif" style={styles.headline}>
          {welcome.headline}
        </Label>

        <Label variant="body" tone="mute" style={styles.blurb}>
          {welcome.blurb}
        </Label>

        <View style={styles.actions}>
          <PrimaryButton title={welcome.start} accent={DEFAULT_ACCENT} onPress={start} busy={restoring} />
          <QuietButton title={welcome.restore} onPress={restore} />
          {message ? (
            <Label variant="micro" tone="mute" style={styles.message}>
              {message}
            </Label>
          ) : null}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: space.lg, justifyContent: 'flex-end', gap: space.lg },
  headline: { color: DEFAULT_ACCENT, maxWidth: 340 },
  blurb: { maxWidth: 320 },
  actions: { marginTop: space.huge, gap: space.xs },
  message: { textAlign: 'center' },
});
