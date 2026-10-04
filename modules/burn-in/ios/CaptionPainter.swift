import CoreGraphics
import CoreText
import Foundation

/// One frame's captions, painted.
///
/// Core Graphics and Core Text over the same font files the preview measured
/// with, at the same sizes, drawn from the same baselines. This file positions
/// nothing: that is the whole reason the export can be trusted to match the
/// preview without a second layout. It is `CaptionPainter.kt` in another API.
///
/// The order matters and is the preview's order: the card under everything, then
/// every box as one pass, then every word. A box is padded past its own word, so
/// drawing each one immediately before its word would paint over the neighbour.
///
/// Glyphs go down one at a time from their own advances rather than through a
/// `CTLine`, because that is what Skia's `drawText` does in the preview: no
/// kerning, no ligatures, the advance of each glyph and nothing else. A shaped
/// line would set the same word a few pixels narrower and invariant 2 would be
/// broken inside the word where nobody would think to measure.
///
/// Coordinates are the plan's: origin top-left, y down. The context is flipped
/// once per frame and the text matrix flipped back, so every number from the
/// plan is used as it arrived.
internal final class CaptionPainter {
  private let width: Int
  private let height: Int
  private let context: CGContext
  private var fonts: [String: CGFont?] = [:]

  init(width: Int, height: Int) throws {
    self.width = width
    self.height = height
    guard
      let context = CGContext(
        data: nil,
        width: width,
        height: height,
        bitsPerComponent: 8,
        bytesPerRow: 0,
        space: BurnColor.space,
        bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue | CGBitmapInfo.byteOrder32Big.rawValue
      )
    else { throw EncoderException("no overlay context at \(width)×\(height)") }
    self.context = context
    context.setAllowsAntialiasing(true)
    context.setShouldAntialias(true)
    context.setAllowsFontSmoothing(false)
    context.setShouldSmoothFonts(false)
  }

  func paint(_ entry: BurnEntry, watermark: BurnWatermark?) throws -> CGImage {
    context.clear(CGRect(x: 0, y: 0, width: width, height: height))
    context.saveGState()
    context.translateBy(x: 0, y: CGFloat(height))
    context.scaleBy(x: 1, y: -1)
    context.textMatrix = CGAffineTransform(scaleX: 1, y: -1)

    // The card is behind the whole block and belongs to no word, so it takes no
    // word's opacity and no word's scale.
    if let plate = entry.plate { drawBox(plate, opacity: 1, scale: 1) }

    for word in entry.words {
      if let box = word.box {
        withWord(word) { drawBox(box, opacity: word.opacity, scale: word.scale) }
      }
    }
    for word in entry.words { drawWord(word) }

    // Last, over everything. The overlay is repainted whenever the caption
    // entry changes and reused in between, so drawing the mark here is what
    // puts it on every frame of the file.
    if let watermark { drawWatermark(watermark) }

    context.restoreGState()
    guard let image = context.makeImage() else { throw EncoderException("the overlay could not be drawn") }
    return image
  }

  /// The mark: the icon's pills, then each line as shadow and glyphs — the same
  /// draws the preview's `Watermark` makes, in the same order.
  private func drawWatermark(_ mark: BurnWatermark) {
    for pill in mark.pills { drawBox(pill, opacity: 1, scale: 1) }

    for line in mark.lines {
      let font = fontFor(line.face, size: line.size)
      let run = GlyphRun(text: line.text, font: font)

      if let shadow = line.shadow {
        shadowed(shadow, opacity: 1, scale: 1) { offset in
          context.setTextDrawingMode(.fill)
          context.setFillColor(shadow.color.cgColor())
          run.draw(in: context, x: line.x - offset, baseline: line.baseline)
        }
      }

      context.setTextDrawingMode(.fill)
      context.setFillColor(line.color.cgColor())
      run.draw(in: context, x: line.x, baseline: line.baseline)
    }
  }

