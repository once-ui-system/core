import { type IconMotionTrigger, iconMotions } from "../icons/motion.js";

/**
 * The motion a control gives the built-in icon it draws: an icon made to move
 * on hover (bell, arrows, refresh, eye, trash) moves while the control is
 * hovered or focused; given `selected`, an icon that follows a state (heart,
 * plus, chevrons, checkbox, menu) shows it. Any other icon stays still.
 */
export function controlIconMotion(
  name: string,
  selected?: boolean,
): { animate?: "hover"; active?: boolean } {
  const motion = (iconMotions as Partial<Record<string, IconMotionTrigger>>)[name];
  if (motion === "hover") return { animate: "hover" };
  if (motion === "active" && selected !== undefined) return { active: selected };
  return {};
}
