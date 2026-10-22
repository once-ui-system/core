import { useState } from "react";
import { ScrollView } from "react-native";
import {
  Avatar,
  Button,
  Card,
  Column,
  Drawer,
  Heading,
  IconButton,
  Nav,
  NavGroup,
  NavItem,
  NavSection,
  Row,
  Tag,
  Text,
  useTheme,
} from "../src";

const TABS = [
  { icon: "home", label: "Today" },
  { icon: "calendar", label: "Bookings", badge: 3 },
  { icon: "gift", label: "Loyalty" },
  { icon: "person", label: "Account" },
] as const;

const BOOKINGS = [
  { time: "12:30", name: "Anna Kovács", party: 2, status: "Confirmed" },
  { time: "13:00", name: "Bence Szabó", party: 4, status: "Pending" },
  { time: "19:30", name: "Dóra Nagy", party: 6, status: "Pending" },
];

/** An app shell: a header, a drawer menu and a bottom tab bar, from Nav and Drawer. */
export function Shell({ drawer = false }: { drawer?: boolean }) {
  const theme = useTheme();
  const [tab, setTab] = useState(0);
  const [menu, setMenu] = useState(drawer);
  return (
    <Column flex={1} background="page">
      <Row
        safeArea={["top"]}
        paddingX="12"
        paddingY="8"
        vertical="center"
        gap="8"
        borderBottom="neutral-alpha-weak"
      >
        <IconButton icon="menu" variant="tertiary" ariaLabel="Menu" onPress={() => setMenu(true)} />
        <Heading variant="heading-strong-s" style={{ flex: 1 }}>
          {TABS[tab].label}
        </Heading>
        <Avatar value="MC" size="s" />
      </Row>

      <ScrollView style={{ flex: 1, backgroundColor: theme.color("page-background") }}>
        <Column padding="16" gap="12">
          <Text variant="label-default-s" onBackground="neutral-weak">
            Tuesday, 3 reservations
          </Text>
          {BOOKINGS.map((b) => (
            <Card key={b.time} padding="16" gap="12" direction="row" vertical="center">
              <Column width="48">
                <Text variant="label-strong-m">{b.time}</Text>
              </Column>
              <Column flex={1} gap="2">
                <Text variant="body-strong-s">{b.name}</Text>
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  Party of {b.party}
                </Text>
              </Column>
              <Tag
                size="s"
                scheme={b.status === "Confirmed" ? "success" : "warning"}
                label={b.status}
                style={{ alignSelf: "center" }}
              />
            </Card>
          ))}
          <Button label="New booking" prefixIcon="plus" fillWidth />
        </Column>
      </ScrollView>

      <Nav direction="row">
        {TABS.map((t, i) => (
          <NavItem
            key={t.label}
            icon={t.icon}
            label={t.label}
            badge={"badge" in t ? t.badge : undefined}
            selected={tab === i}
            onPress={() => setTab(i)}
          />
        ))}
      </Nav>

      <Drawer
        open={menu}
        onClose={() => setMenu(false)}
        side="left"
        size="s"
        title="Morning Coffee"
      >
        <Nav density="compact" variant="subtle">
          <NavSection label="Venue">
            <NavItem icon="home" label="Today" selected onPress={() => setMenu(false)} />
            <NavItem icon="calendar" label="Bookings" badge={3} />
            <NavItem icon="inbox" label="Messages" indicator />
          </NavSection>
          <NavSection label="Settings">
            <NavGroup icon="settings" label="Venue settings" defaultOpen>
              <NavItem label="Opening hours" />
              <NavItem label="Tables" />
              <NavItem label="Team" />
            </NavGroup>
            <NavItem icon="logout" label="Sign out" />
          </NavSection>
        </Nav>
      </Drawer>
    </Column>
  );
}
