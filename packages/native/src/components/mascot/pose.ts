/**
 * Mascot.module.scss as numbers. Core poses the character with CSS custom
 * properties, transitions and keyframes; React Native has none of those for
 * SVG, so the same values come from two functions: `targetPose`, what the
 * state and mood settle on (which `Mascot` eases toward, as the transitions
 * do), and `motionAt`, the looping animations at a moment in time.
 */
import { cubicBezier, easeInOut, keyframes } from "../motion";

export type MascotState = "idle" | "listening" | "thinking" | "speaking" | "sleeping";
export type MascotMood =
  | "neutral"
  | "happy"
  | "surprised"
  | "sad"
  | "skeptical"
  | "wink"
  | "focused"
  | "determined";

export interface EyePose {
  /** Top lid, 0 open to 1 shut. */
  lt: number;
  /** Bottom lid. */
  lb: number;
  /** Top lid tilt, degrees. */
  tilt: number;
  /** The eye's own scale (wide open, surprised). */
  sx: number;
  sy: number;
  /** The tile eye's turn, degrees. */
  tile: number;
}

export interface BrowPose {
  dy: number;
  rotate: number;
}

/** Everything that eases from one expression to the next. */
export interface Pose {
  gx: number;
  gy: number;
  eyes: [EyePose, EyePose];
  brows: [BrowPose, BrowPose];
  body: { sx: number; sy: number; rotate: number };
}

export interface PoseInput {
  state: MascotState;
  mood: MascotMood;
  tileEyes: boolean;
  lookX: number;
  lookY: number;
  /** 0 to 1 while speaking with a level, else undefined. */
  level?: number;
}

const eye = (): EyePose => ({ lt: 0, lb: 0, tilt: 0, sx: 1, sy: 1, tile: 0 });
const brow = (): BrowPose => ({ dy: 0, rotate: 0 });

/** Where the state and mood settle; index 0 is the left eye or brow, 1 the right. */
export function targetPose({ state, mood, tileEyes, lookX, lookY, level }: PoseInput): Pose {
  const pose: Pose = {
    gx: lookX,
    gy: lookY,
    eyes: [eye(), eye()],
    brows: [brow(), brow()],
    body: { sx: 1, sy: 1, rotate: 0 },
  };
  const [l, r] = pose.eyes;
  const both = (patch: Partial<EyePose>) => {
    Object.assign(l, patch);
    Object.assign(r, patch);
  };
  const [bl, br] = pose.brows;

  // States.
  if (state === "listening") both({ sx: 1.12, sy: 1.12 });
  if (state === "thinking" && !tileEyes) {
    pose.gx = 0.5;
    pose.gy = -0.7;
    r.lt = 0.35;
    pose.body.rotate = 4;
  }
  if (state === "speaking" && level !== undefined) {
    l.sy *= 1 - level * 0.15;
    r.sy *= 1 - level * 0.15;
  }
  if (state === "sleeping") {
    pose.gx = 0;
    pose.gy = 0.25;
    both({ lt: 0.72 });
  }

  // Moods, which come later in the stylesheet and win where both set a value.
  switch (mood) {
    case "happy":
      both({ lb: 0.38, tile: 180 });
      bl.dy = br.dy = -3;
      break;
    case "surprised":
      both({ sx: 1.3, sy: 1.3 });
      pose.body.sx = 0.95;
      pose.body.sy = 1.07;
      bl.dy = br.dy = -8;
      break;
    case "sad":
      pose.gy = 0.45;
      Object.assign(l, { lt: 0.32, tilt: -16 });
      Object.assign(r, { lt: 0.32, tilt: 16 });
      Object.assign(bl, { rotate: -16, dy: -2 });
      Object.assign(br, { rotate: 16, dy: -2 });
      pose.body.sx = 1.04;
      pose.body.sy = 0.95;
      break;
    case "determined":
      Object.assign(l, { lt: 0.3, tilt: 18 });
      Object.assign(r, { lt: 0.3, tilt: -18 });
      Object.assign(bl, { rotate: 18, dy: 4 });
      Object.assign(br, { rotate: -18, dy: 4 });
      break;
    case "focused":
      both({ lt: 0.3, lb: 0.14 });
      bl.dy = br.dy = 3;
      break;
    case "skeptical":
      l.lt = 0.45;
      r.sx = r.sy = 1.12;
      bl.dy = 4;
      Object.assign(br, { dy: -7, rotate: -8 });
      pose.body.rotate = -5;
      break;
    case "wink":
      Object.assign(l, { lt: 0.44, lb: 0.44 });
      Object.assign(r, { lb: 0.34, tile: 180 });
      pose.body.rotate = -4;
      break;
  }
  return pose;
}