  private func drawBox(_ box: BurnBox, opacity: CGFloat, scale: CGFloat) {
    // A corner wider than half the box is a rounded rectangle Core Graphics
    // refuses to make; the preview draws it as a pill, which is what this is.
    let radius = min(box.radius, box.width / 2, box.height / 2)
    let rect = CGRect(x: box.x, y: box.y, width: box.width, height: box.height)

    if let shadow = box.shadow {
      shadowed(shadow, opacity: opacity, scale: scale) { offset in
        context.setFillColor(shadow.color.cgColor())
        context.addPath(
          CGPath(roundedRect: rect.offsetBy(dx: -offset, dy: 0), cornerWidth: radius, cornerHeight: radius, transform: nil)
        )
        context.fillPath()
      }
    }

    context.setFillColor(box.color.cgColor(opacity: opacity))
    context.addPath(CGPath(roundedRect: rect, cornerWidth: radius, cornerHeight: radius, transform: nil))
    context.fillPath()
  }

  private func drawWord(_ word: BurnWord) {
    let font = fontFor(word.face, size: word.size)
    let run = GlyphRun(text: word.text, font: font)

    withWord(word) {
      if let shadow = word.shadow {
        // A drop shadow is the word again, offset, blurred and in one colour:
        // the same two draws the preview makes.
        shadowed(shadow, opacity: word.opacity, scale: word.scale) { offset in
          context.setTextDrawingMode(.fill)
          context.setFillColor(shadow.color.cgColor())
          run.draw(in: context, x: word.x - offset, baseline: word.baseline)
        }
      }

      if word.outlineWidth > 0 {
        context.setTextDrawingMode(.stroke)
        context.setStrokeColor(word.outlineColor.cgColor(opacity: word.opacity))
        context.setLineJoin(.round)
        // Doubled because a stroke is centred on the glyph outline and half of
        // it lands inside the letter. The draw list means the width that shows.
        context.setLineWidth(word.outlineWidth * CaptionPainter.strokeCentring)
        run.draw(in: context, x: word.x, baseline: word.baseline)
      }

      context.setTextDrawingMode(.fill)
      context.setFillColor(word.color.cgColor(opacity: word.opacity))
      run.draw(in: context, x: word.x, baseline: word.baseline)

      if word.fill > 0, !sameColor(word.fillColor, word.color) {
        // Karaoke: the part of the word already said, clipped to how much of it
        // that is. Clipped wide vertically so a descender is never cut off.
        context.saveGState()
        context.clip(
          to: CGRect(
            x: word.x,
            y: word.y - word.height,
            width: word.width * word.fill,
            height: word.height * 3
          )
        )
        context.setFillColor(word.fillColor.cgColor(opacity: word.opacity))
        run.draw(in: context, x: word.x, baseline: word.baseline)
        context.restoreGState()
      }
    }
  }

  /// Scales about the centre of the word's box, as the preview's `origin` does.
  private func withWord(_ word: BurnWord, _ draw: () -> Void) {
    if word.scale == 1 {
      draw()
      return
    }

    let cx = word.x + word.width / 2
    let cy = word.y + word.height / 2
    context.saveGState()
    context.translateBy(x: cx, y: cy)
    context.scaleBy(x: word.scale, y: word.scale)
    context.translateBy(x: -cx, y: -cy)
    draw()
    context.restoreGState()
  }

  /// Runs `draw` so that only the blurred shadow of what it draws lands on the
  /// canvas.
  ///
  /// Core Graphics has no shadow-only pass: a shadow is a side effect of drawing
  /// a shape, and the shape comes with it. So the shape is drawn a whole canvas
  /// to the left — `draw` is handed how far — with the shadow offset pushed the
  /// same distance back to the right. The shape lands off the bitmap and only
  /// its shadow is seen, at the offset the plan asked for, in the plan's colour,
  /// with the alpha the plan's colour and the word's opacity give it.
  ///
  /// The offset and blur are in the context's base space, which is pixels: a
  /// scaled word's shadow has to be scaled by hand, where the preview's canvas
  /// transform did it for free. And the plan's `dy` points down while base space
  /// points up, hence the sign.
  private func shadowed(_ shadow: BurnShadow, opacity: CGFloat, scale: CGFloat, _ draw: (CGFloat) -> Void) {
    let blur = blurFor(shadow.blur) * scale
    let away = CGFloat(width) + blur * 4 + 64

    context.saveGState()
    context.setShadow(
      offset: CGSize(width: (shadow.dx + away) * scale, height: -shadow.dy * scale),
      blur: blur,
      color: shadow.color.cgColor(opacity: opacity)
    )
    draw(away)
    context.restoreGState()
  }

