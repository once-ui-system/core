import { Column, Grid, Heading, Row, Tag, Text } from "@once-ui-system/core";
import { projects, user } from "@/lib/data";

const active = projects.filter((p) => p.status === "Active").length;
const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);

const cards = [
  { label: "Active projects", value: String(active), note: "of 5 in your workspace" },
  { label: "Open issues", value: String(openIssues), note: "across every project" },
  { label: "Busiest project", value: "Customer app", note: "31 open issues" },
  { label: "Team members", value: "1", note: `${user.name} (${user.role})` },
];

export default function DashboardPage() {
  return (
    <Column gap="32">
      <Column gap="8">
        <Heading as="h1" textVariant="display-strong-xs">
          Welcome back, Maya
        </Heading>
        <Text onBackground="neutral-weak" textVariant="body-default-l">
          Here is how your team is doing today. Nice work, keep it up!
        </Text>
      </Column>
      <Grid columns="2" s={{ columns: 1 }} gap="24" as="section" aria-label="Summary">
        {cards.map((card) => (
          <Column
            key={card.label}
            background="surface"
            border
            radius="l"
            padding="24"
            gap="8"
          >
            <Text onBackground="neutral-weak" textVariant="label-default-m">
              {card.label}
            </Text>
            <Heading as="p" textVariant="display-strong-xs">
              {card.value}
            </Heading>
            <Row>
              <Tag tone="brand" label={card.note} />
            </Row>
          </Column>
        ))}
      </Grid>
    </Column>
  );
}
