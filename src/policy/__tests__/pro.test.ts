import { freeTierStatus, recordExport, type Entitlement } from '../free-tier';
import {
  applyStoreAnswer,
  isPro,
  OFFLINE_GRACE_DAYS,
  proStatus,
  recordSubscribed,
  type StoreAnswer,
} from '../pro';

const now = new Date('2026-10-01T12:00:00.000Z');
const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 3600_000).toISOString();

const fresh = (partial: Partial<Entitlement> = {}): Entitlement => ({
  unlocked: false,
  exportsUsed: 0,
  firstRunAt: '2026-09-01T00:00:00.000Z',
  ...partial,
});

const live = (partial: Partial<NonNullable<Entitlement['subscription']>> = {}) =>
  fresh({
    subscription: { plan: 'yearly', renewing: true, suspended: false, verifiedAt: hoursAgo(1), ...partial },
  });

const answer = (partial: Partial<StoreAnswer> = {}): StoreAnswer => ({
  lifetime: false,
  subscription: null,
  ...partial,
});

describe('who is Pro', () => {
  it('nobody, by default', () => {
    expect(proStatus(fresh(), now)).toEqual({ kind: 'free' });
    expect(isPro(proStatus(fresh(), now))).toBe(false);
  });

  it('a legacy lifetime buyer, forever and whatever the subscription says', () => {
    expect(proStatus(fresh({ unlocked: true }), now)).toEqual({ kind: 'lifetime' });
    const lapsed = fresh({
      unlocked: true,
      subscription: { plan: 'weekly', renewing: false, suspended: true, verifiedAt: hoursAgo(9999) },
    });
    expect(isPro(proStatus(lapsed, now))).toBe(true);
  });

  it('an active subscriber', () => {
    expect(proStatus(live(), now)).toEqual({
      kind: 'subscribed',
      plan: 'yearly',
      renewing: true,
      unverified: false,
    });
  });

  it('a subscriber in the grace period, which Play reports as an ordinary live purchase', () => {
    expect(isPro(proStatus(live({ renewing: true }), now))).toBe(true);
  });

  it('a subscriber who cancelled but has paid up to the end of the period', () => {
    const status = proStatus(live({ renewing: false }), now);
    expect(status).toMatchObject({ kind: 'subscribed', renewing: false });
    expect(isPro(status)).toBe(true);
  });

  it('not a subscriber on account hold or paused', () => {
    const status = proStatus(live({ suspended: true }), now);
    expect(status).toEqual({ kind: 'suspended', plan: 'yearly' });
    expect(isPro(status)).toBe(false);
  });
});

describe('when Play cannot be reached', () => {
  it('keeps the last answer, and says it is unverified after a day', () => {
    expect(proStatus(live({ verifiedAt: hoursAgo(23) }), now)).toMatchObject({ unverified: false });
    expect(proStatus(live({ verifiedAt: hoursAgo(25) }), now)).toMatchObject({
      kind: 'subscribed',
      unverified: true,
    });
  });

  it(`stops believing it after ${OFFLINE_GRACE_DAYS} days`, () => {
    const edge = OFFLINE_GRACE_DAYS * 24;
    expect(isPro(proStatus(live({ verifiedAt: hoursAgo(edge - 1) }), now))).toBe(true);
    expect(isPro(proStatus(live({ verifiedAt: hoursAgo(edge + 1) }), now))).toBe(false);
  });

  it('does not believe a date it cannot read', () => {
    expect(isPro(proStatus(live({ verifiedAt: 'yesterday' }), now))).toBe(false);
  });
});

describe('folding a store answer in', () => {
  it('records a subscription with the time Play confirmed it', () => {
    const next = applyStoreAnswer(
      fresh(),
      answer({ subscription: { plan: 'monthly', renewing: true, suspended: false } }),
      now
    );
    expect(next.subscription).toEqual({
      plan: 'monthly',
      renewing: true,
      suspended: false,
      verifiedAt: now.toISOString(),
    });
  });

  it('ends a subscription Play no longer returns', () => {
    const next = applyStoreAnswer(live(), answer(), now);
    expect(next.subscription).toBeNull();
    expect(isPro(proStatus(next, now))).toBe(false);
  });

  it('records a legacy purchase found on restore, with the date it was first seen', () => {
    const next = applyStoreAnswer(fresh(), answer({ lifetime: true }), now);
    expect(next).toMatchObject({ unlocked: true, unlockedAt: now.toISOString() });
  });

  it('never takes a legacy purchase away, even when Play says nothing', () => {
    const owner = fresh({ unlocked: true, unlockedAt: '2026-01-01T00:00:00.000Z' });
    const next = applyStoreAnswer(owner, answer(), now);
    expect(next).toMatchObject({ unlocked: true, unlockedAt: '2026-01-01T00:00:00.000Z' });
  });

  it('keeps what the free tier has already counted', () => {
    const next = applyStoreAnswer(fresh({ exportsUsed: 7 }), answer({ lifetime: true }), now);
    expect(next.exportsUsed).toBe(7);
  });

  it('takes a purchase that just completed at its word until the next query', () => {
    expect(isPro(proStatus(recordSubscribed(fresh(), 'weekly', now), now))).toBe(true);
  });
});

describe('the free tier, read through Pro', () => {
  it('drops the watermark for a subscriber and for a lifetime owner', () => {
    expect(freeTierStatus(live(), now)).toEqual({ line: '', blocked: false, captionBlocked: false, watermark: false });
    expect(freeTierStatus(fresh({ unlocked: true }), now).watermark).toBe(false);
  });

  it('keeps it for somebody on hold, and says how to fix it rather than selling to them', () => {
    const status = freeTierStatus(live({ suspended: true }), now);
    expect(status).toMatchObject({ watermark: true, blocked: false, onHold: true });
    expect(status.line).toMatch(/Google Play/);
  });

  it('puts it back when a subscription has ended', () => {
    expect(freeTierStatus(live({ verifiedAt: hoursAgo(24 * 30) }), now).watermark).toBe(true);
  });

  it('never counts a subscriber’s exports', () => {
    expect(recordExport(live(), now).exportsUsed).toBe(0);
    expect(recordExport(fresh(), now).exportsUsed).toBe(1);
  });
});
