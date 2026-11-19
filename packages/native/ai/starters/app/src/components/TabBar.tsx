import { Card, Column, Icon, Line, Row, Text, useToast } from "@once-ui-system/native";
import { router, usePathname } from "expo-router";
import { nav, tabHref } from "../resources/app";

/**
 * The bottom tab bar, one tab per top-level entry in resources/app.ts. It sits on
 * the home indicator, so it takes the bottom safe area. Mounted once by
 * app/(app)/_layout.tsx; edit resources/app.ts to change the tabs.
 */
export function TabBar() {
  const pathname = usePathname();
  const { setBottomOffset } = useToast();
  return (
    // Toasts stack above the bar instead of over it.
    <Column background="surface" onLayout={(e) => setBottomOffset(e.nativeEvent.layout.height)}>
      <Line />
      <Row paddingX="8" paddingTop="8" gap="4" safeArea={["bottom"]}>
        {nav.map((entry) => {
          const href = tabHref(entry);
          const selected = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Card
              key={href}
              flex={1}
              center
              gap="2"
              paddingY="4"
              radius="m"
              border="transparent"
              background="transparent"
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              testID={`tab-${href.slice(1)}`}
              onPress={() => router.navigate(href as never)}
            >
              <Icon
                name={entry.icon ?? "home"}
                onBackground={selected ? "brand-medium" : "neutral-weak"}
              />
              <Text
                textVariant="label-default-xs"
                onBackground={selected ? "brand-medium" : "neutral-weak"}
              >
                {entry.label}
              </Text>
            </Card>
          );
        })}
      </Row>
    </Column>
  );
}
