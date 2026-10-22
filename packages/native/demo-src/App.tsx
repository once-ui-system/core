import { useState } from "react";
import { ScrollView } from "react-native";
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Column,
  Feedback,
  Heading,
  IconButton,
  Input,
  Line,
  Row,
  Skeleton,
  Spinner,
  Switch,
  Tag,
  Text,
  ThemeProvider,
  ToastProvider,
  useTheme,
  useToast,
} from "../src";
import { Assistant } from "./Assistant";
import { Booking, Calendar } from "./Booking";
import { Code } from "./Code";
import { Guests } from "./Guests";
import { Menu } from "./Menu";
import { Order } from "./Order";
import { Post } from "./Post";
import { Shell } from "./Shell";
import { Stats } from "./Stats";

/** A loyalty-card screen built only from the preview components. */
function Screen() {
  const theme = useTheme();
  const [stamps, setStamps] = useState(7);
  const [push, setPush] = useState(true);
  const { addToast } = useToast();
  return (
    <ScrollView style={{ backgroundColor: theme.color("page-background") }}>
      <Column padding="20" gap="20">
        <Row vertical="center" gap="12">
          <Avatar value="MC" size="l" statusIndicator={{ color: "green" }} />
          <Column flex={1} gap="2">
            <Heading variant="heading-strong-m">Morning Coffee</Heading>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Kazinczy utca 14
            </Text>
          </Column>
          <Tag scheme="success" label="Open" prefixIcon="time" style={{ alignSelf: "center" }} />
          <IconButton icon="heart" variant="tertiary" ariaLabel="Save to favourites" />
        </Row>

        <Card padding="20" gap="16" shadow="m">
          <Row horizontal="between" vertical="center">
            <Text variant="label-strong-m">Loyalty card</Text>
            <Tag scheme="brand" size="s" label={`${stamps}/10`} />
          </Row>
          <Row gap="8" wrap>
            {Array.from({ length: 10 }, (_, i) => (
              <Column
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed list of stamp slots
                key={i}
                width="32"
                height="32"
                radius="full"
                center
                background={i < stamps ? "brand-strong" : "neutral-alpha-weak"}
                border={i < stamps ? "brand-medium" : "neutral-alpha-medium"}
              >
                <Text
                  variant="label-strong-s"
                  onBackground={i < stamps ? "brand-strong" : "neutral-weak"}
                >
                  {i + 1}
                </Text>
              </Column>
            ))}
          </Row>
          <Line />
          <Text variant="body-default-s" onBackground="neutral-medium">
            Three more coffees and the next one is on us.
          </Text>
          <Row gap="8">
            <Button
              label="Add stamp"
              prefixIcon="plus"
              onPress={() => {
                setStamps((s) => Math.min(10, s + 1));
                addToast({ variant: "success", message: "Stamp added" });
              }}
            />
            <Button variant="secondary" label="History" suffixIcon="chevronRight" />
          </Row>
        </Card>

        <Feedback
          variant="success"
          title="Reward unlocked"
          description="Show this screen at the counter for a free pastry."
        />

        <Column gap="12">
          <Input label="Email" defaultValue="lorant@example.com" />
          <Input
            label="Promo code"
            error
            errorMessage="This code has expired"
            defaultValue="AUTUMN"
          />
        </Column>

        <Column gap="16">
          <Switch
            label="Push notifications"
            description="When a reward is ready"
            checked={push}
            onToggle={setPush}
          />
          <Checkbox label="Email me new menu items" defaultChecked />
        </Column>

        <Row gap="12" vertical="center">
          <Spinner size="s" />
          <Column flex={1} gap="8">
            <Skeleton shape="line" size="s" />
            <Skeleton shape="line" size="s" width="60%" />
          </Column>
        </Row>
      </Column>
    </ScrollView>
  );
}

export function App({
  theme,
  screen = "card",
}: {
  theme: "light" | "dark";
  screen?:
    | "card"
    | "order"
    | "sheet"
    | "menu"
    | "stats"
    | "code"
    | "shell"
    | "drawer"
    | "form"
    | "form-errors"
    | "calendar"
    | "table"
    | "assistant"
    | "post";
}) {
  return (
    <ThemeProvider theme={theme} brand="orange" accent="yellow" neutral="sand" solid="color">
      <ToastProvider>
        {screen === "card" ? (
          <Screen />
        ) : screen === "menu" ? (
          <Menu />
        ) : screen === "stats" ? (
          <Stats />
        ) : screen === "code" ? (
          <Code />
        ) : screen === "table" ? (
          <Guests />
        ) : screen === "calendar" ? (
          <Calendar />
        ) : screen === "form" || screen === "form-errors" ? (
          <Booking errors={screen === "form-errors"} />
        ) : screen === "shell" || screen === "drawer" ? (
          <Shell drawer={screen === "drawer"} />
        ) : screen === "assistant" ? (
          <Assistant />
        ) : screen === "post" ? (
          <Post />
        ) : (
          <Order sheet={screen === "sheet"} />
        )}
      </ToastProvider>
    </ThemeProvider>
  );
}
