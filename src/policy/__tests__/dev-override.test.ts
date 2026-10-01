import { withOverride, describeOverride, type ProOverride } from '../dev-override';
import { freeTierStatus, recordExport, type Entitlement } from '../free-tier';
import { isPro, proStatus } from '../pro';

const now = new Date('2026-10-01T12:00:00.000Z');
const stored: Entitlement = { unlocked: false, exportsUsed: 2, firstRunAt: '2026-09-01T00:00:00.000Z', subscription: null };
const status = (override: ProOverride) => proStatus(withOverride(stored, override, now), now);

describe('the developer override', () => {
  it('changes nothing when it is Google Play', () => {
    expect(withOverride(stored, { kind: 'play' }, now)).toBe(stored);
  });

  it('makes a free account Pro on every plan, through the real rules', () => {
    for (const plan of ['weekly', 'monthly', 'yearly'] as const) {
      expect(status({ kind: 'subscribed', plan })).toEqual({ kind: 'subscribed', plan, renewing: true, unverified: false });
    }
    expect(freeTierStatus(withOverride(stored, { kind: 'subscribed', plan: 'yearly' }, now), now).watermark).toBe(false);
  });

  it('can be every state a real subscription goes through', () => {
    expect(status({ kind: 'cancelled', plan: 'monthly' })).toMatchObject({ kind: 'subscribed', renewing: false });
    expect(status({ kind: 'on-hold', plan: 'yearly' })).toEqual({ kind: 'suspended', plan: 'yearly' });
    expect(isPro(status({ kind: 'on-hold', plan: 'yearly' }))).toBe(false);
    expect(status({ kind: 'lifetime' })).toEqual({ kind: 'lifetime' });
  });

  it('can make a paying account free again', () => {
    const paying: Entitlement = { ...stored, unlocked: true };
    expect(proStatus(withOverride(paying, { kind: 'free' }, now), now)).toEqual({ kind: 'free' });
  });

  it('never touches the record it was laid over', () => {
    const copy = JSON.parse(JSON.stringify(stored));
    withOverride(stored, { kind: 'subscribed', plan: 'weekly' }, now);
    expect(stored).toEqual(copy);
    // What export saves is counted on the stored record, not the pretend one.
    expect(recordExport(stored, now).subscription).toBeNull();
  });

  it('says what it is doing in a few words', () => {
    expect(describeOverride({ kind: 'subscribed', plan: 'yearly' })).toBe('Subscribed · yearly');
    expect(describeOverride({ kind: 'play' })).toBe('Google Play');
  });
});
