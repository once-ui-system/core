import { Column, Grid, Heading, Icon, Row, Tag, Text } from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";
import { formatDate, product, projects, summary, user } from "@/lib/data";

type Card = { label: string; value: string; note: string; icon: IconName };

export function Dashboard() {
  const s = summary();
  const cards: Card[] = [
    { label: "Active projects", value: String(s.active), note: `of ${s.total} in the workspace`, icon: "folder" },
    { label: "Open issues", value: String(s.openIssues), note: "across all projects", icon: "checkbox" },
    {
      label: "Last updated",
      value: s.latest.key,
      note: `${s.latest.name}, ${formatDate(s.latest.updated)}`,
      icon: "time",
    },
  ];
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];

  return (
    <Column gap="32">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Welcome back, {user.name.split(" ")[0]}
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {product.tagline}. Here is where your workspace stands today.
        </Text>
      </Column>

      <Grid columns="3" s={{ columns: 1 }} m={{ columns: 2 }} gap="16">
        {cards.map((card) => (
          <Column key={card.label} as="section" aria-label={card.label} background="surface" border radius="l" padding="24" gap="12">
            <Row gap="8" vertical="center" onBackground="neutral-weak">
              <Icon name={card.icon} size="s" />
              <Text variant="label-default-s" onBackground="neutral-weak">
                {card.label}
              </Text>
            </Row>
            <Heading as="p" variant="display-strong-s">
              {card.value}
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-weak">
              {card.note}
            </Text>
          </Column>
        ))}
      </Grid>

      <Column background="surface" border radius="l" padding="24" gap="12">
        <Row gap="12" vertical="center" wrap>
          <Heading as="h2" variant="heading-strong-m">
            Needs attention
          </Heading>
          <Tag scheme="warning" size="s" label={`${busiest.issues} open`} />
        </Row>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {busiest.name} ({busiest.key}) has the most open issues. Last activity on{" "}
          {formatDate(busiest.updated)}.
        </Text>
      </Column>
    </Column>
  );
}
