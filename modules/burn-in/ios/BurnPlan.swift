import CoreGraphics
import ExpoModulesCore
import Foundation

/// The draw list for a whole video, as JavaScript wrote it.
///
/// Nothing in this file decides anything about how a caption looks. Every
/// position, size and colour was produced by `layoutCaptionFrame` in JS, measured
/// with the same Skia faces the preview used, at this export's own pixel size.
/// That is how the exported file and the preview stay the same picture
/// (invariant 2), and it is why this is a reader and not a layout engine. It
/// mirrors `BurnPlan.kt` field for field.

/// A CSS colour, kept as components so opacity can be folded in at draw time.
internal struct BurnColor {
  let red: CGFloat
  let green: CGFloat
  let blue: CGFloat
  let alpha: CGFloat

  func cgColor(opacity: CGFloat = 1) -> CGColor {
    CGColor(
      colorSpace: BurnColor.space,
      components: [red, green, blue, alpha * min(max(opacity, 0), 1)]
    ) ?? CGColor(gray: 1, alpha: 1)
  }

  static let space = CGColorSpace(name: CGColorSpace.sRGB) ?? CGColorSpaceCreateDeviceRGB()
  static let white = BurnColor(red: 1, green: 1, blue: 1, alpha: 1)

  /// The style sheet writes what Skia parses, which is CSS Color 4: eight digits
  /// mean `#RRGGBBAA`, alpha last. Anything else is a colour this app never
  /// writes, and white is visible, which is what makes it the right thing to
  /// fail to.
  static func parse(_ value: String) -> BurnColor {
    let hex = value.hasPrefix("#") ? String(value.dropFirst()) : value
    guard hex.count == 6 || hex.count == 8, let bits = UInt32(hex, radix: 16) else { return .white }

    if hex.count == 6 {
      return BurnColor(
        red: CGFloat((bits >> 16) & 0xFF) / 255,
        green: CGFloat((bits >> 8) & 0xFF) / 255,
        blue: CGFloat(bits & 0xFF) / 255,
        alpha: 1
      )
    }
    return BurnColor(
      red: CGFloat((bits >> 24) & 0xFF) / 255,
      green: CGFloat((bits >> 16) & 0xFF) / 255,
      blue: CGFloat((bits >> 8) & 0xFF) / 255,
      alpha: CGFloat(bits & 0xFF) / 255
    )
  }
}

/// A drop shadow. `blur` is the Gaussian sigma the preview's Skia blur mask was
/// given; the painter converts it to what Core Graphics wants.
internal struct BurnShadow {
  let color: BurnColor
  let blur: CGFloat
  let dx: CGFloat
  let dy: CGFloat
}

internal struct BurnBox {
  let x: CGFloat
  let y: CGFloat
  let width: CGFloat
  let height: CGFloat
  let radius: CGFloat
  let color: BurnColor
  let shadow: BurnShadow?
}

internal struct BurnWord {
  let text: String
  let x: CGFloat
  let y: CGFloat
  let width: CGFloat
  let height: CGFloat
  let baseline: CGFloat
  let size: CGFloat
  let face: String
  let color: BurnColor
  let fillColor: BurnColor
  /// 0..1 of the word's width already spoken. Karaoke clips to this.
  let fill: CGFloat
  let opacity: CGFloat
  /// Uniform scale about the centre of the word's box.
  let scale: CGFloat
  let outlineColor: BurnColor
  let outlineWidth: CGFloat
  let shadow: BurnShadow?
  let box: BurnBox?
}

/// A draw list and the moment it starts applying. It holds until the next one.
internal struct BurnEntry {
  let tMs: Int64
  let plate: BurnBox?
  let words: [BurnWord]
}

/// One line of the mark.
internal struct BurnMarkLine {
  let text: String
  let x: CGFloat
  let baseline: CGFloat
  let size: CGFloat
  let face: String
  let color: BurnColor
  let shadow: BurnShadow?
}

/// The free tier's mark, positioned in JS like everything else here. Null for
/// anyone who has paid. The icon arrives as ordinary boxes, so the painter draws
/// it with the same `drawBox` a box highlight goes through.
internal struct BurnWatermark {
  let pills: [BurnBox]
  let lines: [BurnMarkLine]
}

internal struct BurnPlan {
  let width: Int
  let height: Int
  let fps: Int
  let durationMs: Int64
  let watermark: BurnWatermark?
  let entries: [BurnEntry]

  /// The entry showing at `tMs`, given the one showing now. Entries only move forward.
  func entryAt(_ tMs: Int64, from: Int) -> Int {
    var index = from
    while index + 1 < entries.count && entries[index + 1].tMs <= tMs { index += 1 }
    return index
  }
}

internal final class PlanUnreadableException: GenericException<String> {
  override var reason: String { "The caption plan could not be read: \(param)" }
}

internal enum PlanReader {
  static func read(path: String) throws -> BurnPlan {
    do {
      let data = try Data(contentsOf: URL(fileURLWithPath: path))
      let json = try JSONSerialization.jsonObject(with: data)
      guard let object = json as? [String: Any] else { throw PlanUnreadableException("not an object") }
      return try parse(object)
    } catch let error as PlanUnreadableException {
      throw error
    } catch {
      throw PlanUnreadableException(error.localizedDescription)
    }
  }

