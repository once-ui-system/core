import { forwardRef, type ReactNode } from "react";
import { Linking, Pressable, type PressableProps, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import type { OnceTheme } from "../theme/theme";
import type { Tone, TShirtSizes } from "../types";
import { type IconSlot, renderIcon } from "./Icon";
import type { RefComponent, ViewRef } from "./refs";
import { Spinner } from "./Spinner";
import { Text } from "./Text";
import { touchSlop } from "./touch";

/**
 * How a button looks, as in core 3.0. The palette it draws in is `tone`;
 * 2.x's `danger`/`success`/`warning` variants are `tone`, and `quaternary`
 * is `ghost`.
 */
export type ButtonVariant = "primary" | "secondary" | "tertiary" | "ghost" | "link" | "subtle";

/** Which corners a button rounds, as core's `corners`; the rest are square. */
export type ButtonCorners =
  | "none"
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "top-left"
  | "top-right"
  | "bottom-right"
  | "bottom-left";

export interface ButtonProps extends Omit<PressableProps, "children" | "style"> {
  /** How the button looks. The palette it draws in is `tone`. */
  variant?: ButtonVariant;
  /**
   * Which palette the button draws in: the solid fill of a `primary` button,
   * the label and icons of the others. Defaults to `brand` on `primary` and
   * `neutral` on the rest, as in core.
   */
  tone?: Tone;
  size?: TShirtSizes;
  /** Rounds only these corners; `"none"` squares them all. */
  corners?: ButtonCorners;
  label?: string;
  children?: ReactNode;
  weight?: "default" | "strong";
  rounded?: boolean;
  /** An icon name as in core (`"arrowRight"`), or any element. */
  prefixIcon?: IconSlot;
  suffixIcon?: IconSlot;
  loading?: boolean;
  disabled?: boolean;
  fillWidth?: boolean;
  horizontal?: "start" | "center" | "end" | "between";
  /** Core's name for `onPress`, so the same JSX works on both; `onPress` wins. */
  onClick?: () => void;
  /** Opens this URL with `Linking`, as core's `href` makes the button a link. */
  href?: string;
  style?: ViewStyle;
}

// Button.module.scss: height and padding per size.
const SIZES: Record<TShirtSizes, { height: string; x: string; y: string }> = {
  xs: { height: "24", x: "4", y: "2" },
  s: { height: "32", x: "8", y: "4" },
  m: { height: "40", x: "12", y: "8" },
  l: { height: "48", x: "20", y: "12" },
  xl: { height: "56", x: "24", y: "16" },
};

const JUSTIFY = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
} as const;

/** The tone a variant draws in when none is given: core's `defaultButtonTone`. */
export const defaultButtonTone = (variant: ButtonVariant): Tone =>
  variant === "primary" ? "brand" : "neutral";

// The tones with their own solid border tokens; the others draw it with their strong alpha.
const SOLID_BORDER = new Set<Tone>(["brand", "danger", "neutral"]);

/**
 * Background, border and label colour per variant and tone, resting and
 * pressed: Button.module.scss's tone classes, with pressed standing in for hover.
 */
export function buttonColors(
  theme: OnceTheme,
  variant: ButtonVariant,
  pressed: boolean,
  tone: Tone = defaultButtonTone(variant),
) {
  const c = theme.color;
  const onBackground = c(`${tone}-on-background-strong`);
  switch (variant) {
    case "primary":
      return {
        background: c(`${tone}-solid-${pressed ? "strong" : "medium"}`),
        border: SOLID_BORDER.has(tone)
          ? c(`solid-border-color-${tone}`)
          : c(`${tone}-alpha-strong`),
        borderWidth: theme.tokens["solid-border-width"] === "1px" ? 1 : 0,
        label: c(`${tone}-on-solid-strong`),
      };
    case "secondary":
      return {
        background: pressed ? c("neutral-alpha-weak") : "transparent",
        border: c("neutral-alpha-weak"),
        borderWidth: 1,
        label: onBackground,
      };
    case "tertiary":
      return {
        background: "transparent",
        border: pressed ? c("neutral-border-medium") : "transparent",
        borderWidth: 1,
        label: onBackground,
      };
    case "subtle":
      return {
        background: pressed ? c("neutral-background-strong") : c("neutral-background-medium"),
        border: "transparent",
        borderWidth: 0,
        label: onBackground,
      };
    case "link":
      return {
        background: "transparent",
        border: "transparent",
        borderWidth: 0,
        label: onBackground,
      };
    default:
      // ghost: the medium label, strong while pressed (core's hover).
      return {
        background: "transparent",
        border: "transparent",
        borderWidth: 0,
        label: pressed ? onBackground : c(`${tone}-on-background-medium`),
      };
  }
}

