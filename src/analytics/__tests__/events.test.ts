import { MAX_EVENTS, trimLog } from '../events';

const lines = (count: number) =>
  Array.from({ length: count }, (_, index) => JSON.stringify({ name: 'export_done', index })).join('\n') + '\n';

describe('the local event log', () => {
  it('leaves a log alone until it is well past the cap', () => {
    const text = lines(MAX_EVENTS + 100);
    expect(trimLog(text)).toBe(text);
  });

  it('keeps the newest events once it is trimmed', () => {
    const trimmed = trimLog(lines(MAX_EVENTS + 600)).trim().split('\n');
    expect(trimmed).toHaveLength(MAX_EVENTS);
    expect(JSON.parse(trimmed[trimmed.length - 1]).index).toBe(MAX_EVENTS + 599);
  });
});
