import AVFoundation
import CoreImage
import ExpoModulesCore
import Foundation

internal final class NoVideoTrackException: Exception {
  override var reason: String { "That file has no video in it" }
}

internal final class CancelledException: Exception {
  override var reason: String { "The export was cancelled" }
}

internal final class EncoderException: GenericException<String> {
  override var reason: String { "Couldn't render this video on this phone. Try 720p. (\(param))" }
}

/// A flag the render polls once per frame. `cancel` flips it from the JS thread.
internal final class Cancellation {
  private let lock = NSLock()
  private var flag = false

  func set() {
    lock.lock()
    flag = true
    lock.unlock()
  }

  func reset() {
    lock.lock()
    flag = false
    lock.unlock()
  }

  var isSet: Bool {
    lock.lock()
    defer { lock.unlock() }
    return flag
  }
}

/// The burn-in: source video in, captioned video out.
///
/// `AVAssetReader` decodes, Core Image composites each frame with the caption
/// overlay on the GPU, and `AVAssetWriter` encodes, with the audio track copied
/// across untouched. No pixel is read back to the CPU: the overlay is painted
/// once per caption entry and reused for every frame it holds.
///
/// Every frame keeps the presentation time it arrived with, so a clip's own
/// frame rate — including a variable one — is what comes out the other end.
/// Rotation is baked into the pixels rather than left to a transform in the
/// file, because the captions are drawn upright and a player that ignored the
/// transform would show them the right way up over a sideways video.
internal final class VideoBurner {
  private let source: URL
  private let plan: BurnPlan
  private let output: URL
  private let cancelled: Cancellation
  private let onProgress: (Double) -> Void

  init(
    source: URL,
    plan: BurnPlan,
    output: URL,
    cancelled: Cancellation,
    onProgress: @escaping (Double) -> Void
  ) {
    self.source = source
    self.plan = plan
    self.output = output
    self.cancelled = cancelled
    self.onProgress = onProgress
  }

  func run() throws -> BurnResult {
    try? FileManager.default.createDirectory(
      at: output.deletingLastPathComponent(),
      withIntermediateDirectories: true
    )
    try? FileManager.default.removeItem(at: output)

    do {
      return try transcode()
    } catch let error as Exception {
      try? FileManager.default.removeItem(at: output)
      throw error
    } catch {
      try? FileManager.default.removeItem(at: output)
      throw EncoderException(error.localizedDescription)
    }
  }

  private func transcode() throws -> BurnResult {
    let asset = AVURLAsset(url: source)
    let tracks = try Sync.wait { try await asset.load(.tracks) }
    guard let videoTrack = tracks.first(where: { $0.mediaType == .video }) else { throw NoVideoTrackException() }
    let audioTrack = tracks.first(where: { $0.mediaType == .audio })

    let (naturalSize, transform, assetDuration) = try Sync.wait {
      try await (videoTrack.load(.naturalSize), videoTrack.load(.preferredTransform), asset.load(.duration))
    }
    let orientation = Orientation.of(transform)
    let sourceDurationMs = Int64((CMTimeGetSeconds(assetDuration) * 1000).rounded())
    let durationMs = sourceDurationMs > 0 ? sourceDurationMs : plan.durationMs

    let reader = try AVAssetReader(asset: asset)
    let videoOutput = AVAssetReaderTrackOutput(
      track: videoTrack,
      outputSettings: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA]
    )
    videoOutput.alwaysCopiesSampleData = false
    guard reader.canAdd(videoOutput) else { throw EncoderException("the reader refused the video track") }
    reader.add(videoOutput)

    // Copied, not re-encoded: the user's voice was already right and a second
    // lossy pass over it would be damage for nothing.
    var audioOutput: AVAssetReaderTrackOutput?
    var audioFormat: CMFormatDescription?
    if let audioTrack {
      let formats = try Sync.wait { try await audioTrack.load(.formatDescriptions) }
      if let format = formats.first {
        let out = AVAssetReaderTrackOutput(track: audioTrack, outputSettings: nil)
        out.alwaysCopiesSampleData = false
        if reader.canAdd(out) {
          reader.add(out)
          audioOutput = out
          audioFormat = format
        }
      }
    }

