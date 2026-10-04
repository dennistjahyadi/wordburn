import React from 'react';
import { spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

/**
 * One doodle, built up a piece at a time.
 *
 * `pieces.py` cuts each picture into the things in it — the character, the
 * phone, the clock, each burst of lines — and every pixel belongs to exactly
 * one piece, so the pieces together are the whole picture. They pop on in
 * order, biggest first, each with a small overshoot from its own centre, and
 * once the last one has landed the original fades over them so the scene
 * settles on the exact image.
 */
export type Piece = { x: number; y: number; w: number; h: number };
export type Blob = { x0: number; y0: number; x1: number; y1: number; area: number };
export type DrawingData = {
  id: string;
  w: number;
  h: number;
  bbox: [number, number, number, number];
  pieces: Piece[];
  yellow: Blob[];
  coral: Blob[];
};

export const Drawing: React.FC<{
  data: DrawingData;
  /** Frame (of the scene) the first piece lands on. */
  start: number;
  /** Frames between one piece and the next. */
  gap: number;
  /** SVG drawn above the picture, in the picture's own pixels. */
  children?: React.ReactNode;
}> = ({ data, start, gap, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { id, w, h, pieces } = data;

  const lastAt = start + gap * (pieces.length - 1);
  const settle = Math.max(0, Math.min(1, (frame - lastAt - 12) / 6));

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
      {/*
        Every piece is mounted from the first frame, so it is decoded before
        it is needed; what changes is its opacity and scale.
      */}
      {pieces.map((p, k) => {
        const s = spring({
          frame: frame - (start + gap * k),
          fps,
          config: { damping: 11, stiffness: 190, mass: 0.6 },
        });
        const cx = p.x + p.w / 2;
        const cy = p.y + p.h / 2;
        const scale = 0.55 + 0.45 * s;
        return (
          <g
            key={k}
            transform={`translate(${cx} ${cy + (1 - s) * 30}) scale(${scale}) translate(${-cx} ${-cy})`}
            opacity={settle >= 1 ? 0 : Math.min(1, Math.max(0, s * 2.5))}
          >
            <image href={staticFile(`drawmylife/${id}-p${k}.png`)} x={p.x} y={p.y} width={p.w} height={p.h} />
          </g>
        );
      })}
      <image href={staticFile(`drawmylife/${id}-full.png`)} width={w} height={h} opacity={settle} />

      {children}
    </svg>
  );
};

/** Where the drawing's content goes in the 1080 × 1920 frame. */
export const fit = (data: DrawingData, captions = true) => {
  const [x0, y0, x1, y1] = data.bbox;
  const bw = x1 - x0;
  const bh = y1 - y0;
  // Between the top safe line and the captions' band; with no captions, down
  // to the bottom safe line (0.78 of the height), where TikTok's chrome starts.
  const box = { left: 70, top: 235, width: 940, height: captions ? 1080 : 1240 };
  const scale = Math.min(box.width / bw, box.height / bh, 1.35);
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const left = box.left + box.width / 2 - cx * scale;
  const top = box.top + box.height / 2 - cy * scale;
  return { scale, left, top, width: data.w * scale, height: data.h * scale, cx, cy };
};
