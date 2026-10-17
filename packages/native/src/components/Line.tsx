import { View, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import type { Colors } from "../types";

export interface LineProps {
  /** Vertical, filling the parent's height. */
  vert?: boolean;
  background?: Colors;
  style?: ViewStyle;
}

/** Core's `Line`: a 1px divider in `neutral-alpha-medium`. */
export function Line({ vert, background = "neutral-alpha-medium", style }: LineProps) {
  const theme = useTheme();
  return (
    <View
      accessibilityRole="none"
      style={[
        vert
          ? { width: 1, alignSelf: "stretch", minHeight: "100%" }
          : { height: 1, alignSelf: "stretch", width: "100%" },
        { backgroundColor: theme.background(background) },
        style,
      ]}
    />
  );
}