    let writer = try AVAssetWriter(outputURL: output, fileType: .mp4)
    let videoInput = AVAssetWriterInput(mediaType: .video, outputSettings: encoderSettings())
    videoInput.expectsMediaDataInRealTime = false
    let adaptor = AVAssetWriterInputPixelBufferAdaptor(
      assetWriterInput: videoInput,
      sourcePixelBufferAttributes: [
        kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
        kCVPixelBufferWidthKey as String: plan.width,
        kCVPixelBufferHeightKey as String: plan.height,
        kCVPixelBufferIOSurfacePropertiesKey as String: [:],
      ]
    )
    guard writer.canAdd(videoInput) else { throw EncoderException("the writer refused the video settings") }
    writer.add(videoInput)

    var audioInput: AVAssetWriterInput?
    if let audioFormat, audioOutput != nil {
      let input = AVAssetWriterInput(mediaType: .audio, outputSettings: nil, sourceFormatHint: audioFormat)
      input.expectsMediaDataInRealTime = false
      if writer.canAdd(input) {
        writer.add(input)
        audioInput = input
      } else {
        audioOutput = nil
      }
    }

    guard reader.startReading() else {
      throw EncoderException(reader.error?.localizedDescription ?? "the reader refused to start")
    }
    guard writer.startWriting() else {
      throw EncoderException(writer.error?.localizedDescription ?? "the writer refused to start")
    }
    writer.startSession(atSourceTime: .zero)

    guard let pool = adaptor.pixelBufferPool else { throw EncoderException("no pixel buffer pool") }
    let painter = try CaptionPainter(width: plan.width, height: plan.height)
    // No colour management: the frame goes out with the values it came in with,
    // and the overlay's sRGB is laid over it as it was drawn. Both renderers
    // composite raw bytes, which is what keeps them the same picture.
    let ciContext = CIContext(options: [
      .workingColorSpace: NSNull(),
      .outputColorSpace: NSNull(),
      .cacheIntermediates: false,
    ])
    let bounds = CGRect(x: 0, y: 0, width: plan.width, height: plan.height)

    let queue = DispatchQueue(label: "burn-in")
    let group = DispatchGroup()
    var failure: Error?
    var frames = 0
    var lastPresentationMs: Int64 = 0
    var entryShowing = -1
    var overlay: CIImage?
    var reported = -1.0

    func fail(_ error: Error) {
      if failure == nil { failure = error }
      reader.cancelReading()
    }

    group.enter()
    var videoFinished = false
    videoInput.requestMediaDataWhenReady(on: queue) { [self] in
      guard !videoFinished else { return }
      while videoInput.isReadyForMoreMediaData {
        if cancelled.isSet { fail(CancelledException()) }
        if failure != nil || reader.status != .reading {
          videoFinished = true
          videoInput.markAsFinished()
          group.leave()
          return
        }

        guard let sample = videoOutput.copyNextSampleBuffer() else {
          if reader.status == .failed { fail(reader.error ?? EncoderException("the decoder stopped")) }
          videoFinished = true
          videoInput.markAsFinished()
          group.leave()
          return
        }
        guard let pixels = CMSampleBufferGetImageBuffer(sample) else { continue }

        let pts = CMSampleBufferGetPresentationTimeStamp(sample)
        let presentationMs = CMTimeConvertScale(pts, timescale: 1000, method: .roundHalfAwayFromZero).value

        do {
          let wanted = plan.entryAt(presentationMs, from: max(entryShowing, 0))
          if wanted != entryShowing {
            overlay = CIImage(cgImage: try painter.paint(plan.entries[wanted], watermark: plan.watermark))
            entryShowing = wanted
          }

          var frame = CIImage(cvPixelBuffer: pixels).oriented(orientation)
          let extent = frame.extent
          frame = frame
            .transformed(by: CGAffineTransform(translationX: -extent.origin.x, y: -extent.origin.y))
            .transformed(
              by: CGAffineTransform(
                scaleX: CGFloat(plan.width) / extent.width,
                y: CGFloat(plan.height) / extent.height
              )
            )
          if let overlay { frame = overlay.composited(over: frame) }

          var target: CVPixelBuffer?
          CVPixelBufferPoolCreatePixelBuffer(nil, pool, &target)
          guard let target else { throw EncoderException("no pixel buffer for frame \(frames)") }
          ciContext.render(frame, to: target, bounds: bounds, colorSpace: nil)

          guard adaptor.append(target, withPresentationTime: pts) else {
            throw EncoderException(writer.error?.localizedDescription ?? "the encoder refused a frame")
          }
        } catch {
          fail(error)
          continue
        }

        frames += 1
        lastPresentationMs = presentationMs

        let done = durationMs > 0 ? min(1.0, Double(presentationMs) / Double(durationMs)) : 0
        // Reported in whole percents: a progress bar that redraws four thousand
        // times is four thousand renders the encoder did not get.
        if done - reported >= 0.01 {
          reported = done
          onProgress(done)
        }
      }
    }

