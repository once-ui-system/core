import { Column } from "@once-ui-system/core/components/Column";
import { Grid } from "@once-ui-system/core/components/Grid";
import { Heading } from "@once-ui-system/core/components/Heading";
import { Row } from "@once-ui-system/core/components/Row";
import { Tag } from "@once-ui-system/core/components/Tag";
import { Text } from "@once-ui-system/core/components/Text";
import type { Metadata } from "next";
import { PageHeader } from "../components/PageHeader";
import { formatDate, projects, statusTone, user } from "../lib/data";

export const metadata: Metadata = { title: "Overview" };

export default function DashboardPage() {
  const active = projects.filter((project) => project.status === "Active");
  const totalIssues = projects.reduce((sum, project) => sum + project.issues, 0);
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];
  const firstName = user.name.split(" ")[0];

  const cards = [
    { label: "Open issues", value: String(totalIssues), note: `across ${projects.length} projects` },
    { label: "Active projects", value: String(active.length), note: `of ${projects.length} in the workspace` },
    { label: "Busiest project", value: busiest.key, note: `${busiest.name}, ${busiest.issues} open issues` },
    { label: "Last update", value: formatDate(latest.updated), note: `${latest.name} (${latest.key})` },
  ];

  return (
    <Column fillWidth gap="24">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here is where your workspace stands today."
      />

      <Grid as="section" aria-label="Summary" columns="4" m={{ columns: 2 }} s={{ columns: 1 }} gap="12">
        {cards.map((card) => (
          <Column key={card.label} background="surface" border radius="m" padding="16" gap="4">
            <Text textVariant="label-default-s" onBackground="neutral-weak">
              {card.label}
            </Text>
            <Heading as="h2" textVariant="heading-strong-xl">
              {card.value}
            </Heading>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              {card.note}
            </Text>
          </Column>
        ))}
      </Grid>

      <Column as="section" aria-labelledby="by-project" gap="8">
        <Heading as="h2" id="by-project" textVariant="heading-strong-s">
          Open issues by project
        </Heading>
        <Column border radius="m" background="surface" as="ul" margin="0" padding="0">
          {[...projects]
            .sort((a, b) => b.issues - a.issues)
            .map((project, index) => (
              <Row
                as="li"
                key={project.key}
                paddingX="12"
                paddingY="8"
                gap="12"
                vertical="center"
                borderTop={index > 0}
              >
                <Text textVariant="code-strong-xs" onBackground="neutral-weak">
                  {project.key}
                </Text>
                <Text textVariant="body-default-s" style={{ flex: 1 }}>
                  {project.name}
                </Text>
                <Tag tone={statusTone[project.status]} label={project.status} size="s" />
                <Text textVariant="label-strong-s">{project.issues}</Text>
              </Row>
            ))}
        </Column>
      </Column>
    </Column>
  );
}
