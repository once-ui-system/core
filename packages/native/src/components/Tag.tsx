import type { ReactNode } from "react";
import { Pressable, View, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import type { TextVariant, Tone, TShirtSizes } from "../types";
import { pressHandler } from "./Button";
import { Row } from "./Flex";
import { type IconSlot, renderIcon } from "./Icon";
import { IconButton, type IconButtonProps } from "./IconButton";
import { Text } from "./Text";
import { touchSlop } from "./touch";

/**
 * Core 3.0's `Tag`, which folds 2.x's Badge and Chip into it:
 *
 * - a static label, the 2.x Tag;
 * - `variant="announce"`, with `href` and `arrow`: the pill that announces
 *   something, usually as a link (2.x's Badge);
 * - `selected` or `onRemove`: a toggle and an optional remove button (2.x's
 *   Chip). An `onClick` without `selected` keeps the static look.
 */
export interface TagProps {
  /**
   * The palette. Defaults to `neutral` on a static tag and to `brand` on an
   * announcement and on a selected toggle. 2.x called this `scheme`.
   */
  tone?: Tone;
  /**
   * How the tag looks: `default`, `gradient` (2.x's `scheme="gradient"`; a
   * flat brand tint here, React Native draws no gradients) or `announce`, the
   * pill 2.x called Badge.
   */
  variant?: "default" | "gradient" | "announce";
  size?: TShirtSizes;
  label?: string;
  /** Icon names as in core, or any elements. */
  prefixIcon?: IconSlot;
  suffixIcon?: IconSlot;
  /** Makes the tag a link, opened with `Linking`. */
  href?: string;
  /** A chevron after the label, for a tag that leads somewhere. Defaults to true with `href`. */
  arrow?: boolean;
  /**
   * Core's shine on `announce`. Accepted so the same JSX works; the preview
   * draws no shine.
   */
  effect?: boolean;
  /** Makes the tag a toggle, pressed when true. Defaults to false (2.x's Chip defaulted to true). */
  selected?: boolean;
  /** Called on a press; with `selected`, the tag is a toggle. */
  onClick?: () => void;
  /** React Native's name for `onClick`; `onPress` wins. */
  onPress?: () => void;
  /** Adds a remove button. Removing is never a press on the tag. */
  onRemove?: () => void;
  /** Props for the remove button, such as its `aria-label`. 2.x's Chip `iconButtonProps`. */
  removeButtonProps?: Partial<IconButtonProps>;
  textVariant?: TextVariant;
  children?: ReactNode;
  style?: ViewStyle;
}

/** Padding, text and icon per size and look. s, m and l are 2.x's Tag; announce m is 2.x's Badge. */
const LOOK = {
  default: {
    paddingX: { xs: "4", s: "8", m: "8", l: "12", xl: "16" },
    paddingY: { xs: "0", s: "1", m: "2", l: "4", xl: "8" },
    text: {
      xs: "label-default-xs",
      s: "label-default-s",
      m: "label-default-s",
      l: "label-default-s",
      xl: "label-default-m",
    },
    icon: { xs: "xs", s: "xs", m: "xs", l: "xs", xl: "s" },
  },
  announce: {
    paddingX: { xs: "8", s: "12", m: "20", l: "24", xl: "32" },
    paddingY: { xs: "4", s: "8", m: "12", l: "16", xl: "20" },
    text: {
      xs: "label-strong-xs",
      s: "label-strong-s",
      m: "label-strong-s",
      l: "label-strong-m",
      xl: "label-strong-l",
    },
    icon: { xs: "xs", s: "xs", m: "s", l: "s", xl: "m" },
  },
  // The toggle (core's InteractiveTag): m is 2.x's Chip.
  toggle: {
    paddingX: { xs: "2", s: "4", m: "8", l: "12", xl: "16" },
    paddingY: { xs: "0", s: "2", m: "4", l: "8", xl: "12" },
    text: {
      xs: "body-default-xs",
      s: "body-default-s",
      m: "body-default-s",
      l: "body-default-m",
      xl: "body-default-l",
    },
    icon: { xs: "xs", s: "xs", m: "s", l: "s", xl: "m" },
  },
} as const;

/** Core's `Tag`: a label, an announcement pill, or a toggle with an optional remove button. */
export function Tag({
  tone,
  variant = "default",
  size = "m",
  label,
  prefixIcon,
  suffixIcon,
  href,
  arrow: arrowProp,
  effect: _effect,
  selected,
  onClick,
  onPress,
  onRemove,
  removeButtonProps,
  textVariant,
  children,
  style,
}: TagProps) {
  const theme = useTheme();
  const handler = pressHandler(onPress, onClick, href);
  const text = label || children;

  if (!href && (selected !== undefined || onRemove)) {
    // A tag with only a remove button is a label, not a toggle.
    const toggles = selected !== undefined || handler !== undefined;
    const on = selected ?? false;
    const palette = tone ?? "brand";
    const look = LOOK.toggle;
    const body = (pressed: boolean) => {
      const color = theme.onBackground(
        on ? `${palette}-${pressed ? "weak" : "medium"}` : "neutral-medium",
      );
      return (
        <Row
          gap="2"
          vertical="center"
          radius="full"
          paddingX={look.paddingX[size]}
          paddingY={look.paddingY[size]}
          style={{
            backgroundColor: theme.color(
              on
                ? `${palette}-alpha-${pressed ? "weak" : "medium"}`
                : `neutral-alpha-${pressed ? "medium" : "weak"}`,
            ),
          }}
        >
          {renderIcon(prefixIcon, look.icon[size], color)}
          <Row paddingX="8" paddingY="2">
            <Text textVariant={textVariant ?? look.text[size]} style={{ color }} numberOfLines={1}>
              {text}
            </Text>
          </Row>
          {renderIcon(suffixIcon, look.icon[size], color)}
          {onRemove && (
            <IconButton
              icon="close"
              variant="ghost"
              size={look.icon[size]}
              aria-label={typeof label === "string" && label ? `Remove ${label}` : "Remove"}
              {...removeButtonProps}
              onPress={(e) => {
                onRemove();
                removeButtonProps?.onPress?.(e);
              }}
            />
          )}
        </Row>
      );
    };
    const box = [{ alignSelf: "flex-start" as const }, style];
    if (!toggles) return <View style={box}>{body(false)}</View>;
    return (
      <Pressable
        accessibilityRole="button"
        aria-selected={on}
        onPress={handler}
        hitSlop={touchSlop(theme, theme.space("32"), Number.POSITIVE_INFINITY)}
        style={box}
      >
        {({ pressed }) => body(pressed)}
      </Pressable>
    );
  }

  const announce = variant === "announce";
  const gradient = variant === "gradient";
  const look = LOOK[announce ? "announce" : "default"];
  const palette = tone ?? (announce || gradient ? "brand" : "neutral");
  const arrow = arrowProp ?? href !== undefined;
  const color = theme.onBackground(announce ? `${palette}-strong` : `${palette}-medium`);

  const pill = (pressed: boolean) => (
    <Row
      gap={announce ? "8" : "4"}
      vertical="center"
      radius={announce ? "full" : "s"}
      background={
        announce
          ? pressed
            ? "neutral-medium"
            : "neutral-weak"
          : gradient
            ? "brand-strong"
            : pressed
              ? `${palette}-medium`
              : `${palette}-weak`
      }
      border={gradient ? "brand-medium" : `${palette}-alpha-medium`}
      paddingX={look.paddingX[size]}
      paddingY={look.paddingY[size]}
    >
      {renderIcon(
        prefixIcon,
        look.icon[size],
        announce ? theme.onBackground(`${palette}-medium`) : color,
      )}
      <Text
        textVariant={textVariant ?? look.text[size]}
        style={{ color }}
        numberOfLines={announce ? undefined : 1}
      >
        {text}
      </Text>
      {renderIcon(suffixIcon, look.icon[size], color)}
      {arrow && renderIcon("chevronRight", "xs", color)}
    </Row>
  );

  const box = [{ alignSelf: "flex-start" as const }, style];
  if (!handler) return <View style={box}>{pill(false)}</View>;
  return (
    <Pressable
      accessibilityRole={href && !onPress && !onClick ? "link" : "button"}
      onPress={handler}
      hitSlop={touchSlop(theme, theme.space("32"), Number.POSITIVE_INFINITY)}
      style={box}
    >
      {({ pressed }) => pill(pressed)}
    </Pressable>
  );
}