    if let audioInput, let audioOutput {
      group.enter()
      var audioFinished = false
      audioInput.requestMediaDataWhenReady(on: queue) { [self] in
        guard !audioFinished else { return }
        while audioInput.isReadyForMoreMediaData {
          if cancelled.isSet { fail(CancelledException()) }
          if failure != nil || reader.status != .reading {
            audioFinished = true
            audioInput.markAsFinished()
            group.leave()
            return
          }
          guard let sample = audioOutput.copyNextSampleBuffer() else {
            if reader.status == .failed { fail(reader.error ?? EncoderException("the audio stopped")) }
            audioFinished = true
            audioInput.markAsFinished()
            group.leave()
            return
          }
          if !audioInput.append(sample) {
            fail(EncoderException(writer.error?.localizedDescription ?? "the muxer refused audio"))
          }
        }
      }
    }

    group.wait()

    if let failure {
      writer.cancelWriting()
      throw failure
    }

    let finished = DispatchSemaphore(value: 0)
    writer.finishWriting { finished.signal() }
    finished.wait()
    guard writer.status == .completed else {
      throw EncoderException(writer.error?.localizedDescription ?? "the file could not be finished")
    }

    onProgress(1.0)

    let size = (try? FileManager.default.attributesOfItem(atPath: output.path)[.size] as? NSNumber)?.doubleValue ?? 0
    let result = BurnResult()
    result.path = output.path
    result.width = plan.width
    result.height = plan.height
    result.byteLength = size
    result.frameCount = frames
    result.durationMs = Double(lastPresentationMs)
    result.hasAudio = audioInput != nil
    return result
  }

  private func encoderSettings() -> [String: Any] {
    [
      AVVideoCodecKey: AVVideoCodecType.h264,
      AVVideoWidthKey: plan.width,
      AVVideoHeightKey: plan.height,
      AVVideoCompressionPropertiesKey: [
        AVVideoAverageBitRateKey: bitrate(),
        AVVideoExpectedSourceFrameRateKey: plan.fps,
        AVVideoMaxKeyFrameIntervalKey: max(1, plan.fps * VideoBurner.keyframeSeconds),
        AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
      ],
    ]
  }

  /// Bits per second, from the size and rate of what is being written. The same
  /// three numbers as `VideoBurner.kt` and `checkSpace` in src/export/run.ts;
  /// change them here and change them there.
  private func bitrate() -> Int {
    let bits = Double(plan.width) * Double(plan.height) * Double(plan.fps) * VideoBurner.bitsPerPixel
    return min(20_000_000, max(2_000_000, Int(bits.rounded())))
  }

  private static let keyframeSeconds = 1
  private static let bitsPerPixel = 0.13
}

/// What `preferredTransform` says about which way is up, as the orientation
/// Core Image can undo. Phone recordings are stored sideways with one of these.
internal enum Orientation {
  static func of(_ t: CGAffineTransform) -> CGImagePropertyOrientation {
    switch degrees(t) {
    case 90: return .right
    case 180: return .down
    case 270: return .left
    default: return .up
    }
  }

  /// The rotation in the metadata, as the degrees Android reports for the same file.
  static func degrees(_ t: CGAffineTransform) -> Int {
    if t.a == 0, t.b == 1, t.c == -1, t.d == 0 { return 90 }
    if t.a == -1, t.b == 0, t.c == 0, t.d == -1 { return 180 }
    if t.a == 0, t.b == -1, t.c == 1, t.d == 0 { return 270 }
    return 0
  }
}

/// Blocks the calling thread on an async load. The module's functions already
/// run off the JS thread and off main, and a render is minutes of synchronous
/// work anyway; one more blocking wait at the start of it costs nothing.
internal enum Sync {
  private final class Outcome<T>: @unchecked Sendable {
    var value: Result<T, Error>?
  }

  static func wait<T: Sendable>(_ work: @escaping @Sendable () async throws -> T) throws -> T {
    let semaphore = DispatchSemaphore(value: 0)
    let outcome = Outcome<T>()
    Task.detached {
      do {
        outcome.value = .success(try await work())
      } catch {
        outcome.value = .failure(error)
      }
      semaphore.signal()
    }
    semaphore.wait()
    guard let value = outcome.value else { throw EncoderException("a load never finished") }
    return try value.get()
  }
}
