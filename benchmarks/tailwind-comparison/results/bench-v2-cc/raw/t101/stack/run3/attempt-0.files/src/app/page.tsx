import { Column, Grid, Heading, Row, Tag, Text } from "@once-ui-system/core";
import {
  activeProjects,
  formatDate,
  projects,
  statusScheme,
  totalIssues,
  user,
} from "@/lib/data";

export const metadata = { title: "Overview" };

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <Column background="surface" border radius="s" padding="16" gap="4">
      <Text variant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      <Text variant="heading-strong-xl" onBackground="neutral-strong">
        {value}
      </Text>
      <Text variant="body-default-xs" onBackground="neutral-weak">
        {note}
      </Text>
    </Column>
  );
}

export default function Page() {
  const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 4);
  const latest = recent[0];
  const firstName = user.name.split(" ")[0];

  return (
    <>
      <Column gap="4">
        <Heading as="h1" variant="heading-strong-xl">
          Welcome back, {firstName}
        </Heading>
        <Text variant="body-default-s" onBackground="neutral-weak">
          Here is where your projects stand today.
        </Text>
      </Column>
      <Grid columns="4" m={{ columns: 2 }} s={{ columns: 1 }} gap="12" fillWidth>
        <Stat label="Open issues" value={String(totalIssues)} note="Across all projects" />
        <Stat label="Active projects" value={String(activeProjects)} note={`of ${projects.length} in the workspace`} />
        <Stat label="Most issues" value="APP" note="Customer app, 31 open" />
        <Stat label="Last update" value={formatDate(latest.updated)} note={latest.name} />
      </Grid>
      <Column background="surface" border radius="s" padding="16" gap="12">
        <Heading as="h2" variant="heading-strong-m">
          Recently updated
        </Heading>
        <Column as="ul" margin="0" padding="0" gap="8" style={{ listStyle: "none" }}>
          {recent.map((project) => (
            <Row
              as="li"
              key={project.key}
              vertical="center"
              gap="12"
              paddingBottom="8"
              borderBottom
              wrap
            >
              <Text variant="code-default-s" onBackground="neutral-weak">
                {project.key}
              </Text>
              <Text variant="label-default-m" onBackground="neutral-strong" style={{ flex: 1 }}>
                {project.name}
              </Text>
              <Tag as="span" size="s" scheme={statusScheme[project.status]} label={project.status} />
              <Text variant="body-default-s" onBackground="neutral-weak">
                {formatDate(project.updated)}
              </Text>
            </Row>
          ))}
        </Column>
      </Column>
    </>
  );
}
