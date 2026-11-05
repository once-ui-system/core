import { Image, View, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import type { ColorScheme, Schemes, Tone, TShirtSizes } from "../types";
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
  /**
   * A dot in the corner, as core 3.0: `scheme` takes any hue StatusIndicator
   * takes, `tone` a colour that follows the theme (`"success"`).
   */
  statusIndicator?:
    | { scheme: Schemes | "gray"; tone?: undefined }
    | { tone: Tone; scheme?: undefined };
  /**
   * A coloured ring around the avatar, with a gap of page background between,
   * as for a story or a live state. `true` is the brand colour; a scheme
   * (`"accent"`, `"success"`...) picks another. The avatar grows by the ring's width.
   */
  ring?: boolean | ColorScheme;
  /** For tests and tools such as Maestro, on the avatar's outer view. */
  testID?: string;
  style?: ViewStyle;
}

// Avatar.tsx sizeMapping, in px at 16px rem.
const SIZES: Record<TShirtSizes, number> = { xs: 20, s: 24, m: 32, l: 48, xl: 160 };
const TEXT = { xs: "s", s: "s", m: "m", l: "m", xl: "l" } as const;
const ICON = { xs: "xs", s: "xs", m: "s", l: "m", xl: "xl" } as const;
const STATUS: Record<string, string> = {
  green: "success-solid-medium",
  yellow: "warning-solid-medium",
  red: "danger-solid-medium",
  gray: "neutral-solid-medium",
};

/** The 2.x hues keep their solid colours; any other hue is its scheme's 700, as StatusIndicator. */
const statusColor = (s: { scheme?: Schemes | "gray"; tone?: Tone }) =>
  s.tone ? `function-${s.tone}-700` : (STATUS[s.scheme ?? "gray"] ?? `scheme-${s.scheme}-700`);

/** Core's `Avatar`: an image, or initials on a neutral circle. */
export function Avatar({
  size = "m",
  value,
  src,
  loading,
  empty,
  icon,
  statusIndicator,
  ring,
  testID,
  style,
}: AvatarProps) {
  const theme = useTheme();
  const scale = size in SIZES ? (size as TShirtSizes) : undefined;
  // A t-shirt size follows the device's rem, as core's classes do; a number is px.
  const px = scale ? (SIZES[scale] / 16) * theme.rem : theme.space(size as number | Length);
  const textSize = scale ? TEXT[scale] : "m";
  const isEmpty = empty || (!src && !value);
  // The ring and its gap each take a sixteenth of the avatar, two points at the least.
  const band = ring ? Math.max(2, Math.round(px / 16)) : 0;
  const outer = px + band * 4;

  if (loading)
    return (
      <Skeleton testID={testID} shape="circle" style={[{ width: outer, height: outer }, style]} />
    );

  return (
    <View
      // One element for screen readers, read out by its label.
      accessible
      accessibilityRole="image"
      accessibilityLabel={value ? `Avatar ${value}` : "Avatar"}
      testID={testID}
      style={[{ width: outer, height: outer }, style]}
    >
      <View
        style={{
          width: outer,
          height: outer,
          borderRadius: outer / 2,
          padding: band,
          borderWidth: band,
          borderColor: ring
            ? theme.color(`${ring === true ? "brand" : ring}-solid-medium`)
            : "transparent",
        }}
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
      </View>
      {statusIndicator && (
        <View
          accessibilityLabel={`Status: ${statusIndicator.tone ?? statusIndicator.scheme}`}
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: Math.max(8, px / 4),
            height: Math.max(8, px / 4),
            borderRadius: 9999,
            borderWidth: 2,
            borderColor: theme.color("page-background"),
            backgroundColor: theme.color(statusColor(statusIndicator)),
          }}
        />
      )}
    </View>
  );
}
