import { ScrollView } from "react-native";
import {
  Accordion,
  AvatarGroup,
  Column,
  Heading,
  List,
  ListItem,
  Media,
  Row,
  StatusIndicator,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Tag,
  Text,
  useTheme,
} from "../src";

// A drawn stand-in for a product photo, so the demo needs no network.
const PHOTO = `data:image/svg+xml;base64,${btoa(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><radialGradient id="c" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="#f3e3cc"/><stop offset=".35" stop-color="#c8955f"/><stop offset=".7" stop-color="#6b3f22"/><stop offset="1" stop-color="#2a1a10"/></radialGradient></defs><rect width="400" height="300" fill="#1c1410"/><circle cx="200" cy="150" r="120" fill="#e9e1d6"/><circle cx="200" cy="150" r="100" fill="url(#c)"/><path d="M200 95c-30 25-30 60 0 90 30-30 30-65 0-90z" fill="#f6ead8" opacity=".9"/></svg>`,
)}`;

const DRINKS = {
  hot: [
    ["Flat white", "Double ristretto, steamed milk", "1 450 Ft"],
    ["Cortado", "Equal parts espresso and milk", "1 250 Ft"],
  ],
  iced: [
    ["Cold brew", "Steeped for 18 hours", "1 350 Ft"],
    ["Iced oat latte", "Oat milk over ice", "1 550 Ft"],
  ],
} as const;

/** A menu screen for the components added in this round: Tabs, Media, List, Accordion, AvatarGroup, StatusIndicator. */
export function Menu() {
  const theme = useTheme();
  return (
    <ScrollView style={{ backgroundColor: theme.color("page-background") }}>
      <Column padding="20" gap="20" safeArea={["top"]}>
        <Row vertical="center" horizontal="between">
          <Heading textVariant="heading-strong-l">Menu</Heading>
          <Row vertical="center" gap="8">
            <StatusIndicator color="green" aria-label="Open now" />
            <Text textVariant="label-default-s" onBackground="neutral-weak">
              Open until 18:00
            </Text>
          </Row>
        </Row>

        <Media
          src={PHOTO}
          alt="Flat white with latte art"
          aspectRatio="4 / 3"
          radius="l"
          border="neutral-alpha-weak"
          caption="Today's single origin: Huila, Colombia"
        />

        <Tabs defaultValue="hot" gap="12">
          <TabList>
            <Tab value="hot" label="Hot" prefixIcon="light" />
            <Tab value="iced" label="Iced" prefixIcon="sparkle" />
          </TabList>
          {(["hot", "iced"] as const).map((k) => (
            <TabPanel key={k} value={k}>
              <Column gap="12">
                {DRINKS[k].map(([name, note, price]) => (
                  <Row
                    key={name}
                    vertical="center"
                    gap="12"
                    s={{ direction: "column", vertical: "start" }}
                  >
                    <Column flex={1} gap="2">
                      <Text textVariant="label-strong-m">{name}</Text>
                      <Text textVariant="body-default-s" onBackground="neutral-weak">
                        {note}
                      </Text>
                    </Column>
                    <Tag size="s" label={price} />
                  </Row>
                ))}
              </Column>
            </TabPanel>
          ))}
        </Tabs>

        <Accordion title="Allergens and milk" open>
          <List>
            <ListItem>Whole, oat and lactose-free milk</ListItem>
            <ListItem>Pastries contain gluten and egg</ListItem>
            <ListItem>Syrups are vegan</ListItem>
          </List>
        </Accordion>

        <Row vertical="center" gap="12">
          <AvatarGroup
            limit={3}
            avatars={[
              { value: "AK" },
              { value: "BT" },
              { value: "CS" },
              { value: "DN" },
              { value: "EV" },
            ]}
          />
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            Five friends ordered here this week
          </Text>
        </Row>
      </Column>
    </ScrollView>
  );
}
