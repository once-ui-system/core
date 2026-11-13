import { Column, Grid, Heading, Row, Tag, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { PageHeader } from "../components/PageHeader";
import { formatDate, projects, statusTone, user } from "../lib/data";

export const metadata: Metadata = { title: "Overview" };

const openIssues = projects.reduce((sum, project) => sum + project.issues, 0);
const active = projects.filter((project) => project.status === "Active").length;
const paused = projects.filter((project) => project.status === "Paused").length;
const latest = projects.reduce((a, b) => (a.updated > b.updated ? a : b));

const cards = [
  { label: "Open issues", value: String(openIssues), note: `across ${projects.length} projects` },
  { label: "Active projects", value: String(active), note: "shipping this month" },
  { label: "Paused projects", value: String(paused), note: "waiting on a decision" },
  { label: "Last update", value: formatDate(latest.updated), note: `${latest.key} · ${latest.name}` },
];

export default function DashboardPage() {
  const busiest = [...projects].sort((a, b) => b.issues - a.issues).slice(0, 3);
  return (
    <Column fillWidth gap="32">
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Here is where your workspace stands today."
      />

      <Grid as="section" aria-label="Summary" fillWidth columns="4" gap="16" m={{ columns: 2 }} s={{ columns: 1 }}>
        {cards.map((card) => (
          <Column key={card.label} background="surface" border radius="m" padding="20" gap="8">
            <Text textVariant="label-default-s" onBackground="neutral-weak">
              {card.label}
            </Text>
            <Heading as="p" textVariant="heading-strong-xl">
              {card.value}
            </Heading>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              {card.note}
            </Text>
          </Column>
        ))}
      </Grid>

      <Column as="section" aria-labelledby="busiest" background="surface" border radius="m" padding="20" gap="16">
        <Heading as="h2" id="busiest" textVariant="heading-strong-s">
          Busiest projects
        </Heading>
        <Column as="ul" gap="12" margin="0" padding="0">
          {busiest.map((project) => (
            <Row as="li" key={project.key} fillWidth vertical="center" gap="12" wrap>
              <Text textVariant="code-strong-s" onBackground="brand-medium">
                {project.key}
              </Text>
              <Row flex={1} minWidth={0}>
                <Text textVariant="body-default-m">{project.name}</Text>
              </Row>
              <Tag label={project.status} tone={statusTone[project.status]} size="s" />
              <Text textVariant="body-default-s" onBackground="neutral-weak">
                {project.issues} open issues
              </Text>
            </Row>
          ))}
        </Column>
      </Column>
    </Column>
  );
}
