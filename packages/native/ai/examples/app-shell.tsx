/**
 * Gold example: app-shell
 * Target: the providers at the root, a screen header, a screen that scrolls
 * and a bottom tab bar that stays put over the home indicator.
 *
 * In an Expo Router app the providers live in app/_layout.tsx (rules 1),
 * with insets={useSafeAreaInsets()} on ThemeProvider, and the tab bar is the
 * `tabBar` of its Tabs layout; here a state switches the screens so the file
 * stands alone.
 */

import {
  Card,
  Column,
  Heading,
  Icon,
  IconButton,
  type IconName,
  Line,
  Row,
  Text,
  ThemeProvider,
  ToastProvider,
} from "@once-ui-system/native";
import { type ReactNode, useState } from "react";
import { ScrollView } from "react-native";

type TabId = "home" | "rewards" | "orders" | "account";

const TABS: { id: TabId; label: string; icon: IconName }[] = [
  { id: "home", label: "Home", icon: "home" },
  { id: "rewards", label: "Rewards", icon: "gift" },
  { id: "orders", label: "Orders", icon: "document" },
  { id: "account", label: "Account", icon: "person" },
];

function Header({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <Row paddingX="20" paddingTop="12" paddingBottom="8" vertical="center" horizontal="between">
      <Heading textVariant="heading-strong-xl">{title}</Heading>
      {action}
    </Row>
  );
}

function TabBar({ value, onValueChange }: { value: TabId; onValueChange: (tab: TabId) => void }) {
  return (
    <Column background="surface">
      <Line />
      <Row paddingX="8" paddingTop="8" gap="4" safeArea={["bottom"]}>
        {TABS.map((tab) => {
          const selected = tab.id === value;
          return (
            <Card
              key={tab.id}
              flex={1}
              center
              gap="2"
              paddingY="4"
              radius="m"
              border="transparent"
              background="transparent"
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => onValueChange(tab.id)}
            >
              <Icon name={tab.icon} onBackground={selected ? "brand-strong" : "neutral-weak"} />
              <Text
                textVariant="label-default-xs"
                onBackground={selected ? "brand-strong" : "neutral-weak"}
              >
                {tab.label}
              </Text>
            </Card>
          );
        })}
      </Row>
    </Column>
  );
}

function Placeholder({ text }: { text: string }) {
  return (
    <Column background="surface" border="neutral-alpha-weak" radius="l" padding="16" gap="4">
      <Text textVariant="label-strong-m">{text}</Text>
      <Text textVariant="body-default-s" onBackground="neutral-weak">
        The screen's own content goes here.
      </Text>
    </Column>
  );
}

function Shell() {
  const [tab, setTab] = useState<TabId>("home");
  const current = TABS.find((t) => t.id === tab) ?? TABS[0];
  return (
    <Column fill background="page" safeArea={["top"]}>
      <Header
        title={current.label}
        action={<IconButton icon="bell" variant="tertiary" aria-label="Notifications" />}
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Column paddingX="20" paddingY="16" gap="16">
          <Placeholder text={`${current.label} screen`} />
        </Column>
      </ScrollView>
      <TabBar value={tab} onValueChange={setTab} />
    </Column>
  );
}

export default function App() {
  return (
    <ThemeProvider brand="orange" neutral="sand" solid="color">
      <ToastProvider>
        <Shell />
      </ToastProvider>
    </ThemeProvider>
  );
}
