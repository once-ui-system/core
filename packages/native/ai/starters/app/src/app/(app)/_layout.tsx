import { useTheme } from "@once-ui-system/native";
import { Tabs } from "expo-router";
import { TabBar } from "../../components/TabBar";
import { nav, tabHref } from "../../resources/app";

// Every route in this folder is a tab, or opens inside one. The tab bar is
// mounted here, once, so each tab keeps its screen and scroll position. A route
// outside the tabs (sign-in, onboarding) goes outside (app)/.
// Expo Router shows only the screens a layout declares: one per entry in nav.
export default function AppLayout() {
  const theme = useTheme();
  return (
    <Tabs
      tabBar={() => <TabBar />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: theme.background("page") },
      }}
    >
      {nav.map((entry) => {
        const name = tabHref(entry).slice(1);
        return <Tabs.Screen key={name} name={name} />;
      })}
    </Tabs>
  );
}
