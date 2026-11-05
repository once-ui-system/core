import { forwardRef, type ReactNode, useContext } from "react";
import { Pressable, type PressableProps, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import type { RadiusSize, TShirtSizes } from "../types";
import { FlexDirectionContext } from "./Flex";
import { type IconSlot, renderIcon } from "./Icon";
import type { RefComponent, ViewRef } from "./refs";
import { Text } from "./Text";
import { touchSlop } from "./touch";

export interface ToggleButtonProps extends Omit<PressableProps, "children" | "style"> {
  label?: ReactNode;
  children?: ReactNode;
  selected?: boolean;
  variant?: "ghost" | "outline" | "subtle";
  size?: TShirtSizes;
  /** Corner roundness; defaults to the button's `size`, as in core. */
  radius?: RadiusSize;
  rounded?: boolean;
  horizontal?: "start" | "center" | "end" | "between";
  fillWidth?: boolean;
  weight?: "default" | "strong";
  truncate?: boolean;
  disabled?: boolean;
  /** An icon name as in core, or any element. */
  prefixIcon?: IconSlot;
  suffixIcon?: IconSlot;
  /** Core's name for `onPress`; both work. */
  onClick?: () => void;
  style?: ViewStyle;
}

// ToggleButton.module.scss: height and padding per size, in static spacing steps.
const SIZES = {
  xs: { height: "20", y: "2", x: "8" },
  s: { height: "24", y: "2", x: "8" },
  m: { height: "32", y: "4", x: "8" },
  l: { height: "40", y: "8", x: "16" },
  xl: { height: "48", y: "12", x: "20" },
} as const;

const JUSTIFY = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
} as const;

/** Core's `ToggleButton`: a quiet button that stays highlighted while `selected`. */
export const ToggleButton: RefComponent<ToggleButtonProps, ViewRef> = forwardRef<
  ViewRef,
  ToggleButtonProps
>(function ToggleButton(
  {
    label,
    children,
    selected = false,
    variant = "ghost",
    size = "m",
    radius,
    rounded = false,
    horizontal = "center",
    fillWidth = false,
    weight = "default",
    truncate: _truncate,
    disabled = false,
    prefixIcon,
    suffixIcon,
    onPress,
    onClick,
    style,
    ...rest
  },
  ref,
) {
  const theme = useTheme();
  const row = useContext(FlexDirectionContext) === "row";
  const dims = SIZES[size];
  const height = theme.space(dims.height);
  const iconSize = size === "xl" ? "m" : size === "l" ? "s" : "xs";
  const textSize = size === "xl" ? "l" : size === "l" ? "m" : "s";
  const labelX = size === "xl" ? "12" : size === "l" ? "8" : size === "s" ? "4" : "2";
  const color = theme.color(
    disabled ? "neutral-on-background-weak" : "neutral-on-background-strong",
  );

  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      aria-selected={selected}
      aria-disabled={disabled}
      disabled={disabled}
      hitSlop={touchSlop(theme, height, Number.POSITIVE_INFINITY)}
      onPress={onPress ?? (onClick ? () => onClick() : undefined)}
      {...rest}
      style={({ pressed }) => {
        // Pressed stands in for core's hover; `subtle` keeps its border clear throughout.
        const outlined =
          !disabled && (variant === "outline" || (variant === "ghost" && (selected || pressed)));
        const border = outlined ? theme.color("neutral-alpha-weak") : "transparent";
        const background = disabled
          ? theme.color("neutral-background-medium")
          : selected
            ? theme.color("neutral-alpha-medium")
            : pressed
              ? theme.color("neutral-alpha-weak")
              : "transparent";
        return [
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: JUSTIFY[horizontal],
            // As Button: an equal share of a row, the full width of a column.
            ...(fillWidth
              ? { width: "100%", flexShrink: 1, alignSelf: "stretch" }
              : row
                ? {}
                : { alignSelf: "flex-start" }),
            gap: theme.space("8"),
            height,
            minHeight: height,
            paddingVertical: theme.space(dims.y),
            paddingHorizontal: theme.space(dims.x),
            borderWidth: 1,
            borderColor: border,
            borderRadius: rounded ? 9999 : theme.radius(radius ?? size),
            backgroundColor: background,
          } satisfies ViewStyle,
          style,
        ];
      }}
    >
      {renderIcon(prefixIcon, iconSize, color)}
      {(label || children) && (
        <Text
          textVariant={`label-${weight}-${textSize}`}
          paddingX={labelX}
          // One line, as core's `white-space: nowrap`; `truncate` only adds the ellipsis there.
          numberOfLines={1}
          style={{ color, ...(fillWidth ? { flexShrink: 1 } : {}) }}
        >
          {label || children}
        </Text>
      )}
      {renderIcon(suffixIcon, iconSize, color)}
    </Pressable>
  );
});
