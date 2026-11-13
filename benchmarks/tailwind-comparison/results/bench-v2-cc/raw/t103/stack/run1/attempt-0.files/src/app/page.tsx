import { Column, Grid, Heading, Row, Text } from "@once-ui-system/core";
import { formatDate, product, stats, user } from "@/lib/data";

const cards = [
  { label: "Open issues", value: String(stats.openIssues), note: "Across all projects" },
  { label: "Active projects", value: String(stats.active), note: `${stats.paused} paused` },
  { label: "Last activity", value: formatDate(stats.lastUpdate), note: "Customer app" },
];

export default function DashboardPage() {
  const firstName = user.name.split(" ")[0];
  return (
    <>
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Welcome back, {firstName}
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {product.tagline}. Here is where the workspace stands today.
        </Text>
      </Column>

      <Grid columns="3" s={{ columns: 1 }} m={{ columns: 1 }} gap="16" fillWidth>
        {cards.map((card) => (
          <Column
            key={card.label}
            as="section"
            aria-label={card.label}
            background="surface"
            border
            radius="l"
            padding="24"
            gap="8"
          >
            <Text variant="label-default-s" onBackground="neutral-weak">
              {card.label}
            </Text>
            <Heading as="p" variant="display-strong-s">
              {card.value}
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-weak">
              {card.note}
            </Text>
          </Column>
        ))}
      </Grid>

      <Column id="reports" as="section" aria-labelledby="reports-title" gap="8" paddingTop="16">
        <Heading as="h2" id="reports-title" variant="heading-strong-l">
          Reports
        </Heading>
        <Row>
          <Text variant="body-default-s" onBackground="neutral-weak">
            Weekly issue throughput and event reports are generated every Monday for each active project.
          </Text>
        </Row>
      </Column>
    </>
  );
}