/** `borderRadius` per corner for core's `corners`. */
export function cornerRadius(radius: number, corners?: ButtonCorners): ViewStyle {
  if (!corners) return { borderRadius: radius };
  if (corners === "none") return { borderRadius: 0 };
  const on = (...names: ButtonCorners[]) => (names.includes(corners) ? radius : 0);
  return {
    borderTopLeftRadius: on("top", "left", "top-left"),
    borderTopRightRadius: on("top", "right", "top-right"),
    borderBottomRightRadius: on("bottom", "right", "bottom-right"),
    borderBottomLeftRadius: on("bottom", "left", "bottom-left"),
  };
}

/** `onPress`, else core's `onClick`, else opening `href`. */
export function pressHandler(
  onPress: PressableProps["onPress"],
  onClick?: () => void,
  href?: string,
): PressableProps["onPress"] {
  if (onPress) return onPress;
  if (onClick) return () => onClick();
  if (href) return () => void Linking.openURL(href).catch(() => {});
  return undefined;
}

export const Button: RefComponent<ButtonProps, ViewRef> = forwardRef<ViewRef, ButtonProps>(
  function Button(
    {
      variant = "primary",
      tone,
      size = "m",
      corners,
      label,
      children,
      weight = "strong",
      rounded,
      prefixIcon,
      suffixIcon,
      loading = false,
      disabled = false,
      fillWidth = false,
      horizontal = "center",
      onPress,
      onClick,
      href,
      style,
      ...rest
    },
    ref,
  ) {
    const theme = useTheme();
    const dims = SIZES[size];
    const radiusSize = size === "xs" ? "s" : size === "s" || size === "m" ? "m" : "l";
    const inactive = disabled || loading;
    const iconSize = size === "xs" || size === "s" ? "xs" : "s";

    return (
      <Pressable
        ref={ref}
        accessibilityRole={href && !onPress && !onClick ? "link" : "button"}
        aria-disabled={inactive}
        aria-busy={loading}
        disabled={inactive}
        onPress={pressHandler(onPress, onClick, href)}
        hitSlop={touchSlop(theme, theme.space(dims.height as "24"), Number.POSITIVE_INFINITY)}
        {...rest}
        style={({ pressed }) => {
          const colors = disabled
            ? {
                background: theme.color("neutral-background-medium"),
                border: "transparent",
                borderWidth: 0,
                label: theme.color("neutral-on-background-weak"),
              }
            : buttonColors(theme, variant, pressed, tone);
          return [
            {
              flexDirection: "row",
              alignItems: "center",
              justifyContent: JUSTIFY[horizontal],
              alignSelf: fillWidth ? "stretch" : "flex-start",
              height: theme.space(dims.height as "24"),
              minHeight: theme.space(dims.height as "24"),
              paddingHorizontal: theme.space(dims.x as "4"),
              paddingVertical: theme.space(dims.y as "2"),
              ...cornerRadius(rounded ? 9999 : theme.radius(radiusSize), corners),
              backgroundColor: colors.background,
              borderColor: colors.border,
              borderWidth: colors.borderWidth,
            } satisfies ViewStyle,
            style,
          ];
        }}
      >
        {({ pressed }) => {
          const color = disabled
            ? theme.color("neutral-on-background-weak")
            : buttonColors(theme, variant, pressed, tone).label;
          return (
            <>
              {loading ? (
                <Spinner size={size} color={color} />
              ) : (
                renderIcon(prefixIcon, iconSize, color)
              )}
              {(label || children) && (
                <Text
                  paddingX="4"
                  textVariant={`label-${weight}-${size}`}
                  style={{
                    color,
                    ...(variant === "link" ? { textDecorationLine: "underline" } : {}),
                  }}
                  numberOfLines={1}
                >
                  {label || children}
                </Text>
              )}
              {renderIcon(suffixIcon, iconSize, color)}
            </>
          );
        }}
      </Pressable>
    );
  },
);
