import { forwardRef, type ReactNode } from "react";
import { Pressable, type PressableProps, View, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import type { ColorScheme, ColorWeight, TShirtSizes } from "../types";
import { type ButtonVariant, buttonColors } from "./Button";
import { Icon, type IconName } from "./Icon";
import type { RefComponent, ViewRef } from "./refs";
import { Spinner } from "./Spinner";
import { touchSlop } from "./touch";

export interface IconButtonProps extends Omit<PressableProps, "children" | "style"> {
  icon?: IconName;
  size?: TShirtSizes;
  variant?: ButtonVariant;
  rounded?: boolean;
  loading?: boolean;
  disabled?: boolean;
  /** Icon colour; defaults to the variant's label colour. */
  color?: `${ColorScheme}-${ColorWeight}`;
  /** The button's accessible name. Core also reads a plain-text `tooltip`; there is no hover here, so it only names the button. */
  ariaLabel?: string;
  tooltip?: string;
  children?: ReactNode;
  style?: ViewStyle;
}

// IconButton.module.scss: a square per size, in static spacing steps.
const SIZES = { xs: "20", s: "24", m: "32", l: "40", xl: "48" } as const;

/** Core's `IconButton`: a square button holding one icon. */
export const IconButton: RefComponent<IconButtonProps, ViewRef> = forwardRef<
  ViewRef,
  IconButtonProps
>(function IconButton(
  {
    icon = "refresh",
    size = "m",
    variant = "primary",
    rounded = false,
    loading = false,
    disabled = false,
    color,
    ariaLabel,
    tooltip,
    children,
    style,
    ...rest
  },
  ref,
) {
  const theme = useTheme();
  const side = theme.space(SIZES[size]);
  const radiusSize = size === "s" || size === "m" ? "m" : "l";
  const name = ariaLabel ?? tooltip;
  if (!name && !children) {
    console.warn(`IconButton (icon "${icon}") has no accessible name. Give it an ariaLabel.`);
  }

  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel={name}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      disabled={disabled || loading}
      hitSlop={touchSlop(theme, side)}
      {...rest}
      style={({ pressed }) => {
        const colors = buttonColors(theme, variant, pressed);
        return [
          {
            width: side,
            height: side,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: rounded ? 9999 : theme.radius(radiusSize),
            backgroundColor: disabled
              ? theme.color("neutral-background-medium")
              : colors.background,
            borderColor: disabled ? "transparent" : colors.border,
            borderWidth: disabled ? 0 : colors.borderWidth,
          } satisfies ViewStyle,
          style,
        ];
      }}
    >
      {({ pressed }) => {
        const fill = disabled
          ? theme.color("neutral-on-background-weak")
          : color
            ? theme.onBackground(color)
            : buttonColors(theme, variant, pressed).label;
        return (
          <View>
            {loading ? (
              <Spinner size={size === "l" ? "s" : "xs"} color={fill} />
            ) : children ? (
              children
            ) : (
              <Icon name={icon} size="s" color={fill} />
            )}
          </View>
        );
      }}
    </Pressable>
  );
});