  /// The face at this size, or the platform's default.
  ///
  /// A missing file draws nothing at all in some renderers and tofu in others,
  /// and captions in the wrong face are recoverable where captions with no glyphs
  /// are not.
  private func fontFor(_ key: String, size: CGFloat) -> CTFont {
    let graphicsFont: CGFont?
    if let cached = fonts[key] {
      graphicsFont = cached
    } else {
      let loaded = Bundle.main.url(forResource: key, withExtension: "ttf")
        .flatMap { CGDataProvider(url: $0 as CFURL) }
        .flatMap { CGFont($0) }
      fonts[key] = loaded
      graphicsFont = loaded
    }

    if let graphicsFont {
      return CTFontCreateWithGraphicsFont(graphicsFont, size, nil, nil)
    }
    return CTFontCreateWithName("Helvetica-Bold" as CFString, size, nil)
  }

  /// The blur the preview used, as Core Graphics wants it.
  ///
  /// The plan carries a Gaussian sigma, because that is what Skia's blur mask
  /// takes and the preview is Skia. `setShadow`'s blur is a kernel width rather
  /// than a deviation — CSS's blur radius, which is two sigmas — so the number
  /// is doubled on the way in. Handed over as it is, every exported shadow would
  /// be half as soft as the previewed one.
  private func blurFor(_ sigma: CGFloat) -> CGFloat {
    max(0, sigma * CaptionPainter.blurPerSigma)
  }

  private func sameColor(_ a: BurnColor, _ b: BurnColor) -> Bool {
    a.red == b.red && a.green == b.green && a.blue == b.blue && a.alpha == b.alpha
  }

  private static let strokeCentring: CGFloat = 2
  private static let blurPerSigma: CGFloat = 2
}

/// A word's glyphs and where each one goes, from the font's own advances.
private struct GlyphRun {
  private let font: CTFont
  private let glyphs: [CGGlyph]
  private let positions: [CGPoint]

  init(text: String, font: CTFont) {
    self.font = font
    let units = Array(text.utf16)
    var mapped = [CGGlyph](repeating: 0, count: units.count)
    CTFontGetGlyphsForCharacters(font, units, &mapped, units.count)

    // A character outside the BMP is two UTF-16 units and one glyph; the glyph
    // sits on the first unit and the second is a zero to skip. A zero on a
    // single unit is a character the face lacks, and that one is kept: it draws
    // the face's own box, which is what the preview draws for it.
    var glyphs: [CGGlyph] = []
    var index = 0
    while index < units.count {
      glyphs.append(mapped[index])
      index += UTF16.isLeadSurrogate(units[index]) && index + 1 < units.count ? 2 : 1
    }

    var advances = [CGSize](repeating: .zero, count: glyphs.count)
    CTFontGetAdvancesForGlyphs(font, .horizontal, glyphs, &advances, glyphs.count)

    var positions: [CGPoint] = []
    positions.reserveCapacity(glyphs.count)
    var pen: CGFloat = 0
    for advance in advances {
      positions.append(CGPoint(x: pen, y: 0))
      pen += advance.width
    }

    self.glyphs = glyphs
    self.positions = positions
  }

  func draw(in context: CGContext, x: CGFloat, baseline: CGFloat) {
    guard !glyphs.isEmpty else { return }
    context.textPosition = CGPoint(x: x, y: baseline)
    CTFontDrawGlyphs(font, glyphs, positions, glyphs.count, context)
  }
}
