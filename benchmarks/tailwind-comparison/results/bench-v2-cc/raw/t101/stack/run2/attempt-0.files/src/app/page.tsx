import { Button, Column, Grid, Heading, Line, Row, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects, user } from "@/lib/data";

export default function DashboardPage() {
  const firstName = user.name.split(" ")[0];
  const active = projects.filter((p) => p.status === "Active");
  const paused = projects.filter((p) => p.status === "Paused");
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];
  const busiest = [...projects].sort((a, b) => b.issues - a.issues).slice(0, 3);

  const cards = [
    { label: "Open issues", value: String(openIssues), note: `across ${projects.length} projects` },
    { label: "Active projects", value: String(active.length), note: active.map((p) => p.key).join(", ") },
    { label: "Paused projects", value: String(paused.length), note: paused.map((p) => p.name).join(", ") },
    { label: "Last update", value: formatDate(latest.updated), note: latest.name },
  ];

  return (
    <>
      <Column gap="4">
        <Heading as="h1" variant="heading-strong-l">
          Welcome back, {firstName}
        </Heading>
        <Text variant="body-default-s" onBackground="neutral-weak">
          {openIssues} open issues across {active.length} active projects.
        </Text>
      </Column>

      <Grid columns="4" m={{ columns: "2" }} s={{ columns: "1" }} gap="12">
        {cards.map((card) => (
          <Column key={card.label} as="section" aria-label={card.label} background="page" border radius="m" padding="16" gap="4">
            <Text variant="label-default-s" onBackground="neutral-weak">
              {card.label}
            </Text>
            <Text as="p" variant="heading-strong-xl">
              {card.value}
            </Text>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              {card.note}
            </Text>
          </Column>
        ))}
      </Grid>

      <Column as="section" aria-labelledby="busiest" gap="8">
        <Row horizontal="between" vertical="center">
          <Heading as="h2" id="busiest" variant="heading-strong-s">
            Most open issues
          </Heading>
          <Button href="/projects" variant="tertiary" size="s" label="All projects" suffixIcon="arrowRight" />
        </Row>
        <Column background="page" border radius="m">
          {busiest.map((project, index) => (
            <Column key={project.key} fillWidth>
              {index > 0 && <Line />}
              <Row paddingX="16" paddingY="8" gap="12" vertical="center">
                <Tag size="s" label={project.key} />
                <Text variant="body-default-s" flex={1}>
                  {project.name}
                </Text>
                <Text variant="label-default-s" onBackground="neutral-weak">
                  {project.issues} open
                </Text>
              </Row>
            </Column>
          ))}
        </Column>
      </Column>
    </>
  );
}
