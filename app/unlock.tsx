/**
 * Wordburn Pro.
 *
 * The only screen in the app that asks for money, reachable from Home, Export,
 * Saved, Settings, Welcome, the dictionary's cap and every Pro feature's door.
 * It arrives before a render rather than after one (invariant 5).
 *
 * Three plans, yearly chosen for you, one button. The prices are never composed
 * here: every amount on this screen is Play's own string for this account, and
 * the one number worked out locally — yearly's per-month equivalent — is Play's
 * micros divided by twelve and formatted by `Intl` in Play's currency. The trial
 * is whatever offer Play hands this account, so its length is set in Play
 * Console and a person who has already had one is simply not offered another.
 *
 * Nothing on this screen decides anything about entitlement. `store.ts` asks the
 * store, `entitlement-store.ts` writes down the answer, and this draws it.
 */
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { track } from '../src/analytics/events';
import { loadProStatus, markSubscribed, syncEntitlement } from '../src/policy/entitlement-store';
import {
  formatLike,
  formatMicros,
  fractionDigitsOf,
  monthlyMicros,
  perPeriod,
  yearlySaving,
  type Plan,
} from '../src/policy/plans';
import { isPro, proStatus, type PlanId, type ProStatus } from '../src/policy/pro';
import {
  loadPlans,
  openSubscriptionSettings,
  storeHasNothing,
  storeUnreachable,
  subscribe,
} from '../src/policy/store';
import { Label, PrimaryButton, QuietButton, Screen } from '../src/ui/atoms';
import { LINKS, pro } from '../src/ui/copy';
import { color, DEFAULT_ACCENT, MIN_TOUCH, radius, space } from '../src/ui/theme';

type Phase =
  | { kind: 'pricing' }
  | { kind: 'ready' }
  | { kind: 'buying' }
  | { kind: 'pending' }
  | { kind: 'failed'; message: string };

export default function Unlock() {
  const { from, id } = useLocalSearchParams<{ from?: string; id?: string }>();
  const insets = useSafeAreaInsets();

  const [status, setStatus] = useState<ProStatus>(() => loadProStatus());
  const [plans, setPlans] = useState<Plan[]>([]);
  const [chosen, setChosen] = useState<PlanId>('yearly');
  const [phase, setPhase] = useState<Phase>({ kind: 'pricing' });

  const load = useCallback(async () => {
    setPhase({ kind: 'pricing' });

    // Both at once: somebody who subscribed on another phone should see that
    // they are Pro rather than a price they are already paying.
    const [synced, found] = await Promise.all([syncEntitlement(), loadPlans()]);
    if (synced) setStatus(proStatus(synced));

    if (found.kind === 'priced') {
      setPlans(found.plans);
      setChosen((current) =>
        found.plans.some((plan) => plan.id === current) ? current : found.plans[found.plans.length - 1].id
      );
      setPhase({ kind: 'ready' });
      return;
    }

    // A debug build talks to a Play that has never heard of it. The sample
    // plans let the screen be looked at; a release build never sees them.
    if (__DEV__) {
      setPlans(SAMPLE_PLANS);
      setPhase({ kind: 'ready' });
      return;
    }

    setPhase({ kind: 'failed', message: found.kind === 'offline' ? storeUnreachable() : storeHasNothing() });
  }, []);

  useEffect(() => {
    track({ name: 'paywall_shown', from: from ?? 'unknown' });
    void load();
  }, [load, from]);

  const plan = plans.find((candidate) => candidate.id === chosen) ?? null;

  const choose = useCallback((next: PlanId) => {
    setChosen(next);
    track({ name: 'plan_selected', plan: next });
  }, []);

  const buy = useCallback(async () => {
    if (!plan) return;
    setPhase({ kind: 'buying' });
    const outcome = await subscribe(plan);

    switch (outcome.kind) {
      case 'subscribed':
        setStatus(proStatus(markSubscribed(outcome.plan)));
        track({ name: plan.trialDays ? 'trial_started' : 'subscribed', plan: outcome.plan });
        return;
      case 'pending':
        setPhase({ kind: 'pending' });
        return;
      case 'cancelled':
        // Backing out of the sheet is an answer, not an error. Nothing is said.
        setPhase({ kind: 'ready' });
        return;
      case 'failed':
        setPhase({ kind: 'failed', message: outcome.message });
    }
  }, [plan]);

  const restore = useCallback(async () => {
    setPhase({ kind: 'pricing' });
    const synced = await syncEntitlement();
    if (!synced) {
      setPhase({ kind: 'failed', message: storeUnreachable() });
      return;
    }
    const next = proStatus(synced);
    setStatus(next);
    setPhase(isPro(next) || next.kind === 'suspended' ? { kind: 'ready' } : { kind: 'failed', message: pro.nothingToRestore });
  }, []);

  /** Back where they came from, or Home if they arrived from somewhere with no way back. */
  const leave = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/');
  }, []);

  if (isPro(status)) return <Active status={status} from={from} id={id} onLeave={leave} />;
  if (status.kind === 'suspended') return <OnHold onLeave={leave} />;

  const busy = phase.kind === 'pricing' || phase.kind === 'buying';
  const saving = yearlySaving(plans);

  return (
    <Screen>
      <View style={[styles.bar, { paddingTop: insets.top + space.sm }]}>
        <QuietButton title="✕" onPress={leave} />
        <QuietButton title={pro.restore} onPress={restore} />
      </View>

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + space.xl }]}>
        <View style={styles.head}>
          <Label variant="micro" style={styles.kicker}>
            {pro.name.toUpperCase()}
          </Label>
          <Label variant="title">{pro.headline}</Label>
          <Label variant="body" tone="mute">
            {pro.lede}
          </Label>
        </View>

        <View style={styles.benefits}>
          {pro.benefits.map((benefit) => (
            <View key={benefit} style={styles.benefit}>
              <Label variant="label" style={{ color: DEFAULT_ACCENT }}>
                ✓
              </Label>
              <Label variant="label" style={styles.benefitText}>
                {benefit}
              </Label>
            </View>
          ))}
        </View>

        <View style={styles.plans} accessibilityRole="radiogroup">
          {plans.length === 0 && phase.kind === 'pricing' ? <View style={styles.placeholder} /> : null}
          {[...plans].reverse().map((candidate) => (
            <PlanCard
              key={candidate.id}
              plan={candidate}
              selected={candidate.id === chosen}
              saving={candidate.id === 'yearly' ? saving : null}
              onPress={() => choose(candidate.id)}
            />
          ))}
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            title={plan ? pro.cta(plan.trialDays) : pro.retry}
            accent={DEFAULT_ACCENT}
            busy={busy}
            onPress={plan ? buy : load}
          />

          {plan ? (
            <Label variant="micro" tone="mute" style={styles.centre}>
              {pro.fineprint(plan.price, perPeriod(plan), plan.trialDays)}
            </Label>
          ) : null}

          {phase.kind === 'pending' ? (
            <Label variant="label" tone="mute" style={styles.centre}>
              {pro.pending}
            </Label>
          ) : null}

          {phase.kind === 'failed' ? (
            <Label variant="label" tone="signal" style={styles.centre}>
              {phase.message}
            </Label>
          ) : null}

          <View style={styles.links}>
            <QuietButton title={pro.terms} onPress={() => void Linking.openURL(LINKS.terms)} />
            <Label variant="micro" tone="mute">
              ·
            </Label>
            <QuietButton title={pro.privacy} onPress={() => void Linking.openURL(LINKS.privacy)} />
          </View>

          {/* Under the button, never on it. The button names the trade; this
              names who is on the other end of it. See CLAUDE.md. */}
          <Label variant="micro" tone="mute" style={styles.centre}>
            {pro.goodwill}
          </Label>
        </View>
      </ScrollView>
    </Screen>
  );
}

