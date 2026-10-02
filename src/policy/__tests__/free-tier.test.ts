import {
  FREE_CAPTIONS,
  FREE_TIER,
  freeTierStatus,
  recordCaption,
  recordExport,
  recordUnlock,
  type Entitlement,
  type FreeTierPolicy,
} from '../free-tier';

const fresh = (partial: Partial<Entitlement> = {}): Entitlement => ({
  unlocked: false,
  exportsUsed: 0,
  firstRunAt: '2026-09-01T00:00:00.000Z',
  ...partial,
});

const exports: FreeTierPolicy = { kind: 'exports', freeExports: 2 };
const watermark: FreeTierPolicy = { kind: 'watermark' };
const trial: FreeTierPolicy = { kind: 'trial', trialDays: 7 };
const now = new Date('2026-09-05T00:00:00.000Z');

describe('invariant 5: the limit is stated before the work starts', () => {
  it('says how many free exports are left', () => {
    expect(freeTierStatus(fresh(), now, exports, null).line).toBe('2 free exports left');
    expect(freeTierStatus(fresh({ exportsUsed: 1 }), now, exports, null).line).toBe('1 free export left');
  });

  it('blocks only once they are gone, and says so on Home', () => {
    const spent = freeTierStatus(fresh({ exportsUsed: 2 }), now, exports, null);
    expect(spent).toMatchObject({ line: 'Free exports used', blocked: true });
  });

  it('says nothing to someone who has already paid', () => {
    expect(freeTierStatus(fresh({ unlocked: true }), now, exports, null)).toEqual({
      line: '',
      blocked: false,
      captionBlocked: false,
      watermark: false,
    });
  });
});

describe('the other two policies are the same switch', () => {
  it('watermarks instead of blocking', () => {
    expect(freeTierStatus(fresh(), now, watermark, null)).toMatchObject({
      blocked: false,
      watermark: true,
    });
  });

  it('counts a trial down in days', () => {
    expect(freeTierStatus(fresh(), now, trial, null).line).toBe('3 days left in your trial');
  });

  it('names the last day rather than saying one day', () => {
    expect(freeTierStatus(fresh({ firstRunAt: '2026-08-30T00:00:00.000Z' }), now, trial, null).line).toBe(
      'Last day of your trial'
    );
  });

  it('ends the trial rather than going negative', () => {
    const over = freeTierStatus(fresh({ firstRunAt: '2026-08-01T00:00:00.000Z' }), now, trial, null);
    expect(over).toMatchObject({ line: 'Your trial has ended', blocked: true });
  });

  it('gives a full trial to an entitlement with no first run recorded', () => {
    expect(freeTierStatus(fresh({ firstRunAt: '' }), now, trial, null).line).toBe('7 days left in your trial');
  });
});

describe('the limit on videos', () => {
  it('counts down on Home, and still says exports carry the mark', () => {
    expect(freeTierStatus(fresh(), now, watermark, 2).line).toBe('2 free videos left · watermarked exports');
    expect(freeTierStatus(fresh({ captionsUsed: 1 }), now, watermark, 2).line).toBe(
      '1 free video left · watermarked exports'
    );
  });

  it('blocks the next video once they are gone, and never the export', () => {
    expect(freeTierStatus(fresh({ captionsUsed: 2 }), now, watermark, 2)).toEqual({
      line: 'Free videos used',
      blocked: false,
      captionBlocked: true,
      watermark: true,
    });
  });

  it('reads an entitlement written before the limit existed as none used', () => {
    const old = { unlocked: false, exportsUsed: 4, firstRunAt: '2026-09-01T00:00:00.000Z' };
    expect(freeTierStatus(old, now, watermark, 2)).toMatchObject({ captionBlocked: false });
  });

  it('lets a paying user caption without counting', () => {
    expect(freeTierStatus(fresh({ unlocked: true, captionsUsed: 9 }), now, watermark, 2).captionBlocked).toBe(false);
  });

  it('still applies while a subscription is on hold', () => {
    const held = fresh({
      captionsUsed: 2,
      subscription: { plan: 'yearly', renewing: true, suspended: true, verifiedAt: now.toISOString() },
    });
    expect(freeTierStatus(held, now, watermark, 2)).toMatchObject({ onHold: true, captionBlocked: true });
  });

  it('lets an export wall speak first under a policy that has one', () => {
    expect(freeTierStatus(fresh({ exportsUsed: 2 }), now, exports, 2).line).toBe('Free exports used');
  });
});

describe('recordCaption', () => {
  it('counts a video against the free tier', () => {
    expect(recordCaption(fresh()).captionsUsed).toBe(1);
    expect(recordCaption(fresh({ captionsUsed: 1 })).captionsUsed).toBe(2);
  });

  it('never counts one against a paid user', () => {
    const paid = fresh({ unlocked: true });
    expect(recordCaption(paid)).toBe(paid);
  });
});

describe('recordExport', () => {
  it('counts an export against the free tier', () => {
    expect(recordExport(fresh()).exportsUsed).toBe(1);
  });

  it('never counts one against a paid user', () => {
    const paid = fresh({ unlocked: true });
    expect(recordExport(paid)).toBe(paid);
  });
});

describe('recordUnlock', () => {
  const at = new Date('2026-09-13T10:00:00.000Z');

  it('unlocks and dates it', () => {
    expect(recordUnlock(fresh(), at)).toMatchObject({
      unlocked: true,
      unlockedAt: '2026-09-13T10:00:00.000Z',
    });
  });

  it('leaves the free exports where they were', () => {
    // A refund must not hand somebody a fresh three. Nothing on the Unlock
    // screen promises this any more — under the mark there is no count to
    // keep — but the counter policy is still in the type and this is its rule.
    expect(recordUnlock(fresh({ exportsUsed: 2 }), at).exportsUsed).toBe(2);
  });

  it('keeps the first unlock date rather than moving it', () => {
    const already = fresh({ unlocked: true, unlockedAt: '2026-01-01T00:00:00.000Z' });
    expect(recordUnlock(already, at)).toBe(already);
  });
});

describe('the policy that actually ships', () => {
  // Pinned. Every screen reads this one object, so a stray edit here changes what
  // four screens say without touching any of them.
  it('is unlimited exports carrying a mark', () => {
    expect(FREE_TIER).toEqual({ kind: 'watermark' });
  });

  it('allows three videos', () => {
    expect(FREE_CAPTIONS).toBe(3);
  });

  it('says so before any work starts, and never blocks an export', () => {
    expect(freeTierStatus(fresh())).toEqual({
      line: '3 free videos left · watermarked exports',
      blocked: false,
      captionBlocked: false,
      watermark: true,
    });
  });

  it('stops marking the moment the unlock lands', () => {
    expect(freeTierStatus(fresh({ unlocked: true })).watermark).toBe(false);
  });

  // Exporting five times on the free tier must not start a wall building behind
  // the user's back: `exportsUsed` still counts, and nothing reads it for gating.
  it('does not ration exports', () => {
    expect(freeTierStatus(fresh({ exportsUsed: 99 }))).toMatchObject({
      blocked: false,
      watermark: true,
    });
  });
});
