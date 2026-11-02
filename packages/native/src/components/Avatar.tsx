import { Image, View, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import type { ColorScheme, TShirtSizes } from "../types";
import { Skeleton } from "./Skeleton";
import { Text } from "./Text";

export interface AvatarProps {
  /** A t-shirt size, or a number of rem as on the web. */
  size?: TShirtSizes | number;
  /** Initials shown when there is no image. */
  value?: string;
  src?: string;
  loading?: boolean;
  statusIndicator?: { color: "green" | "yellow" | "red" | "gray" };
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
  statusIndicator,
  ring,
  testID,
  style,
}: AvatarProps) {
  const theme = useTheme();
  const px = typeof size === "number" ? size * theme.rem : (SIZES[size] / 16) * theme.rem;
  const textSize = typeof size === "number" ? "m" : TEXT[size];
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
          {src ? (
            <Image source={{ uri: src }} style={{ width: px, height: px }} />
          ) : value ? (
            <Text variant={`label-default-${textSize}`} onBackground="neutral-weak">
              {value}
            </Text>
          ) : null}
        </View>
      </View>
      {statusIndicator && (
        <View
          accessibilityLabel={`Status: ${statusIndicator.color}`}
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: Math.max(8, px / 4),
            height: Math.max(8, px / 4),
            borderRadius: 9999,
            borderWidth: 2,
            borderColor: theme.color("page-background"),
            backgroundColor: theme.color(STATUS[statusIndicator.color]),
          }}
        />
      )}
    </View>
  );
}
