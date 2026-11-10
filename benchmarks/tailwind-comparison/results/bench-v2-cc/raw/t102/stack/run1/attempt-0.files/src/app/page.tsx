import { Column, Grid, Heading, Row, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects, user } from "@/lib/data";

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Column background="page" border radius="l" padding="24" gap="8">
      <Text variant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      <Heading as="p" variant="display-strong-s">
        {value}
      </Heading>
      <Text variant="body-default-s" onBackground="neutral-weak">
        {hint}
      </Text>
    </Column>
  );
}

export default function DashboardPage() {
  const active = projects.filter((p) => p.status === "Active");
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];
  const firstName = user.name.split(" ")[0];

  return (
    <>
      <Column gap="8">
        <Heading as="h1" variant="display-strong-m">
          Welcome back, {firstName}
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak">
          Here is how your teams are doing today. Nice work keeping things moving.
        </Text>
      </Column>

      <Grid columns={4} m={{ columns: 2 }} s={{ columns: 1 }} gap="16">
        <Stat label="Open issues" value={String(openIssues)} hint={`Across ${projects.length} projects`} />
        <Stat label="Active projects" value={String(active.length)} hint="Currently being worked on" />
        <Stat label="Busiest project" value={busiest.key} hint={`${busiest.name}, ${busiest.issues} issues`} />
        <Stat label="Last updated" value={formatDate(latest.updated)} hint={latest.name} />
      </Grid>

      <Column gap="16">
        <Heading as="h2" variant="heading-strong-xl">
          Recent activity
        </Heading>
        <Column background="page" border radius="l" padding="8">
          {[...projects]
            .sort((a, b) => b.updated.localeCompare(a.updated))
            .slice(0, 3)
            .map((p) => (
              <Row key={p.key} paddingX="16" paddingY="16" gap="16" vertical="center" wrap>
                <Tag size="s" label={p.key} />
                <Column flex={1} minWidth={12} gap="4">
                  <Text variant="label-strong-m">{p.name}</Text>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    {p.issues} open issues
                  </Text>
                </Column>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Updated {formatDate(p.updated)}
                </Text>
              </Row>
            ))}
        </Column>
      </Column>
    </>
  );
}