/** Moves `from` toward `to` by `k` (0 to 1), in place, and returns it. */
export function easePose(from: Pose, to: Pose, k: number): Pose {
  const mix = (a: number, b: number) => a + (b - a) * k;
  from.gx = mix(from.gx, to.gx);
  from.gy = mix(from.gy, to.gy);
  for (let i = 0; i < 2; i++) {
    const a = from.eyes[i];
    const b = to.eyes[i];
    a.lt = mix(a.lt, b.lt);
    a.lb = mix(a.lb, b.lb);
    a.tilt = mix(a.tilt, b.tilt);
    a.sx = mix(a.sx, b.sx);
    a.sy = mix(a.sy, b.sy);
    a.tile = mix(a.tile, b.tile);
    from.brows[i].dy = mix(from.brows[i].dy, to.brows[i].dy);
    from.brows[i].rotate = mix(from.brows[i].rotate, to.brows[i].rotate);
  }
  from.body.sx = mix(from.body.sx, to.body.sx);
  from.body.sy = mix(from.body.sy, to.body.sy);
  from.body.rotate = mix(from.body.rotate, to.body.rotate);
  return from;
}

export const clonePose = (pose: Pose): Pose => ({
  gx: pose.gx,
  gy: pose.gy,
  eyes: [{ ...pose.eyes[0] }, { ...pose.eyes[1] }],
  brows: [{ ...pose.brows[0] }, { ...pose.brows[1] }],
  body: { ...pose.body },
});

export interface Motion {
  /** The whole character floating: offset and squash. */
  float: { y: number; sx: number; sy: number };
  /** The body's own looping squash and lean, on top of the pose. */
  body: { sx: number; sy: number; rotate: number };
  /** The floor shadow's width. */
  shadow: number;
  /** Each eye's blink, 1 open. */
  blink: [number, number];
  /** Each tile eye's extra turn while thinking. */
  turn: [number, number];
  /** The face darting about while listening. */
  flick: { x: number; y: number };
  /** The speaking mouth's height, 0 to 1. */
  talk: number;
  /** The two z's of sleep. */
  z: [{ opacity: number; x: number; y: number }, { opacity: number; x: number; y: number }];
}

export interface MotionInput {
  state: MascotState;
  mood: MascotMood;
  tileEyes: boolean;
  personality: "calm" | "default" | "bouncy";
  level?: number;
  /** Seconds since the expression last changed; undefined before the first change. */
  sincePop?: number;
}

const POP = cubicBezier(0.3, 0, 0.3, 1);
const CLICK = cubicBezier(0.5, 0, 0.3, 1.5);

type Track = readonly (
  | readonly [number, number]
  | readonly [number, number, (x: number) => number]
)[];

/** A track of [offset, a, b] pairs, as two tracks. */
const pair = (
  p: number,
  stops: readonly (readonly [number, number, number])[],
  timing = easeInOut,
) => [
  keyframes(
    p,
    stops.map(([o, a]) => [o, a] as const),
    timing,
  ),
  keyframes(
    p,
    stops.map(([o, , b]) => [o, b] as const),
    timing,
  ),
];

