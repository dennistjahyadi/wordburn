import {
  formatMicros,
  fractionDigitsOf,
  isoDays,
  monthlyMicros,
  plansFromOffers,
  yearlySaving,
  type OfferInput,
  type PhaseInput,
} from '../plans';

const phase = (billingPeriod: string, micros: number, formatted: string, recurrenceMode = 1): PhaseInput => ({
  billingPeriod,
  priceAmountMicros: micros,
  formattedPrice: formatted,
  currencyCode: 'USD',
  recurrenceMode,
});

const base = (basePlanId: string, period: string, micros: number, formatted: string): OfferInput => ({
  basePlanId,
  offerId: null,
  offerToken: `${basePlanId}-base`,
  phases: [phase(period, micros, formatted)],
});

const PLAY: OfferInput[] = [
  base('weekly', 'P1W', 4_990_000, '$4.99'),
  base('monthly', 'P1M', 9_990_000, '$9.99'),
  base('yearly', 'P1Y', 39_990_000, '$39.99'),
  {
    basePlanId: 'yearly',
    offerId: 'yearly-trial',
    offerToken: 'yearly-trial-token',
    phases: [phase('P3D', 0, 'Free', 3), phase('P1Y', 39_990_000, '$39.99')],
  },
];

describe('plans from Play offers', () => {
  it('gives one plan per base plan, in weekly, monthly, yearly order', () => {
    const plans = plansFromOffers([...PLAY].reverse());
    expect(plans.map((plan) => plan.id)).toEqual(['weekly', 'monthly', 'yearly']);
    expect(plans.map((plan) => plan.period)).toEqual(['week', 'month', 'year']);
  });

  it('sells the trial offer when Play offers one, at the recurring price', () => {
    const yearly = plansFromOffers(PLAY).find((plan) => plan.id === 'yearly');
    expect(yearly).toMatchObject({
      offerToken: 'yearly-trial-token',
      price: '$39.99',
      priceMicros: 39_990_000,
      trialDays: 3,
    });
  });

  it('falls back to the base offer for somebody who has had their trial', () => {
    const yearly = plansFromOffers(PLAY.filter((offer) => offer.offerId !== 'yearly-trial')).find(
      (plan) => plan.id === 'yearly'
    );
    expect(yearly).toMatchObject({ offerToken: 'yearly-base', trialDays: null });
  });

  it('reads the trial length from Play rather than assuming three days', () => {
    const week = { ...PLAY[3], phases: [phase('P1W', 0, 'Free', 3), PLAY[3].phases[1]] };
    expect(plansFromOffers([week])[0].trialDays).toBe(7);
  });

  it('does not call a discounted first period a free trial', () => {
    const intro = { ...PLAY[3], phases: [phase('P1M', 990_000, '$0.99', 2), PLAY[3].phases[1]] };
    expect(plansFromOffers([intro])[0].trialDays).toBeNull();
  });

  it('drops a base plan it does not know rather than guessing its name', () => {
    expect(plansFromOffers([base('quarterly', 'P3M', 1, '$1')])).toEqual([]);
  });
});

describe('what the yearly card says', () => {
  const plans = plansFromOffers(PLAY);
  const yearly = plans.find((plan) => plan.id === 'yearly')!;

  it('works out a per-month figure from Play’s own micros', () => {
    expect(monthlyMicros(yearly)).toBeCloseTo(3_332_500);
    expect(formatMicros(monthlyMicros(yearly), 'USD', 'en-US')).toBe('$3.33');
  });

  it('works out how much yearly saves over twelve months', () => {
    expect(yearlySaving(plans)).toBe(66);
  });

  it('says nothing about saving when the currencies differ', () => {
    const odd = plans.map((plan) => (plan.id === 'monthly' ? { ...plan, currency: 'EUR' } : plan));
    expect(yearlySaving(odd)).toBeNull();
  });

  it('writes the per-month figure with as many decimals as Play wrote the price', () => {
    expect(fractionDigitsOf('$39.99')).toBe(2);
    expect(fractionDigitsOf('39,99 €')).toBe(2);
    expect(fractionDigitsOf('Rp 649.000')).toBe(0);
    expect(fractionDigitsOf('¥4,000')).toBe(0);
    expect(formatMicros(649_000_000_000 / 12, 'IDR', 'id-ID', fractionDigitsOf('Rp 649.000'))).toMatch(
      /^Rp\s54\.083$/
    );
  });

  it('gives no figure rather than a wrong one for a currency it cannot format', () => {
    expect(formatMicros(1_000_000, 'NOT A CURRENCY')).toBeNull();
  });
});

describe('ISO periods', () => {
  it('reads the periods Play uses', () => {
    expect(isoDays('P3D')).toBe(3);
    expect(isoDays('P1W')).toBe(7);
    expect(isoDays('P1M')).toBe(30);
    expect(isoDays('P1Y')).toBe(365);
    expect(isoDays('3 days')).toBeNull();
  });
});