  private static func parse(_ json: [String: Any]) throws -> BurnPlan {
    guard
      let width = json["width"] as? Int,
      let height = json["height"] as? Int,
      let fps = json["fps"] as? Int,
      let entriesJson = json["entries"] as? [[String: Any]]
    else { throw PlanUnreadableException("missing width, height, fps or entries") }

    let entries = try entriesJson.map { entry -> BurnEntry in
      guard let tMs = number(entry["tMs"]), let wordsJson = entry["words"] as? [[String: Any]] else {
        throw PlanUnreadableException("an entry is missing tMs or words")
      }
      return BurnEntry(
        tMs: Int64(tMs),
        plate: box(entry["plate"] as? [String: Any]),
        words: try wordsJson.map(word)
      )
    }

    guard !entries.isEmpty else { throw PlanUnreadableException("no entries") }

    return BurnPlan(
      width: width,
      height: height,
      fps: fps,
      durationMs: Int64(number(json["durationMs"]) ?? 0),
      watermark: try watermark(json["watermark"] as? [String: Any]),
      entries: entries
    )
  }

  private static func watermark(_ json: [String: Any]?) throws -> BurnWatermark? {
    guard let json else { return nil }
    guard let linesJson = json["lines"] as? [[String: Any]] else {
      throw PlanUnreadableException("the watermark has no lines")
    }
    let pillsJson = json["pills"] as? [[String: Any]] ?? []

    return BurnWatermark(
      pills: pillsJson.compactMap(box),
      lines: try linesJson.map { line in
        guard
          let text = line["text"] as? String,
          let x = number(line["x"]),
          let baseline = number(line["baseline"]),
          let size = number(line["size"]),
          let face = line["face"] as? String,
          let color = line["color"] as? String
        else { throw PlanUnreadableException("a watermark line is incomplete") }
        return BurnMarkLine(
          text: text,
          x: CGFloat(x),
          baseline: CGFloat(baseline),
          size: CGFloat(size),
          face: face,
          color: BurnColor.parse(color),
          shadow: shadow(line["shadow"] as? [String: Any])
        )
      }
    )
  }

  private static func word(_ json: [String: Any]) throws -> BurnWord {
    guard
      let text = json["text"] as? String,
      let x = number(json["x"]),
      let y = number(json["y"]),
      let width = number(json["width"]),
      let height = number(json["height"]),
      let baseline = number(json["baseline"]),
      let size = number(json["size"]),
      let face = json["face"] as? String,
      let color = json["color"] as? String,
      let fillColor = json["fillColor"] as? String,
      let fill = number(json["fill"]),
      let opacity = number(json["opacity"]),
      let scale = number(json["scale"]),
      let outlineColor = json["outlineColor"] as? String,
      let outlineWidth = number(json["outlineWidth"])
    else { throw PlanUnreadableException("a word is incomplete") }

    return BurnWord(
      text: text,
      x: CGFloat(x),
      y: CGFloat(y),
      width: CGFloat(width),
      height: CGFloat(height),
      baseline: CGFloat(baseline),
      size: CGFloat(size),
      face: face,
      color: BurnColor.parse(color),
      fillColor: BurnColor.parse(fillColor),
      fill: CGFloat(fill),
      opacity: CGFloat(opacity),
      scale: CGFloat(scale),
      outlineColor: BurnColor.parse(outlineColor),
      outlineWidth: CGFloat(outlineWidth),
      shadow: shadow(json["shadow"] as? [String: Any]),
      box: box(json["box"] as? [String: Any])
    )
  }

  private static func box(_ json: [String: Any]?) -> BurnBox? {
    guard
      let json,
      let x = number(json["x"]),
      let y = number(json["y"]),
      let width = number(json["width"]),
      let height = number(json["height"]),
      let radius = number(json["radius"]),
      let color = json["color"] as? String
    else { return nil }

    return BurnBox(
      x: CGFloat(x),
      y: CGFloat(y),
      width: CGFloat(width),
      height: CGFloat(height),
      radius: CGFloat(radius),
      color: BurnColor.parse(color),
      shadow: shadow(json["shadow"] as? [String: Any])
    )
  }

  private static func shadow(_ json: [String: Any]?) -> BurnShadow? {
    guard
      let json,
      let color = json["color"] as? String,
      let blur = number(json["blur"]),
      let dx = number(json["dx"]),
      let dy = number(json["dy"])
    else { return nil }

    return BurnShadow(color: BurnColor.parse(color), blur: CGFloat(blur), dx: CGFloat(dx), dy: CGFloat(dy))
  }

  /// JSONSerialization hands back NSNumber, which Swift reads as whichever of
  /// Int and Double it was written as. The plan writes both.
  private static func number(_ value: Any?) -> Double? {
    if let value = value as? NSNumber { return value.doubleValue }
    return nil
  }
}
