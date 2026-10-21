import { forwardRef } from "react";
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import type { ColorScheme, ColorWeight, TextType, TextVariant, TextWeight } from "../types";
import type { RefComponent, TextRef } from "./refs";
import { type SpacingProps, spacingStyle, splitSpacing } from "./spacing";

export interface TextProps extends SpacingProps, Omit<RNTextProps, "style"> {
  /**
   * The typography preset, `${family}-${weight}-${size}` (`"body-default-m"`,
   * `"heading-strong-l"`), as in core 3.0 (2.x and the first native preview
   * called it `variant`). Defaults to `body-default-m`; React Native text
   * inherits nothing from the views around it.
   */
  textVariant?: TextVariant;
  /** Swaps the preset's family and keeps its size and weight, as in core. */
  family?: TextType;
  /** Swaps the preset's weight and keeps the rest, as in core. */
  weight?: TextWeight;
  onBackground?: `${ColorScheme}-${ColorWeight}`;
  onSolid?: `${ColorScheme}-${ColorWeight}`;
  align?: "left" | "center" | "right" | "justify";
  /** One line, ending in an ellipsis. */
  truncate?: boolean;
  style?: TextStyle | TextStyle[];
}

/** A preset with its family and weight swapped, as core's `family` and `weight` classes do. */
export function withOverrides(
  textVariant: TextVariant,
  family?: TextType,
  weight?: TextWeight,
): TextVariant {
  if (!family && !weight) return textVariant;
  const parts = textVariant.split("-");
  const size = parts.pop() as string;
  const presetWeight = parts.pop() as string;
  return `${family ?? parts.join("-")}-${weight ?? presetWeight}-${size}` as TextVariant;
}

export const Text: RefComponent<TextProps, TextRef> = forwardRef<TextRef, TextProps>(function Text(
  {
    textVariant = "body-default-m",
    family,
    weight,
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
        theme.text(withOverrides(textVariant, family, weight)),
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
  function Heading({ textVariant = "heading-strong-l", ...props }, ref) {
    return <Text ref={ref} accessibilityRole="header" textVariant={textVariant} {...props} />;
  },
);