/** The looping animations at `time` seconds. With reduce motion, call with time 0 and no pop. */
export function motionAt(input: MotionInput, time: number): Motion {
  const { state, mood, tileEyes, personality, level, sincePop } = input;
  const tempo = personality === "calm" ? 1.5 : personality === "bouncy" ? 0.75 : 1;
  const bounce = personality === "calm" ? 0.5 : personality === "bouncy" ? 1.7 : 1;
  const live = state === "speaking" && level !== undefined;

  // Float: the bob, slower while thinking or sad, a hop when happy, none asleep.
  let float = { y: 0, sx: 1, sy: 1 };
  if (mood === "happy") {
    const p = time / (1.4 * tempo);
    const y = keyframes(
      p,
      [
        [0, 0],
        [0.35, -12 * bounce],
        [0.6, 0],
        [0.75, 0],
        [1, 0],
      ],
      POP,
    );
    const [sx, sy] = pair(
      p,
      [
        [0, 1.04, 0.96],
        [0.35, 0.97, 1.04],
        [0.6, 1.06, 0.94],
        [0.75, 1, 1],
        [1, 1.04, 0.96],
      ],
      POP,
    );
    float = { y, sx, sy };
  } else if (state !== "sleeping") {
    const period = (mood === "sad" ? 5 : state === "thinking" ? 4.4 : 3.2) * tempo;
    float.y = keyframes(time / period, [
      [0, 0],
      [0.5, -5 * bounce],
      [1, 0],
    ]);
  }

  // Body: lean, talk or breathe; otherwise the squash after a change of expression.
  let body = { sx: 1, sy: 1, rotate: 0 };
  if (state === "listening") {
    const p = time / (2.4 * tempo);
    const rotate = keyframes(p, [
      [0, -4 * bounce],
      [0.5, -2 * bounce],
      [1, -4 * bounce],
    ]);
    const [sx, sy] = pair(p, [
      [0, 1.02, 0.98],
      [0.5, 0.99, 1.01],
      [1, 1.02, 0.98],
    ]);
    body = { sx, sy, rotate };
  } else if (live) {
    body = { sx: 1 - (level ?? 0) * 0.05 * bounce, sy: 1 + (level ?? 0) * 0.1 * bounce, rotate: 0 };
  } else if (state === "speaking") {
    const [sx, sy] = pair(time / (0.9 * tempo), [
      [0, 1, 1],
      [0.15, 1 - 0.04 * bounce, 1 + 0.07 * bounce],
      [0.3, 1.01, 0.99],
      [0.48, 1 - 0.03 * bounce, 1 + 0.05 * bounce],
      [0.62, 1, 1],
      [0.8, 1 - 0.05 * bounce, 1 + 0.08 * bounce],
      [1, 1, 1],
    ]);
    body = { sx, sy, rotate: 0 };
  } else if (state === "sleeping") {
    const [sx, sy] = pair(time / (3.6 * tempo), [
      [0, 1, 1],
      [0.5, 1.03, 0.96],
      [1, 1, 1],
    ]);
    body = { sx, sy, rotate: 0 };
  } else if (sincePop !== undefined && sincePop < 0.45 * tempo) {
    const [sx, sy] = pair(
      sincePop / (0.45 * tempo),
      [
        [0, 1, 1],
        [0.3, 1 + 0.07 * bounce, 1 - 0.08 * bounce],
        [0.65, 1 - 0.03 * bounce, 1 + 0.05 * bounce],
        [1, 1, 1],
      ],
      POP,
    );
    body = { sx, sy, rotate: 0 };
  }

  const shadow = keyframes(time / (3.2 * tempo), [
    [0, 1],
    [0.5, 1 - 0.12 * bounce],
    [1, 1],
  ]);

  // Blink, held off where the lids or the tiles are doing something else.
  const blinks = !(
    state === "sleeping" ||
    mood === "happy" ||
    mood === "wink" ||
    (state === "thinking" && tileEyes)
  );
  const blinkTrack: Track = [
    [0, 1],
    [0.93, 1],
    [0.955, 0.08],
    [1, 1],
  ];
  const blinkAt = (delay: number) =>
    blinks && time >= delay ? keyframes((time - delay) / (4.6 * tempo), blinkTrack) : 1;

  // The logo loader's click: a quarter turn with a little overshoot, four times round.
  const turnTrack: Track = [
    [0, 0],
    [0.1, 0, CLICK],
    [0.22, 90],
    [0.35, 90, CLICK],
    [0.47, 180],
    [0.6, 180, CLICK],
    [0.72, 270],
    [0.85, 270, CLICK],
    [0.97, 360],
    [1, 360],
  ];
  const turning = state === "thinking" && tileEyes;
  const turnAt = (delay: number) =>
    turning && time >= delay ? keyframes((time - delay) / (4.8 * tempo), turnTrack) : 0;

  // Listening: the face darts, holding each spot (steps(1, end)).
  let flick = { x: 0, y: 0 };
  if (state === "listening") {
    const p = (time / (3.4 * tempo)) % 1;
    flick =
      p < 0.22
        ? { x: 0, y: 0 }
        : p < 0.41
          ? { x: -3, y: 0 }
          : p < 0.63
            ? { x: 2, y: -1 }
            : p < 0.8
              ? { x: 0, y: 0 }
              : { x: 3, y: 1 };
  }

  const talk = live
    ? 0.25 + (level ?? 0) * 0.95
    : state === "speaking"
      ? keyframes(time / (0.9 * tempo), [
          [0, 0.3],
          [0.15, 1],
          [0.3, 0.3],
          [0.48, 0.7],
          [0.62, 0.3],
          [0.8, 1],
          [1, 0.3],
        ])
      : 0.35;

  const zAt = (delay: number) => {
    if (time < delay) return { opacity: 0, x: 0, y: 6 };
    const p = (time - delay) / 2.6;
    const q = easeInOut(((p % 1) + 1) % 1);
    return {
      opacity: keyframes(p, [
        [0, 0],
        [0.3, 1],
        [1, 0],
      ]),
      x: 10 * q,
      y: 6 - 20 * q,
    };
  };

  return {
    float,
    body,
    shadow,
    blink: [blinkAt(0), blinkAt(0.04)],
    turn: [turnAt(0), turnAt(0.12)],
    flick,
    talk,
    z: [zAt(0), zAt(1.3)],
  };
}
