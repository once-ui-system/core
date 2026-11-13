import { Column, Grid, Heading, Icon, Row, Tag, Text } from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";
import { formatDate, product, recentActivity, summary, user } from "@/lib/data";

type Card = { label: string; value: string; hint: string; icon: IconName };

const cards: Card[] = [
  {
    label: "Open issues",
    value: String(summary.openIssues),
    hint: "Across all projects",
    icon: "flag",
  },
  {
    label: "Active projects",
    value: `${summary.activeProjects} of ${summary.totalProjects}`,
    hint: "Currently in progress",
    icon: "folder",
  },
  {
    label: "Last activity",
    value: formatDate(summary.lastUpdated),
    hint: "Most recent project update",
    icon: "calendar",
  },
];

export function Dashboard() {
  const firstName = user.name.split(" ")[0];
  return (
    <Column gap="32" fillWidth>
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Welcome back, {firstName}
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          Here is where things stand in {product.name} today.
        </Text>
      </Column>

      <Grid columns="3" s={{ columns: 1 }} m={{ columns: 2 }} gap="16" fillWidth>
        {cards.map((card) => (
          <Column
            key={card.label}
            as="section"
            aria-label={card.label}
            background="surface"
            border
            radius="l"
            padding="24"
            gap="12"
          >
            <Row vertical="center" gap="8" onBackground="neutral-weak">
              <Icon name={card.icon} size="s" />
              <Text variant="label-default-s" onBackground="neutral-weak">
                {card.label}
              </Text>
            </Row>
            <Heading as="p" variant="display-strong-xs">
              {card.value}
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-weak">
              {card.hint}
            </Text>
          </Column>
        ))}
      </Grid>

      <Column background="surface" border radius="l" padding="24" gap="16" as="section" aria-labelledby="recent-heading">
        <Row horizontal="between" vertical="center">
          <Heading as="h2" id="recent-heading" variant="heading-strong-m">
            Recent activity
          </Heading>
          <Tag size="s" label={`${user.role} view`} />
        </Row>
        <Column as="ul" gap="12" margin="0" padding="0" style={{ listStyle: "none" }}>
          {recentActivity.map((item) => (
            <Row as="li" key={item.id} horizontal="between" vertical="center" gap="16" wrap>
              <Text variant="body-default-m">{item.text}</Text>
              <Text variant="body-default-s" onBackground="neutral-weak">
                {item.when}
              </Text>
            </Row>
          ))}
        </Column>
      </Column>
    </Column>
  );
}
