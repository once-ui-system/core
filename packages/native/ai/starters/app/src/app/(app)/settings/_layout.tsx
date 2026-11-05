import { useTheme } from "@once-ui-system/native";
import { Stack } from "expo-router";

// The Settings tab is a stack: its list, and each page it opens on top.
// Expo Router shows only the screens a layout declares, so a new page in this
// folder gets a line here too.
export default function SettingsLayout() {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background("page") },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
