/**
 * How a reaction moves when it plays: on hover, when someone picks it, and in
 * the picker. Each one is a short, one-shot gesture that ends where it began.
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
