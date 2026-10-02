import { NativeModule, requireOptionalNativeModule } from 'expo';

import type { BurnProgress, BurnResult, SavedFile, VideoInfo } from './BurnIn.types';

type BurnInEvents = {
  progress(event: BurnProgress): void;
};

declare class BurnInModule extends NativeModule<BurnInEvents> {
  /** What the source video actually is, before anything is rendered. */
  probe(sourceUri: string): Promise<VideoInfo>;
  /**
   * Burns the captions in `planPath` into `sourceUri` and writes `outputPath`.
   *
   * The plan is a `BurnPlan` as JSON: positions, sizes and colours already
   * decided by `layoutCaptionFrame` at the export's own pixel size. Nothing
   * about how a caption looks is decided on the native side.
   */
  render(sourceUri: string, planPath: string, outputPath: string): Promise<BurnResult>;
  /** Stops a render at the next frame. The partial file is deleted. */
  cancel(): void;
  /**
   * Copies a finished file into the phone's Downloads. For the .srt.
   *
   * The video goes through `expo-media-library`; a subtitle file is not media
   * and no media library will take one.
   */
  saveToDownloads(path: string, displayName: string, mimeType: string): Promise<SavedFile>;
}

/**
 * Null on iOS: the burn-in is Kotlin and there is no Swift one. Optional so
 * that importing the export path does not throw there — `src/export/run.ts`
 * is what turns the null into something a screen can say.
 */
export default requireOptionalNativeModule<BurnInModule>('BurnIn');
