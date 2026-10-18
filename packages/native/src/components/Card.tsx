import { forwardRef, type ReactNode } from "react";
import { Pressable, View } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { type FlexProps, flexStyle, wrapText } from "./Flex";
import type { RefComponent, ViewRef } from "./refs";

export interface CardProps extends FlexProps {
  children?: ReactNode;
  /** Makes the card pressable. Core calls it `onClick`; both work. */
  onPress?: () => void;
  onClick?: () => void;
  /** Brand border and tint, for a picked item in a list or gallery. */
  selected?: boolean;
}

/** Core's `Card`: a surface with a neutral border and `l` radius, pressable when given a handler. */
export const Card: RefComponent<CardProps, ViewRef> = forwardRef<ViewRef, CardProps>(function Card(
  { onPress, onClick, selected, children, ...props },
  ref,
) {
  const theme = useTheme();
  const { style, rest, userStyle, hidden } = flexStyle(theme, {
    direction: "column",
    radius: "l",
    background: selected ? "brand-alpha-weak" : "surface",
    border: selected ? "brand-medium" : "neutral-medium",
    ...props,
  });
  if (hidden) return null;
  const handler = onPress ?? onClick;
  if (!handler) {
    return (
      <View ref={ref} {...rest} style={[style, userStyle]}>
        {wrapText(children)}
      </View>
    );
  }
  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      aria-selected={selected}
      onPress={handler}
      {...rest}
      style={({ pressed }) => [style, pressed && { opacity: 0.8 }, userStyle]}
    >
      {wrapText(children)}
    </Pressable>
  );
});
