import { View, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import type { Colors } from "../types";

export interface LineProps {
  /** Vertical, filling the parent's height. */
  vert?: boolean;
  background?: Colors;
  style?: ViewStyle;
  /** Finds the line in end-to-end tests. */
  testID?: string;
}

/** Core's `Line`: a 1px divider in `neutral-alpha-medium`. */
export function Line({ vert, background = "neutral-alpha-medium", style, testID }: LineProps) {
  const theme = useTheme();
  return (
    <View
      accessibilityRole="none"
      testID={testID}
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
