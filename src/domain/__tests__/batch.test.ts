import {
  captionedFileName,
  MAX_BATCH_CLIPS,
  nextJob,
  pickedClipName,
  retryJob,
  summarize,
  updateJob,
  type Batch,
  type BatchJob,
} from '../batch';

const job = (id: string, partial: Partial<BatchJob> = {}): BatchJob => ({
  id,
  source: { kind: 'file', uri: `file:///${id}.mp4`, durationMs: 30_000 },
  name: id,
  status: 'queued',
  progress: 0,
  ...partial,
});

const batch = (jobs: BatchJob[]): Batch => ({
  id: 'b1',
  createdAt: '2026-09-30T00:00:00.000Z',
  language: 'en',
  styleId: 'focus',
  styleOverrides: {},
  jobs,
});

describe('file names', () => {
  it('names the output after the original', () => {
    expect(captionedFileName('VID_20260930_1200.mp4', new Set())).toBe('VID_20260930_1200_captioned');
    expect(captionedFileName('Episode 12 – guest.MOV', new Set())).toBe('Episode 12 – guest_captioned');
  });

  it('never gives two clips in one batch the same name', () => {
    const taken = new Set(['clip_captioned', 'clip_captioned 2']);
    expect(captionedFileName('clip.mp4', taken)).toBe('clip_captioned 3');
  });

  it('replaces characters a gallery or share sheet chokes on', () => {
    expect(captionedFileName('a/b:c*?"<>|d.mp4', new Set())).toBe('a b c d_captioned');
  });

  it('falls back to "clip" when nothing is left of the name', () => {
    expect(captionedFileName('???.mp4', new Set())).toBe('clip_captioned');
    expect(captionedFileName('', new Set())).toBe('clip_captioned');
  });

  it('keeps names to a length every gallery accepts', () => {
    expect(captionedFileName(`${'x'.repeat(300)}.mp4`, new Set()).length).toBeLessThanOrEqual(90);
  });

  it('keeps a real file name, and replaces the photo picker’s media id with the day and position', () => {
    const at = new Date(2026, 8, 30, 12);
    expect(pickedClipName('Episode 12.mp4', 0, at)).toBe('Episode 12');
    expect(pickedClipName('39.mp4', 0, at)).toBe('2026-09-30 clip 01');
    expect(pickedClipName(undefined, 11, at)).toBe('2026-09-30 clip 12');
    // What the A54's picker handed over on 2026-10-01.
    expect(pickedClipName('bbe0eba4-7fe8-4dc4-8b4b-d2e1f3a4b5c6_1.mp4', 1, at)).toBe('2026-09-30 clip 02');
    expect(pickedClipName('3f9c2a1e-7b44-4c1d-9a55-0e2c1b7d8a90.mp4', 2, at)).toBe('2026-09-30 clip 03');
  });
});

describe('the queue', () => {
  it('resumes an interrupted job before starting a new one', () => {
    const b = batch([job('a', { status: 'done' }), job('b'), job('c', { status: 'rendering' })]);
    expect(nextJob(b)?.id).toBe('c');
  });

  it('works through queued jobs in order and stops when none are left', () => {
    expect(nextJob(batch([job('a', { status: 'done' }), job('b'), job('c')]))?.id).toBe('b');
    expect(nextJob(batch([job('a', { status: 'done' }), job('b', { status: 'failed' })]))).toBeNull();
  });

  it('puts a failed job back in the queue on retry, without its error', () => {
    const retried = retryJob(batch([job('a', { status: 'failed', error: 'boom', progress: 0.4 })]), 'a');
    expect(retried.jobs[0]).toMatchObject({ status: 'queued', progress: 0, error: undefined });
  });

  it('says where the whole batch stands, and never goes backwards between the halves', () => {
    const b = batch([job('a', { status: 'done' }), job('b', { status: 'rendering', progress: 0.5 }), job('c')]);
    const summary = summarize(b);
    expect(summary).toMatchObject({ total: 3, done: 1, failed: 0, remaining: 2, finished: false });
    expect(summary.fraction).toBeCloseTo((1 + 0.75) / 3);

    const endOfTranscribe = summarize(updateJob(b, 'b', { status: 'transcribing', progress: 1 })).fraction;
    const startOfRender = summarize(updateJob(b, 'b', { status: 'rendering', progress: 0 })).fraction;
    expect(startOfRender).toBeGreaterThanOrEqual(endOfTranscribe);
  });

  it('is finished when every job is done or failed', () => {
    expect(summarize(batch([job('a', { status: 'done' }), job('b', { status: 'failed' })])).finished).toBe(true);
  });

  it('takes twenty clips', () => {
    expect(MAX_BATCH_CLIPS).toBe(20);
  });
});
