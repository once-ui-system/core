import type React from "react";
import { type ReactNode } from "react";
import { KbdCap } from "../internal/KbdCap.js";
import { KeyCombo } from "../internal/KeyCombo.js";
import type { Flex } from "./Flex.js";
import type { Row } from "./Row.js";

/** One keycap, its text as `children` (or `label`). */
interface KbdCapModeProps extends React.ComponentProps<typeof Flex> {
  keys?: undefined;
  /** The cap's text, in place of `children`. */
  label?: string;
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/** A shortcut (2.x's KeyTip): platform-aware caps for `keys`, after the action `label`. */
interface KbdKeysModeProps extends Omit<React.ComponentProps<typeof Row>, "children"> {
  /**
   * The shortcut, in the syntax `useHotkeys` takes: `"mod+k"`, `"shift+?"`,
   * `"g i"` for a sequence. An array lists alternatives. `mod` shows as ⌘ on
   * Apple platforms and Ctrl elsewhere; screen readers hear the combination
   * spelled out ("Command+Shift+Z"). Pass the same constant to `useHotkeys`
   * and the hint cannot drift from the binding.
   */
  keys: string | readonly string[];
  /** The action, shown before the keys: "Undo", "Search". */
  label?: ReactNode;
  children?: undefined;
}

type KbdProps = KbdCapModeProps | KbdKeysModeProps;

/**
 * A keycap, or with `keys` a whole shortcut drawn as caps beside the action it
 * performs. The cap form renders on the server; `keys` reads the platform
 * after hydration (Ctrl first, ⌘ on Apple right after).
 */
const Kbd = ({ ref, ...props }: KbdProps) => {
  if (props.keys !== undefined) {
    const { keys, label, ...rest } = props as KbdKeysModeProps;
    return <KeyCombo ref={ref} keys={keys} label={label} {...rest} />;
  }
  const { label, children, keys: _keys, ...rest } = props as KbdCapModeProps;
  return (
    <KbdCap ref={ref} {...rest}>
      {label || children}
    </KbdCap>
  );
};

Kbd.displayName = "Kbd";

export type { KbdProps };
export { Kbd };
