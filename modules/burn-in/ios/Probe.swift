import AVFoundation
import ExpoModulesCore
import Foundation

internal final class UnreadableVideoException: GenericException<String> {
  override var reason: String { "That video could not be read: \(param)" }
}

/// What the Export screen prints before anything is rendered.
///
/// The size is the upright one: a phone recording carries its rotation in
/// metadata, so the track is often 1920 by 1080 for a video every human being
/// involved would call portrait. Saying "1920 × 1080" about it would be true of
/// the file and wrong about the video.
internal enum Probe {
  static func read(url: URL) throws -> VideoInfo {
    let asset = AVURLAsset(url: url)
    let tracks: [AVAssetTrack]
    do {
      tracks = try Sync.wait { try await asset.load(.tracks) }
    } catch {
      throw UnreadableVideoException(error.localizedDescription)
    }
    guard let video = tracks.first(where: { $0.mediaType == .video }) else { throw NoVideoTrackException() }

    do {
      let (size, transform, frameRate, duration) = try Sync.wait {
        try await (
          video.load(.naturalSize),
          video.load(.preferredTransform),
          video.load(.nominalFrameRate),
          asset.load(.duration)
        )
      }
      let rotation = Orientation.degrees(transform)
      let upright = rotation == 90 || rotation == 270

      let info = VideoInfo()
      info.width = Int(upright ? size.height : size.width)
      info.height = Int(upright ? size.width : size.height)
      info.rotation = rotation
      info.durationMs = CMTimeGetSeconds(duration) * 1000
      info.hasAudio = tracks.contains { $0.mediaType == .audio }
      // The nominal rate is what the track says; thirty is the last resort and
      // only affects what the encoder is told to aim for, since every frame
      // keeps its own timestamp regardless.
      info.fps = frameRate > 0 ? Double(frameRate) : 30
      return info
    } catch {
      throw UnreadableVideoException(error.localizedDescription)
    }
  }
}
