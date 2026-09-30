/**
 * Turning one of auto clip's suggestions into a project of its own.
 *
 * The cut is rendered first, with nothing drawn on it, into the new project's
 * directory as its source video. From then on it is an ordinary project: its
 * words are the long video's words moved onto the cut's timeline, its envelope
 * is the long video's envelope cut the same way, and the editor, the preview and
 * the export handle it exactly as they handle a clip from the gallery. Nothing
 * anywhere has to know that a project can point into the middle of another one.
 */
import { File } from 'expo-file-system';

import BurnIn from '../../modules/burn-in';
import {
  projectLanguage,
  wordsForCut,
  type Project,
  type SourceRange,
} from '../domain';
import { buildCutPlan, exportSize } from '../render/burn';
import {
  createProject,
  envelopeFile,
  loadEnvelope,
  projectDirectory,
  saveEnvelope,
  saveProject,
} from '../project/store';

/** The longest side of a cut, before captions. The same cap the batch export uses. */
const CUT_CAP = 1080;

/** Envelope frames are 10 ms. */
const FRAME_MS = 10;

export async function cutIntoProject(
  source: Project,
  segments: SourceRange[],
  removedWordIds: readonly string[],
  styleId: string,
  styleOverrides: Project['styleOverrides'],
  onProgress: (fraction: number) => void
): Promise<Project> {
  const info = await BurnIn.probe(source.sourceUri);
  const size = exportSize(info.width, info.height, CUT_CAP);
  const fps = Math.max(1, Math.round(info.fps || 30));
  const keptMs = segments.reduce((sum, segment) => sum + segment.endMs - segment.startMs, 0);

  const created = createProject('', keptMs, projectLanguage(source));
  const directory = projectDirectory(created.id);
  const plan = new File(directory, 'cut-plan.json');
  const output = new File(directory, 'source.mp4');
  plan.write(JSON.stringify(buildCutPlan(size, fps, segments)));

  const subscription = BurnIn.addListener('progress', (event) => onProgress(event.done));
  try {
    await BurnIn.render(
      source.sourceUri,
      plan.uri.replace('file://', ''),
      output.uri.replace('file://', '')
    );
  } finally {
    subscription.remove();
    if (plan.exists) plan.delete();
  }

  const words = wordsForCut(source.words, segments, removedWordIds);
  const kept = new Set(words.map((word) => word.id));
  const envelope = cutEnvelope(loadEnvelope(source.id), segments);
  if (envelope) saveEnvelope(created.id, envelope);

  const project: Project = {
    ...created,
    sourceUri: output.uri,
    status: 'ready',
    progress: { processedMs: keptMs, totalMs: keptMs },
    words,
    // A flag keyed to a word that was cut would point at nothing.
    lineFlags: source.lineFlags.filter((flag) => kept.has(flag.lineStartWordId)),
    autoEmphasis: source.autoEmphasis.filter((id) => kept.has(id)),
    styleId,
    styleOverrides,
    ...(envelope ? { energyEnvelopeUri: envelopeFile(created.id).uri } : {}),
  };
  saveProject(project);
  return project;
}

/** The source's loudness, cut the same way the video was. */
function cutEnvelope(envelope: Float32Array | null, segments: SourceRange[]): Float32Array | null {
  if (!envelope) return null;
  const parts = segments.map((segment) =>
    envelope.subarray(
      Math.min(envelope.length, Math.floor(segment.startMs / FRAME_MS)),
      Math.min(envelope.length, Math.ceil(segment.endMs / FRAME_MS))
    )
  );
  const out = new Float32Array(parts.reduce((sum, part) => sum + part.length, 0));
  let at = 0;
  for (const part of parts) {
    out.set(part, at);
    at += part.length;
  }
  return out;
}
