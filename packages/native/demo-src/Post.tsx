import { ScrollView } from "react-native";
import { Column, Markdown, Row, Text, User, useTheme } from "../src";

const BODY = `## Friday tasting menu

Six courses, **one sitting** at 19:00. The kitchen cooks what came in on *Thursday's* boat.

- Oysters, green apple, dill
- Smoked trout with \`brown butter\`
- Duck, cherries, burnt onion

> Book by Thursday noon. We seat twelve.

1. Pick a time
2. Pay the deposit

Allergies? See [the menu notes](https://example.com/menu).

---

| Course | Wine |
| :--- | ---: |
| Oysters | Furmint |
| Duck | Kadarka |`;

/** A social post whose body is stored as Markdown: Markdown with a User header. */
export function Post() {
  const theme = useTheme();
  return (
    <ScrollView style={{ backgroundColor: theme.color("page-background") }}>
      <Column padding="20" gap="8">
        <Row vertical="center" horizontal="between">
          <User name="Kisbéka Bistro" subline="2 hours ago" avatarProps={{ value: "KB" }} />
          <Text variant="label-default-s" onBackground="neutral-weak">
            Pinned
          </Text>
        </Row>
        <Markdown onLinkPress={() => {}}>{BODY}</Markdown>
      </Column>
    </ScrollView>
  );
}
