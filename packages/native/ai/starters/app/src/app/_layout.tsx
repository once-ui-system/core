import { ThemeProvider, ToastProvider, useTheme } from "@once-ui-system/native";
import { Stack } from "expo-router";
import type { ReactNode } from "react";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { style } from "../resources/once-ui.config";

// The providers, once, at the root. Fonts loaded with expo-font go to
// ThemeProvider as fonts={{ heading, body, label, code }}; without them the
// platform font is used.
function Themed({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider {...style} insets={useSafeAreaInsets()}>
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}

// Expo Router shows only the screens a layout declares. The page colour behind
// each screen keeps a dark app from flashing white between screens.
function Routes() {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background("page") },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Themed>
        <Routes />
      </Themed>
    </SafeAreaProvider>
  );
}
