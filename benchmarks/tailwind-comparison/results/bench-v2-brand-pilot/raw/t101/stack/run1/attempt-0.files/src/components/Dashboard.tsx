import { Column, Grid, Heading, Row, StatusIndicator, Tag, Text } from "@once-ui-system/core";
import { activeProjects, formatDate, latestUpdate, projects, totalIssues, user } from "@/lib/data";

const summary = [
  { label: "Open issues", value: String(totalIssues), note: "Across all projects" },
  { label: "Active projects", value: String(activeProjects), note: `of ${projects.length} total` },
  { label: "Last update", value: formatDate(latestUpdate), note: "Customer app" },
];

export function Dashboard() {
  return (
    <>
      <Column gap="4">
        <Text variant="label-default-s" onBackground="brand-medium">
          Overview
        </Text>
        <Heading as="h1" variant="display-strong-xs">
          Welcome back, {user.name.split(" ")[0]}
        </Heading>
        <Text variant="body-default-s" onBackground="neutral-weak">
          Here is where your workspace stands today.
        </Text>
      </Column>

      <Grid columns="3" s={{ columns: 1 }} m={{ columns: 3 }} gap="12" fillWidth>
        {summary.map((item) => (
          <Column key={item.label} background="surface" border radius="l" padding="16" gap="4">
            <Text variant="label-default-s" onBackground="neutral-weak">
              {item.label}
            </Text>
            <Heading as="p" variant="display-strong-s" className="lumen-figures">
              {item.value}
            </Heading>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              {item.note}
            </Text>
          </Column>
        ))}
      </Grid>

      <Column background="surface" border radius="l" padding="16" gap="8">
        <Heading as="h2" variant="heading-strong-s">
          Projects needing attention
        </Heading>
        {projects
          .filter((p) => p.status === "Active")
          .sort((a, b) => b.issues - a.issues)
          .map((p) => (
            <Row key={p.key} vertical="center" gap="12" paddingY="4" borderBottom>
              <Tag size="s">{p.key}</Tag>
              <Text variant="body-default-s" flex={1}>
                {p.name}
              </Text>
              <StatusIndicator color="success" />
              <Text variant="label-default-s" className="lumen-figures">
                {p.issues} open
              </Text>
            </Row>
          ))}
      </Column>
    </>
  );
}
