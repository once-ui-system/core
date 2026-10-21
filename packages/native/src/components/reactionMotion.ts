/**
 * How a reaction moves when it plays: when someone picks it, when it is
 * pressed, and in the picker. Each one is a short, one-shot gesture that ends
 * where it began. The names, the emoji they fit and the keyframes match core's
 * `modules/social/reactionMotion.ts` and `Social.module.scss`.
 */
export type ReactionMotion =
  | "beat"
  | "nod"
  | "shake"
  | "pop"
  | "droop"
  | "flicker"
  | "spin"
  | "wave"
  | "bounce"
  | "none";

/** One reaction people can pick: a Unicode emoji, or the app's own image. */
export interface ReactionOption {
  /** What the reaction is stored as, such as "❤️" or "party-parrot". */
  value: string;
  /** Read out and shown in the picker's tooltip. Defaults to the emoji. */
  label?: string;
  /** The emoji to draw. Defaults to `value` when there is no `src`. */
  emoji?: string;
  /** An image instead of an emoji, such as an animated WebP, GIF or SVG. */
  src?: string;
  /** Its gesture. Known emoji get a fitting one; anything else bounces. */
  motion?: ReactionMotion;
}

const MOTIONS: Record<string, ReactionMotion> = {};
// Space-separated, so a joined emoji stays whole without Intl.Segmenter,
// which Hermes lacks.
const assign = (motion: ReactionMotion, emoji: string) => {
  for (const glyph of emoji.split(" ")) MOTIONS[glyph.replace(/\uFE0F/g, "")] = motion;
};
assign("beat", "❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💖 💗 💓 💕 💘 😍 🥰 😘 🫶");
assign("nod", "👍 👌 🙌 💯 ✅ ☑️ 🤝 🫡");
assign("shake", "😂 🤣 😆 😄 😁 😅 🤪 😜");
assign("pop", "😮 😯 😲 🤯 😱 😳 👀 ‼️ ❗");
assign("droop", "😢 😭 😞 😔 🥲 😿 💔 😩");
assign("flicker", "🔥 ⚡ 💥");
assign("spin", "🎉 🥳 ⭐ 🌟 ✨ 💫 🌀 🍀");
assign("wave", "👋 🤙 🙏 👏");

/** The gesture a reaction plays: its own `motion`, else one that suits the emoji. */
export function reactionMotion(option: Pick<ReactionOption, "value" | "emoji" | "src" | "motion">) {
  if (option.motion) return option.motion;
  if (option.src) return "bounce";
  const glyph = (option.emoji ?? option.value).replace(/\uFE0F/g, "");
  return MOTIONS[glyph] ?? "bounce";
}

/** The name screen readers hear and the picker shows. */
export const reactionLabel = (option: ReactionOption) =>
  option.label ?? option.emoji ?? option.value;

/** The six directions a burst flies out in, in degrees. Fixed, so renders match. */
export const BURST_ANGLES = [-75, -40, -8, 24, 58, 92] as const;

/**
 * One pose of a gesture, at `at` (0 to 1) of its run. Lengths are fractions of
 * the glyph's size, angles are degrees. The same keyframes as core's CSS.
 */
export interface ReactionPose {
  at: number;
  scaleX?: number;
  scaleY?: number;
  rotate?: number;
  translateX?: number;
  translateY?: number;
  skewX?: number;
}

export interface ReactionGesture {
  duration: number;
  /** Where it turns from, as fractions of the glyph: [x, y]. */
  origin: [number, number];
  poses: ReactionPose[];
}

const s = (at: number, scale: number, rest: Omit<ReactionPose, "at"> = {}): ReactionPose => ({
  at,
  scaleX: scale,
  scaleY: scale,
  ...rest,
});

export const REACTION_GESTURES: Record<Exclude<ReactionMotion, "none">, ReactionGesture> = {
  beat: {
    duration: 700,
    origin: [0.5, 0.5],
    poses: [s(0, 1), s(0.18, 1.32), s(0.34, 0.94), s(0.52, 1.16), s(0.72, 1), s(1, 1)],
  },
  nod: {
    duration: 700,
    origin: [0.3, 0.85],
    poses: [
      { at: 0 },
      { at: 0.25, rotate: -18, translateY: -0.12 },
      { at: 0.5, rotate: 6 },
      { at: 0.72, rotate: -8, translateY: -0.04 },
      { at: 1 },
    ],
  },
  shake: {
    duration: 700,
    origin: [0.5, 0.5],
    poses: [
      { at: 0 },
      { at: 0.15, rotate: -14, translateY: -0.08 },
      { at: 0.32, rotate: 12, translateY: -0.08 },
      { at: 0.49, rotate: -10, translateY: -0.04 },
      { at: 0.66, rotate: 8, translateY: -0.02 },
      { at: 0.83, rotate: -3 },
      { at: 1 },
    ],
  },
  pop: {
    duration: 700,
    origin: [0.5, 0.5],
    poses: [s(0, 1), s(0.22, 1.45, { translateY: -0.1 }), s(0.46, 0.9), s(0.68, 1.06), s(1, 1)],
  },
  droop: {
    duration: 900,
    origin: [0.5, 0.5],
    poses: [
      { at: 0 },
      { at: 0.3, translateY: 0.14, rotate: -6, scaleX: 1.04, scaleY: 0.92 },
      { at: 0.6, translateY: 0.1, rotate: 5, scaleX: 1.02, scaleY: 0.95 },
      { at: 1 },
    ],
  },
  flicker: {
    duration: 700,
    origin: [0.5, 1],
    poses: [
      { at: 0 },
      { at: 0.16, scaleX: 1.08, scaleY: 1.24, skewX: -5 },
      { at: 0.34, scaleX: 0.96, scaleY: 0.94, skewX: 4 },
      { at: 0.52, scaleX: 1.04, scaleY: 1.16, skewX: -3 },
      { at: 0.7, scaleY: 0.98, skewX: 2 },
      { at: 1 },
    ],
  },
  spin: {
    duration: 800,
    origin: [0.5, 0.5],
    poses: [s(0, 1), s(0.45, 1.3, { rotate: 200 }), s(1, 1, { rotate: 360 })],
  },
  wave: {
    duration: 900,
    origin: [0.7, 0.9],
    poses: [
      { at: 0 },
      { at: 0.14, rotate: 22 },
      { at: 0.28, rotate: -10 },
      { at: 0.42, rotate: 20 },
      { at: 0.56, rotate: -6 },
      { at: 0.7, rotate: 8 },
      { at: 1 },
    ],
  },
  bounce: {
    duration: 700,
    origin: [0.5, 0.5],
    poses: [
      s(0, 1),
      s(0.28, 1.08, { translateY: -0.28 }),
      { at: 0.52, scaleX: 1.06, scaleY: 0.9 },
      s(0.72, 1, { translateY: -0.1 }),
      s(1, 1),
    ],
  },
};

const NEUTRAL: Required<Omit<ReactionPose, "at">> = {
  scaleX: 1,
  scaleY: 1,
  rotate: 0,
  translateX: 0,
  translateY: 0,
  skewX: 0,
};

/** One property of a gesture across its poses, for `Animated.interpolate`. */
export function gestureTrack(gesture: ReactionGesture, key: keyof typeof NEUTRAL) {
  return {
    inputRange: gesture.poses.map((pose) => pose.at),
    outputRange: gesture.poses.map((pose) => pose[key] ?? NEUTRAL[key]),
  };
}
