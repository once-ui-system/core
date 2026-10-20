import { Animated, Pressable } from "react-native";
import type { OnceTheme } from "../theme/theme";

/**
 * The dim behind a sheet, a drawer or a dialog. Core's `backdrop` token is a
 * light wash read through `backdrop-filter: blur`; phones have no backdrop
 * blur, so the scrim dims instead, as iOS and Android sheets do: black at
 * 60% on dark, 40% on light.
 */
export function scrimColor(theme: OnceTheme) {
  return theme.settings.theme === "light" ? "rgba(0, 0, 0, 0.4)" : "rgba(0, 0, 0, 0.6)";
}

/** A full-screen scrim that fades with `progress` (0 to 1) and closes on a tap. */
export function Scrim({
  theme,
  progress,
  onPress,
}: {
  theme: OnceTheme;
  progress: Animated.Value;
  /** Leave out when a tap on the scrim should do nothing. */
  onPress?: () => void;
}) {
  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: scrimColor(theme),
        opacity: progress,
      }}
    >
      <Pressable
        accessibilityLabel="Close"
        accessible={!!onPress}
        onPress={onPress}
        style={{ flex: 1 }}
      />
    </Animated.View>
  );
}
