import { forwardRef, type ReactNode } from "react";
import { Pressable, type PressableProps, View, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import type { Tone, TShirtSizes } from "../types";
import {
  type ButtonCorners,
  type ButtonVariant,
  buttonColors,
  cornerRadius,
  pressHandler,
} from "./Button";
import { Icon, type IconName } from "./Icon";
import type { RefComponent, ViewRef } from "./refs";
import { Spinner } from "./Spinner";
import { touchSlop } from "./touch";

export interface IconButtonProps extends Omit<PressableProps, "children" | "style"> {
  icon?: IconName;
  size?: TShirtSizes;
  /** How the button looks. The palette it draws in is `tone`. */
  variant?: ButtonVariant;
  /**
   * Which palette the button draws in: the solid fill of a `primary` button,
   * the icon of the others. Defaults to `brand` on `primary` and `neutral` on
   * the rest, as in core 3.0 (2.x's `variant="danger"` is `tone="danger"`).
   * For an icon in a colour of its own, pass an `<Icon onBackground="…">` as
   * the children, as core 3.0 does for 2.x's `color`.
   */
  tone?: Tone;
  /** Rounds only these corners; `"none"` squares them all. */
  corners?: ButtonCorners;
  rounded?: boolean;
  loading?: boolean;
  disabled?: boolean;
  /**
   * The button's accessible name, as core's `aria-label`; mapped to
   * `accessibilityLabel`. Core 3.0 removed `ariaLabel`.
   */
  "aria-label"?: string;
  /** Core also reads a plain-text `tooltip`; there is no hover here, so it only names the button. */
  tooltip?: ReactNode;
  /** Accepted for core's JSX; there is no tooltip to place on a touch screen. */
  tooltipPosition?: "top" | "bottom" | "left" | "right";
  /** Core's name for `onPress`, so the same JSX works on both; `onPress` wins. */
  onClick?: () => void;
  /** Opens this URL with `Linking`, as core's `href` makes the button a link. */
  href?: string;
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
    size: sizeProp,
    variant = "primary",
    tone,
    corners,
    rounded = false,
    loading = false,
    disabled = false,
    "aria-label": ariaLabel,
    tooltip,
    tooltipPosition: _tooltipPosition,
    onPress,
    onClick,
    href,
    children,
    style,
    ...rest
  },
  ref,
) {
  const theme = useTheme();
  // Left out, the theme's density picks it.
  const size = sizeProp ?? theme.controlSize;
  const side = theme.space(SIZES[size]);
  const radiusSize = size === "s" || size === "m" ? "m" : "l";
  // As in core: the name is what the caller wrote for people, never the icon key.
  const name = ariaLabel ?? (typeof tooltip === "string" ? tooltip : undefined);
  if (!name && !children && !rest.accessibilityLabel && !rest["aria-labelledby"]) {
    console.warn(`IconButton (icon "${icon}") has no accessible name. Give it an aria-label.`);
  }

  return (
    <Pressable
      ref={ref}
      accessibilityRole={href && !onPress && !onClick ? "link" : "button"}
      accessibilityLabel={name}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      disabled={disabled || loading}
      onPress={pressHandler(onPress, onClick, href)}
      hitSlop={touchSlop(theme, side)}
      {...rest}
      style={({ pressed }) => {
        const colors = buttonColors(theme, variant, pressed, tone);
        return [
          {
            width: side,
            height: side,
            alignItems: "center",
            justifyContent: "center",
            ...cornerRadius(rounded ? 9999 : theme.radius(radiusSize), corners),
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
          : buttonColors(theme, variant, pressed, tone).label;
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
