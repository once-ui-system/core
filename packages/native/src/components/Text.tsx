import { forwardRef } from "react";
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import type {
  ColorScheme,
  ColorWeight,
  TextSize,
  TextType,
  TextVariant,
  TextWeight,
} from "../types";
import type { RefComponent, TextRef } from "./refs";
import { type SpacingProps, spacingStyle, splitSpacing } from "./spacing";

export interface TextProps extends SpacingProps, Omit<RNTextProps, "style"> {
  /** `"body-default-m"`, `"heading-strong-l"`, … as in core. */
  variant?: TextVariant;
  /** Used when `variant` is not set, with `size` and `weight`. */
  family?: TextType;
  size?: TextSize;
  weight?: TextWeight;
  onBackground?: `${ColorScheme}-${ColorWeight}`;
  onSolid?: `${ColorScheme}-${ColorWeight}`;
  align?: "left" | "center" | "right" | "justify";
  /** One line, ending in an ellipsis. */
  truncate?: boolean;
  style?: TextStyle | TextStyle[];
}

export const Text: RefComponent<TextProps, TextRef> = forwardRef<TextRef, TextProps>(function Text(
  {
    variant,
    family = "body",
    size = "m",
    weight = "default",
    onBackground,
    onSolid,
    align,
    truncate,
    style,
    numberOfLines,
    children,
    ...rest
  },
  ref,
) {
  const theme = useTheme();
  const [spacing, other] = splitSpacing(rest);
  const color = onSolid
    ? theme.onSolid(onSolid)
    : theme.onBackground(onBackground ?? "neutral-strong");

  return (
    <RNText
      ref={ref}
      numberOfLines={truncate ? 1 : numberOfLines}
      {...other}
      style={[
        theme.text(variant ?? `${family}-${weight}-${size}`),
        { color, ...(align ? { textAlign: align } : {}) },
        spacingStyle(theme, spacing),
        style,
      ]}
    >
      {children}
    </RNText>
  );
});

export interface HeadingProps extends TextProps {}

/** Core's `Heading`: `heading-strong-l` by default, announced as a header. */
export const Heading: RefComponent<HeadingProps, TextRef> = forwardRef<TextRef, HeadingProps>(
  function Heading({ variant = "heading-strong-l", ...props }, ref) {
    return <Text ref={ref} accessibilityRole="header" variant={variant} {...props} />;
  },
);
