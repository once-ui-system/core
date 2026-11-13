import { Column, Grid, Heading, Row, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects, recentActivity, summary, user } from "@/lib/data";

const cards = [
  {
    label: "Open issues",
    value: String(summary.openIssues),
    note: "Across all projects",
  },
  {
    label: "Active projects",
    value: `${summary.activeProjects} of ${summary.totalProjects}`,
    note: "Paused and archived excluded",
  },
  {
    label: "Busiest project",
    value: [...projects].sort((a, b) => b.issues - a.issues)[0].name,
    note: `${[...projects].sort((a, b) => b.issues - a.issues)[0].issues} open issues`,
  },
  {
    label: "Last update",
    value: formatDate([...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0].updated),
    note: "Most recent project activity",
  },
];

export function DashboardView() {
  return (
    <Column gap="32">
      <Column gap="8">
        <Text variant="label-default-s" onBackground="brand-medium">
          Overview
        </Text>
        <Heading as="h1" variant="display-strong-xs">
          Welcome back, {user.name.split(" ")[0]}
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          Here is where your team stands today across {summary.totalProjects} projects.
        </Text>
      </Column>

      <Grid columns="4" m={{ columns: 2 }} s={{ columns: 1 }} gap="16">
        {cards.map((card) => (
          <Column
            key={card.label}
            background="surface"
            border
            radius="l"
            padding="20"
            gap="8"
          >
            <Text variant="label-default-s" onBackground="neutral-weak">
              {card.label}
            </Text>
            <Text variant="heading-strong-l">{card.value}</Text>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              {card.note}
            </Text>
          </Column>
        ))}
      </Grid>

      <Column id="reports" gap="16" background="surface" border radius="l" padding="24">
        <Row horizontal="between" vertical="center" gap="12" wrap>
          <Heading as="h2" variant="heading-strong-m">
            Recent activity
          </Heading>
          <Tag scheme="brand" size="s" label="Last 7 days" />
        </Row>
        <Column as="ul" gap="12" margin="0" padding="0" style={{ listStyle: "none" }}>
          {recentActivity.map((item) => (
            <Row as="li" key={item.what} gap="12" horizontal="between" vertical="start">
              <Text variant="body-default-s">
                <strong>{item.who}</strong> {item.what}
              </Text>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                {item.when}
              </Text>
            </Row>
          ))}
        </Column>
      </Column>
    </Column>
  );
}
