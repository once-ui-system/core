import { forwardRef, type ReactNode } from "react";
import { View } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { type FlexProps, flexStyle } from "./Flex";
import type { RefComponent, ViewRef } from "./refs";
import { Text } from "./Text";

export interface KbdProps extends FlexProps {
  /** The key's name; `children` when it is not set, as in core. */
  label?: string;
  children?: ReactNode;
}

/**
 * Core's `Kbd`: a key on a keyboard, for a shortcut on a tablet or desktop.
 * A `View`, so in a sentence's `Text` it sits inline as a nested view.
 */
export const Kbd: RefComponent<KbdProps, ViewRef> = forwardRef<ViewRef, KbdProps>(function Kbd(
  { label, children, ...props },
  ref,
) {
  const theme = useTheme();
  const { style, rest, userStyle, hidden } = flexStyle(theme, {
    fit: true,
    horizontal: "center",
    vertical: "center",
    minWidth: "32",
    background: "neutral-strong",
    radius: "s",
    paddingX: "4",
    paddingY: "2",
    border: "neutral-strong",
    ...props,
  });
  if (hidden) return null;
  return (
    <View ref={ref} {...rest} style={[style, userStyle]}>
      <Text variant="label-default-s" onBackground="neutral-medium">
        {label || children}
      </Text>
    </View>
  );
});
