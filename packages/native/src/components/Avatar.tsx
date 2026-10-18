import { Image, View, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import type { TShirtSizes } from "../types";
import { Icon, type IconName } from "./Icon";
import { Skeleton } from "./Skeleton";
import type { Length } from "./spacing";
import { Text } from "./Text";

export interface AvatarProps {
  /**
   * A t-shirt size, a number of points (px, as in core 3.0: `40`), or a
   * `"40px"` / `"2.5rem"` string.
   */
  size?: TShirtSizes | number | Length;
  /** Initials shown when there is no image. */
  value?: string;
  src?: string;
  loading?: boolean;
  /** Shows the icon (`person` by default) instead of an image or initials. */
  empty?: boolean;
  /** The icon of an empty avatar, as in core. */
  icon?: IconName;
  /** A status dot; `scheme` is its palette hue, as in core 3.0 (2.x called it `color`). */
  statusIndicator?: { scheme: "green" | "yellow" | "red" | "gray" };
  style?: ViewStyle;
}

// Avatar.tsx sizeMapping, in px at 16px rem.
const SIZES: Record<TShirtSizes, number> = { xs: 20, s: 24, m: 32, l: 48, xl: 160 };
const TEXT = { xs: "s", s: "s", m: "m", l: "m", xl: "l" } as const;
const ICON = { xs: "xs", s: "xs", m: "s", l: "m", xl: "xl" } as const;
const STATUS = {
  green: "success-solid-medium",
  yellow: "warning-solid-medium",
  red: "danger-solid-medium",
  gray: "neutral-solid-medium",
} as const;

/** Core's `Avatar`: an image, or initials on a neutral circle. */
export function Avatar({
  size = "m",
  value,
  src,
  loading,
  empty,
  icon,
  statusIndicator,
  style,
}: AvatarProps) {
  const theme = useTheme();
  const scale = size in SIZES ? (size as TShirtSizes) : undefined;
  // A t-shirt size follows the device's rem, as core's classes do; a number is px.
  const px = scale ? (SIZES[scale] / 16) * theme.rem : theme.space(size as number | Length);
  const textSize = scale ? TEXT[scale] : "m";
  const isEmpty = empty || (!src && !value);

  if (loading) return <Skeleton shape="circle" width={px} height={px} style={style} />;

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={value ? `Avatar ${value}` : "Avatar"}
      style={[{ width: px, height: px }, style]}
    >
      <View
        style={{
          width: px,
          height: px,
          borderRadius: px / 2,
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.color("neutral-background-strong"),
          borderWidth: 1,
          borderColor: theme.color("neutral-alpha-weak"),
        }}
      >
        {isEmpty ? (
          <Icon
            name={icon ?? "person"}
            size={scale ? ICON[scale] : px >= 96 ? "xl" : px >= 40 ? "m" : "xs"}
            onBackground="neutral-medium"
          />
        ) : src ? (
          <Image source={{ uri: src }} style={{ width: px, height: px }} />
        ) : value ? (
          <Text textVariant={`label-default-${textSize}`} onBackground="neutral-weak">
            {value}
          </Text>
        ) : null}
      </View>
      {statusIndicator && (
        <View
          accessibilityLabel={`Status: ${statusIndicator.scheme}`}
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: Math.max(8, px / 4),
            height: Math.max(8, px / 4),
            borderRadius: 9999,
            borderWidth: 2,
            borderColor: theme.color("page-background"),
            backgroundColor: theme.color(STATUS[statusIndicator.scheme]),
          }}
        />
      )}
    </View>
  );
}