/**
 * One plan. The yearly card carries the badge and the per-month figure, because
 * a year's price on its own is the biggest number on the screen and the least
 * comparable one.
 */
function PlanCard({
  plan,
  selected,
  saving,
  onPress,
}: {
  plan: Plan;
  selected: boolean;
  saving: number | null;
  onPress: () => void;
}) {
  const monthly =
    plan.id === 'yearly'
      ? (formatLike(plan.price, monthlyMicros(plan)) ??
        formatMicros(monthlyMicros(plan), plan.currency, undefined, fractionDigitsOf(plan.price)))
      : null;

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          borderColor: selected ? DEFAULT_ACCENT : color.line,
          backgroundColor: selected ? color.surface : 'transparent',
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={[styles.radio, { borderColor: selected ? DEFAULT_ACCENT : color.mute }]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>

      <View style={styles.cardText}>
        <View style={styles.cardTitle}>
          <Label variant="heading">{pro.plan[plan.id]}</Label>
          {plan.id === 'yearly' ? (
            <View style={styles.badge}>
              <Label variant="micro" style={styles.badgeText}>
                {saving ? `${pro.bestValue} · ${pro.save(saving)}` : pro.bestValue}
              </Label>
            </View>
          ) : null}
        </View>
        {plan.trialDays || monthly ? (
          <Label variant="micro" tone="mute">
            {[plan.trialDays ? pro.trialBadge(plan.trialDays) : null, monthly ? pro.perMonth(monthly) : null]
              .filter(Boolean)
              .join(' · ')}
          </Label>
        ) : null}
      </View>

      <View style={styles.cardPrice}>
        <Label variant="heading">{plan.price}</Label>
        <Label variant="micro" tone="mute">
          {perPeriod(plan)}
        </Label>
      </View>
    </Pressable>
  );
}

/**
 * What a Pro account sees, whether it just paid, was restored, or bought the old
 * lifetime unlock.
 *
 * "Back to export" only when there is an export to go back to. Everywhere else
 * it says Home, because a button that returns somebody to Settings is a button
 * nobody wants after buying something.
 */
