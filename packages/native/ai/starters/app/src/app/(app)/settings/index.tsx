import { Card, Column, Icon, Line, Text } from "@once-ui-system/native";
import { router } from "expo-router";
import { Fragment } from "react";
import { Screen } from "../../../components/Screen";
import { nav } from "../../../resources/app";

// The group's links from resources/app.ts, as rows. The web shell shows the
// same links in its sidebar.
export default function SettingsScreen() {
  const group = nav.find((entry) => "items" in entry && entry.label === "Settings");
  const items = group && "items" in group ? group.items : [];
  return (
    <Screen title="Settings">
      <Column background="surface" border="neutral-alpha-weak" radius="l" overflow="hidden">
        {items.map((link, index) => (
          <Fragment key={link.href}>
            {index > 0 && <Line />}
            <Card
              radius="none"
              border="transparent"
              background="transparent"
              paddingX="16"
              paddingY="12"
              vertical="center"
              horizontal="between"
              direction="row"
              testID={`link-${link.href.slice(1).replace(/\//g, "-")}`}
              onPress={() => router.push(link.href as never)}
            >
              <Text textVariant="label-default-m">{link.label}</Text>
              <Icon name="chevronRight" size="s" onBackground="neutral-weak" />
            </Card>
          </Fragment>
        ))}
      </Column>
    </Screen>
  );
}
