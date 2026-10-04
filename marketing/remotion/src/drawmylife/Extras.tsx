import { evolvePath } from '@remotion/paths';
import React from 'react';
import { Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

import { font } from '../brand';

import type { Blob } from './Drawing';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/**
 * A real screenshot of the app, taped onto the whiteboard.
 *
 * The drawings tell the story; these are the proof. A doodle of the editor
 * says the app does something, a screenshot of it shows that it does, so the
 * two scenes that make a claim about the editor drop the real screen onto the
 * page for the length of the claim and pull it off again.
 */
export const TapedShot: React.FC<{
  src: string;
  at: number;
  out: number;
  /** Card width on the 1080 frame. */
  width?: number;
  ratio: number;
  centerY?: number;
  tilt?: number;
}> = ({ src, at, out, width = 760, ratio, centerY = 780, tilt = -3 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at || frame > out + 14) return null;

  const land = spring({ frame: frame - at, fps, config: { damping: 15, stiffness: 160, mass: 0.7 } });
  const leave = interpolate(frame, [out, out + 12], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });

  const pad = 18;
  const h = width * ratio;
  return (
    <div
      style={{
        position: 'absolute',
        left: 540 - width / 2 - pad,
        top: centerY - h / 2 - pad,
        width: width + pad * 2,
        height: h + pad * 2,
        background: '#fff',
        borderRadius: 10,
        boxShadow: '0 30px 60px rgba(0,0,0,0.22), 0 6px 14px rgba(0,0,0,0.12)',
        padding: pad,
        transform: `translateY(${leave * -1500}px) rotate(${tilt + (1 - land) * -9 + leave * 10}deg) scale(${1.25 - land * 0.25})`,
        opacity: Math.min(1, land * 1.6),
      }}
    >
      <Img src={staticFile(src)} style={{ width, height: h, borderRadius: 6, display: 'block' }} />
      {[-1, 1].map((side) => (
        <div
          key={side}
          style={{
            position: 'absolute',
            top: -22,
            left: side < 0 ? 40 : undefined,
            right: side > 0 ? 40 : undefined,
            width: 150,
            height: 46,
            background: 'rgba(255, 236, 160, 0.82)',
            transform: `rotate(${side * 8}deg)`,
            boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
          }}
        />
      ))}
    </div>
  );
};

/**
 * A marker loop drawn round something on its word: the presenter's circle.
 * In the picture's own pixels, so it sits inside the drawing's SVG.
 */
export const Circle: React.FC<{ box: Blob; at: number; pad?: number; color?: string }> = ({
  box,
  at,
  pad = 26,
  color = '#111',
}) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const cx = (box.x0 + box.x1) / 2;
  const cy = (box.y0 + box.y1) / 2;
  const rx = (box.x1 - box.x0) / 2 + pad;
  const ry = (box.y1 - box.y0) / 2 + pad;
  // One and a bit turns, starting at the upper right, overshooting like a hand.
  const d = [
    `M ${cx + rx * 0.7} ${cy - ry * 0.75}`,
    `C ${cx + rx * 1.15} ${cy - ry * 0.3}, ${cx + rx * 1.05} ${cy + ry * 0.9}, ${cx} ${cy + ry}`,
    `C ${cx - rx * 1.1} ${cy + ry * 1.0}, ${cx - rx * 1.1} ${cy - ry * 1.0}, ${cx} ${cy - ry * 1.02}`,
    `C ${cx + rx * 0.6} ${cy - ry * 1.05}, ${cx + rx * 1.02} ${cy - ry * 0.55}, ${cx + rx * 1.05} ${cy - ry * 0.05}`,
  ].join(' ');
  const k = interpolate(frame, [at, at + 9], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  const { strokeDasharray, strokeDashoffset } = evolvePath(k, d);
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={9}
      strokeLinecap="round"
      strokeDasharray={strokeDasharray}
      strokeDashoffset={strokeDashoffset}
    />
  );
};

/** A word written into a drawn pill on its cue, with a small pop. */
export const PillWord: React.FC<{
  box: Blob;
  text: string;
  at: number;
  color?: string;
  /** Font size as a share of the pill's height. */
  size?: number;
  pop?: number;
}> = ({ box, text, at, color = '#111', size = 0.5, pop = 0.25 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 9, stiffness: 180, mass: 0.6 } });
  const cx = (box.x0 + box.x1) / 2;
  const cy = (box.y0 + box.y1) / 2;
  const fs = (box.y1 - box.y0) * size;
  const scale = 1 - pop + s * pop;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${scale})`} opacity={Math.min(1, s * 2)}>
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily={font.bold}
        fontSize={fs}
        letterSpacing={-fs * 0.02}
        fill={color}
      >
        {text}
      </text>
    </g>
  );
};

/** Text in the picture's own pixels, arriving on its cue. */
export const Label: React.FC<{
  x: number;
  y: number;
  text: string;
  at: number;
  size: number;
  anchor?: 'start' | 'middle';
  weight?: string;
  color?: string;
  spacing?: number;
}> = ({ x, y, text, at, size, anchor = 'middle', weight = font.bold, color = '#111', spacing = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 200, stiffness: 170, mass: 0.6 } });
  return (
    <text
      x={x}
      y={y + (1 - s) * 18}
      textAnchor={anchor}
      dominantBaseline="central"
      fontFamily={weight}
      fontSize={size}
      letterSpacing={spacing}
      fill={color}
      opacity={s}
    >
      {text}
    </text>
  );
};
