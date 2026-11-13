import { Column, Grid, Heading, Line, Row, Tag, Text } from "@once-ui-system/core";
import { PageTitle } from "@/components/PageTitle";
import { projects, statusScheme, user } from "@/lib/data";

export default function DashboardPage() {
  const open = projects.reduce((sum, p) => sum + p.issues, 0);
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated));

  const cards = [
    { label: "Open issues", value: String(open), note: `across ${projects.length} projects` },
    { label: "Active projects", value: String(active), note: "in progress now" },
    { label: "Paused projects", value: String(paused), note: "waiting on a restart" },
    { label: "Last activity", value: latest[0].updated, note: latest[0].name },
  ];

  return (
    <>
      <PageTitle
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Here is where your workspace stands today."
      />
      <Grid columns="4" m={{ columns: 2 }} s={{ columns: 1 }} gap="12">
        {cards.map((card) => (
          <Column key={card.label} background="page" border radius="m" padding="16" gap="4">
            <Text variant="label-default-s" onBackground="neutral-weak">
              {card.label}
            </Text>
            <Heading as="p" variant="display-strong-xs">
              {card.value}
            </Heading>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              {card.note}
            </Text>
          </Column>
        ))}
      </Grid>
      <Column background="page" border radius="m" padding="16" gap="8">
        <Heading as="h2" variant="heading-strong-s">
          Recently updated
        </Heading>
        <Column>
          {latest.slice(0, 4).map((project, index) => (
            <Column key={project.key} fillWidth>
              {index > 0 ? <Line /> : null}
              <Row fillWidth vertical="center" gap="12" paddingY="8" wrap>
                <Text variant="code-default-s" onBackground="neutral-weak">
                  {project.key}
                </Text>
                <Text variant="label-default-m" flex={1}>
                  {project.name}
                </Text>
                <Tag scheme={statusScheme[project.status]} size="s" label={project.status} />
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {project.updated}
                </Text>
              </Row>
            </Column>
          ))}
        </Column>
      </Column>
    </>
  );
}
