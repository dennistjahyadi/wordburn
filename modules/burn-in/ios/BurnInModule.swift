import ExpoModulesCore
import Foundation

internal struct BurnResult: Record {
  @Field var path: String = ""
  @Field var width: Int = 0
  @Field var height: Int = 0
  @Field var byteLength: Double = 0
  @Field var frameCount: Int = 0
  @Field var durationMs: Double = 0
  @Field var hasAudio: Bool = false
}

internal struct SavedFile: Record {
  @Field var uri: String = ""
  @Field var name: String = ""
  @Field var byteLength: Double = 0
}

internal struct VideoInfo: Record {
  /// Upright, with any rotation metadata already applied.
  @Field var width: Int = 0
  @Field var height: Int = 0
  @Field var rotation: Int = 0
  @Field var fps: Double = 0
  @Field var durationMs: Double = 0
  @Field var hasAudio: Bool = false
}

internal final class PublishException: GenericException<String> {
  override var reason: String { param }
}

/// Captions burned into the video.
///
/// The module decides nothing about how a caption looks: it is handed a draw list
/// per moment, produced by the one layout in JavaScript at this export's own pixel
/// size, and it rasterises and muxes. See `BurnPlan.swift`. The same four
/// functions as `BurnInModule.kt`, with the same records back.
public class BurnInModule: Module {
  private let cancelled = Cancellation()

  public func definition() -> ModuleDefinition {
    Name("BurnIn")

    Events("progress")

    AsyncFunction("probe") { (sourceUri: String) -> VideoInfo in
      try Probe.read(url: fileURL(sourceUri))
    }

    // Runs off the JS thread: this is minutes of encoding, not milliseconds.
    AsyncFunction("render") { (sourceUri: String, planPath: String, outputPath: String) -> BurnResult in
      cancelled.reset()

      return try VideoBurner(
        source: fileURL(sourceUri),
        plan: PlanReader.read(path: planPath),
        output: URL(fileURLWithPath: outputPath),
        cancelled: cancelled
      ) { done in
        self.sendEvent("progress", ["done": done])
      }.run()
    }

    /// Asks the render to stop. It stops at the next frame and deletes its file.
    Function("cancel") {
      cancelled.set()
    }

    /// The sidecar subtitle file, where a person can find it.
    ///
    /// iOS has no Downloads folder an app can write into. The nearest thing is
    /// the app's own Documents directory, which the Files app shows under
    /// "On My iPhone › Wordburn" once Info.plist says it may (the two keys
    /// `UIFileSharingEnabled` and `LSSupportsOpeningDocumentsInPlace`, set in
    /// app.json). `displayName` is kept as the file name, as it is on Android.
    AsyncFunction("saveToDownloads") { (path: String, displayName: String, _: String) -> SavedFile in
      let source = URL(fileURLWithPath: path)
      guard FileManager.default.fileExists(atPath: source.path) else {
        throw PublishException("The rendered file is gone")
      }
      guard let documents = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first else {
        throw PublishException("The phone would not accept the file")
      }

      let folder = documents.appendingPathComponent(BurnInModule.album, isDirectory: true)
      try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
      let destination = folder.appendingPathComponent(displayName)
      try? FileManager.default.removeItem(at: destination)
      try FileManager.default.copyItem(at: source, to: destination)

      let size = (try? FileManager.default.attributesOfItem(atPath: destination.path)[.size] as? NSNumber)?.doubleValue ?? 0
      let saved = SavedFile()
      saved.uri = destination.absoluteString
      saved.name = displayName
      saved.byteLength = size
      return saved
    }
  }

  /// JS hands over `file://` URIs and bare paths alike.
  private func fileURL(_ uri: String) -> URL {
    if let url = URL(string: uri), url.scheme != nil { return url }
    return URL(fileURLWithPath: uri)
  }

  private static let album = "Wordburn"
}
