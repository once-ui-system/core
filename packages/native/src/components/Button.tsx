import { forwardRef, type ReactNode } from "react";
import { Pressable, type PressableProps, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import type { OnceTheme } from "../theme/theme";
import type { TShirtSizes } from "../types";
import { type IconSlot, renderIcon } from "./Icon";
import type { RefComponent, ViewRef } from "./refs";
import { Spinner } from "./Spinner";
import { Text } from "./Text";
import { touchSlop } from "./touch";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "quaternary"
  | "subtle"
  | "danger"
  | "success"
  | "warning"
  | "ghost"
  | "link";

export interface ButtonProps extends Omit<PressableProps, "children" | "style"> {
  variant?: ButtonVariant;
  size?: TShirtSizes;
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

/** Background, border and label colour per variant, resting and pressed. */
export function buttonColors(theme: OnceTheme, variant: ButtonVariant, pressed: boolean) {
  const c = theme.color;
  const solid = (scheme: "brand" | "danger" | "success" | "warning") => ({
    background: c(`${scheme}-solid-${pressed ? "strong" : "medium"}`),
    border:
      scheme === "brand"
        ? c("solid-border-color-brand")
        : scheme === "danger"
          ? c("solid-border-color-danger")
          : c(`${scheme}-alpha-strong`),
    borderWidth: theme.tokens["solid-border-width"] === "1px" ? 1 : 0,
    label: c(`${scheme}-on-solid-strong`),
  });
  switch (variant) {
    case "primary":
      return solid("brand");
    case "danger":
    case "success":
    case "warning":
      return solid(variant);
    case "secondary":
      return {
        background: pressed ? c("neutral-alpha-weak") : "transparent",
        border: c("neutral-alpha-weak"),
        borderWidth: 1,
        label: c("neutral-on-background-strong"),
      };
    case "tertiary":
      return {
        background: "transparent",
        border: pressed ? c("neutral-border-medium") : "transparent",
        borderWidth: 1,
        label: c("neutral-on-background-strong"),
      };
    case "subtle":
      return {
        background: pressed ? c("neutral-background-strong") : c("neutral-background-medium"),
        border: "transparent",
        borderWidth: 0,
        label: c("neutral-on-background-strong"),
      };
    case "quaternary":
      return {
        background: pressed ? c("neutral-background-medium") : "transparent",
        border: "transparent",
        borderWidth: 0,
        label: c(`neutral-on-background-${pressed ? "strong" : "medium"}`),
      };
    default:
      return {
        background: "transparent",
        border: "transparent",
        borderWidth: 0,
        label: c(`neutral-on-background-${pressed || variant === "link" ? "strong" : "medium"}`),
      };
  }
}

export const Button: RefComponent<ButtonProps, ViewRef> = forwardRef<ViewRef, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "m",
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
      style,
      ...rest
    },
    ref,
  ) {
    const theme = useTheme();
    const dims = SIZES[size];
    const radiusSize = size === "xs" ? "s" : size === "s" || size === "m" ? "m" : "l";
    const textSize = size === "xs" ? "s" : size === "xl" ? "l" : size;
    const inactive = disabled || loading;
    const iconSize = size === "xs" || size === "s" ? "xs" : "s";

    return (
      <Pressable
        ref={ref}
        accessibilityRole="button"
        aria-disabled={inactive}
        aria-busy={loading}
        disabled={inactive}
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
            : buttonColors(theme, variant, pressed);
          return [
            {
              flexDirection: "row",
              alignItems: "center",
              justifyContent: JUSTIFY[horizontal],
              // As core's `width: 100%`: full width in a column, an equal share in a row.
              ...(fillWidth
                ? { width: "100%", flexShrink: 1, alignSelf: "stretch" }
                : { alignSelf: "flex-start" }),
              height: theme.space(dims.height as "24"),
              minHeight: theme.space(dims.height as "24"),
              paddingHorizontal: theme.space(dims.x as "4"),
              paddingVertical: theme.space(dims.y as "2"),
              borderRadius: rounded ? 9999 : theme.radius(radiusSize),
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
            : buttonColors(theme, variant, pressed).label;
          return (
            <>
              {loading ? (
                <Spinner size={size === "xl" ? "l" : size} color={color} />
              ) : (
                renderIcon(prefixIcon, iconSize, color)
              )}
              {(label || children) && (
                <Text
                  paddingX="4"
                  variant={`label-${weight}-${textSize}`}
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
