import { Column, Grid, Heading, Row, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects, statusScheme, user } from "@/lib/data";

export default function Page() {
  const openIssues = projects.reduce((sum, project) => sum + project.issues, 0);
  const active = projects.filter((project) => project.status === "Active");
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated));
  const firstName = user.name.split(" ")[0];

  const cards = [
    { label: "Open issues", value: String(openIssues), note: `across ${projects.length} projects` },
    { label: "Active projects", value: String(active.length), note: `of ${projects.length} in your workspace` },
    { label: "Busiest project", value: busiest.name, note: `${busiest.issues} open issues` },
  ];

  return (
    <>
      <Column gap="8">
        <Heading as="h1" variant="display-strong-s">
          Welcome back, {firstName}
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak">
          Here is how your team is doing today. Nice work keeping things moving.
        </Text>
      </Column>

      <Grid columns="3" m={{ columns: 2 }} s={{ columns: 1 }} gap="24">
        {cards.map((card) => (
          <Column key={card.label} background="surface" border radius="l" padding="24" gap="8">
            <Text variant="label-default-m" onBackground="neutral-weak">
              {card.label}
            </Text>
            <Heading as="h2" variant="heading-strong-xl">
              {card.value}
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-weak">
              {card.note}
            </Text>
          </Column>
        ))}
      </Grid>

      <Column as="section" id="reports" gap="16" aria-labelledby="reports-title">
        <Heading as="h2" id="reports-title" variant="heading-strong-l">
          Reports: latest activity
        </Heading>
        <Column background="surface" border radius="l" padding="8">
          {latest.map((project) => (
            <Row
              key={project.key}
              paddingX="16"
              paddingY="16"
              gap="16"
              vertical="center"
              horizontal="between"
              wrap
            >
              <Row gap="12" vertical="center">
                <Tag label={project.key} />
                <Text variant="label-strong-m">{project.name}</Text>
              </Row>
              <Row gap="16" vertical="center">
                <Tag scheme={statusScheme[project.status]} label={project.status} />
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Updated {formatDate(project.updated)}
                </Text>
              </Row>
            </Row>
          ))}
        </Column>
      </Column>
    </>
  );
}