function Active({
  status,
  from,
  id,
  onLeave,
}: {
  status: ProStatus;
  from?: string;
  id?: string;
  onLeave: () => void;
}) {
  const insets = useSafeAreaInsets();
  const toExport = from === 'export' && !!id;

  const detail =
    status.kind === 'lifetime'
      ? pro.active.lifetime
      : status.kind === 'subscribed'
        ? (status.renewing ? pro.active.renewing : pro.active.ending)(status.plan ? pro.plan[status.plan] : 'Your')
        : '';

  return (
    <Screen>
      <View style={[styles.done, { paddingTop: insets.top + space.huge }]}>
        <View style={styles.check}>
          <Label variant="display" style={styles.tick}>
            ✓
          </Label>
        </View>

        <Label variant="title">{pro.active.title}</Label>
        <Label variant="body" tone="mute" style={styles.centre}>
          {detail}
        </Label>
        {status.kind === 'subscribed' && status.unverified ? (
          <Label variant="micro" tone="mute" style={styles.centre}>
            {pro.active.unverified}
          </Label>
        ) : null}

        <View style={styles.doneActions}>
          {toExport ? (
            <PrimaryButton
              title={pro.active.backToExport}
              accent={DEFAULT_ACCENT}
              onPress={() => router.replace({ pathname: '/export/[id]', params: { id: String(id) } })}
            />
          ) : (
            <PrimaryButton title={pro.active.home} accent={DEFAULT_ACCENT} onPress={() => router.replace('/')} />
          )}
          {status.kind === 'subscribed' ? (
            <QuietButton title={pro.active.manage} onPress={() => void openSubscriptionSettings()} />
          ) : null}
          {toExport ? <QuietButton title={pro.active.home} onPress={() => router.replace('/')} /> : null}
          {!toExport && from === 'settings' ? <QuietButton title={pro.active.back} onPress={onLeave} /> : null}
        </View>
      </View>
    </Screen>
  );
}

/**
 * Account hold or paused. This person is paying and is not sold to: they are
 * told what happened and sent to the one place that can fix it.
 */
function OnHold({ onLeave }: { onLeave: () => void }) {
  const insets = useSafeAreaInsets();

  return (
    <Screen>
      <View style={[styles.done, { paddingTop: insets.top + space.huge }]}>
        <Label variant="title">{pro.hold.title}</Label>
        <Label variant="body" tone="mute" style={styles.centre}>
          {pro.hold.body}
        </Label>
        <View style={styles.doneActions}>
          <PrimaryButton
            title={pro.hold.fix}
            accent={DEFAULT_ACCENT}
            onPress={() => void openSubscriptionSettings()}
          />
          <QuietButton title={pro.active.back} onPress={onLeave} />
        </View>
      </View>
    </Screen>
  );
}

/**
 * What a debug build shows when Play has nothing to sell it, which is always:
 * the product exists only in a Play Console the debug key is not signed into.
 * The numbers are the placeholders the plan was written with.
 */
const SAMPLE_PLANS: Plan[] = [
  { id: 'weekly', offerToken: '', price: '$4.99', priceMicros: 4_990_000, currency: 'USD', period: 'week', trialDays: null },
  { id: 'monthly', offerToken: '', price: '$9.99', priceMicros: 9_990_000, currency: 'USD', period: 'month', trialDays: null },
  { id: 'yearly', offerToken: '', price: '$39.99', priceMicros: 39_990_000, currency: 'USD', period: 'year', trialDays: 3 },
];

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.sm,
    paddingBottom: space.sm,
  },
  body: { paddingHorizontal: space.lg, paddingTop: space.md, gap: space.xl },
  head: { gap: space.sm },
  kicker: { color: DEFAULT_ACCENT, letterSpacing: 1.2 },
  benefits: { gap: space.sm },
  benefit: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  benefitText: { flex: 1 },
  plans: { gap: space.sm },
  placeholder: { height: 3 * 72 + 2 * space.sm },
  card: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderWidth: 1.5,
    borderRadius: radius.sheet,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: radius.pill, backgroundColor: DEFAULT_ACCENT },
  cardText: { flex: 1, gap: 2 },
  cardTitle: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' },
  badge: {
    paddingHorizontal: space.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: DEFAULT_ACCENT,
  },
  badgeText: { color: color.ink, fontFamily: 'BeVietnamPro-SemiBold' },
  cardPrice: { alignItems: 'flex-end' },
  actions: { gap: space.md },
  links: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.xs },
  centre: { textAlign: 'center' },
  done: { flex: 1, alignItems: 'center', paddingHorizontal: space.lg, gap: space.md },
  check: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: color.good,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
  },
  tick: { color: color.good },
  doneActions: { alignSelf: 'stretch', gap: space.sm, marginTop: space.xl, minHeight: MIN_TOUCH },
});
