import type { Insets } from "react-native";
import type { OnceTheme } from "../theme/theme";

/**
 * The `hitSlop` that makes a control `height` × `width` points take taps from
 * core's `--touch-target` (2.75rem, 44pt at 16pt rem) without drawing it larger,
 * as core's controls do on a touch screen. Undefined when it is already that big.
 */
export function touchSlop(theme: OnceTheme, height: number, width = height): Insets | undefined {
  const target = theme.px("touch-target") || 44;
  const y = Math.max(0, (target - height) / 2);
  const x = Math.max(0, (target - width) / 2);
  return x || y ? { top: y, bottom: y, left: x, right: x } : undefined;
}
