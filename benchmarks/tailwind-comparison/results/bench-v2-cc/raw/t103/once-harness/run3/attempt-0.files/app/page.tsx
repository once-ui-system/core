import { Column, Grid, Heading, Text } from "@once-ui-system/core";
import { formatDate, projects, user } from "../lib/data";

export default function DashboardPage() {
  const open = projects.reduce((sum, p) => sum + p.issues, 0);
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];

  const cards = [
    { label: "Open issues", value: String(open), note: `across ${projects.length} projects` },
    { label: "Active projects", value: String(active), note: `${paused} paused` },
    {
      label: "Busiest project",
      value: [...projects].sort((a, b) => b.issues - a.issues)[0].key,
      note: `${Math.max(...projects.map((p) => p.issues))} open issues`,
    },
    {
      label: "Last updated",
      value: latest.key,
      note: `${latest.name}, ${formatDate(latest.updated)}`,
    },
  ];

  return (
    <Column gap="32">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Welcome back, {user.name.split(" ")[0]}
        </Heading>
        <Text onBackground="neutral-weak">
          Here is where your workspace stands today.
        </Text>
      </Column>
      <Grid columns="4" m={{ columns: 2 }} s={{ columns: 1 }} gap="16" as="section" aria-label="Summary">
        {cards.map((card) => (
          <Column
            key={card.label}
            background="page"
            border
            radius="m"
            padding="20"
            gap="8"
          >
            <Text textVariant="label-default-s" onBackground="neutral-weak">
              {card.label}
            </Text>
            <Heading as="h2" variant="display-strong-s">
              {card.value}
            </Heading>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              {card.note}
            </Text>
          </Column>
        ))}
      </Grid>
    </Column>
  );
}
