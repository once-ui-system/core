import { Column, Grid, Heading, Icon, Row, Tag, Text, type IconName } from "@once-ui-system/core";
import {
  activeProjects,
  formatDate,
  lastUpdated,
  projects,
  statusTone,
  totalOpenIssues,
  user,
} from "@/lib/data";

type Stat = { label: string; value: string; hint: string; icon: IconName };

const stats: Stat[] = [
  {
    label: "Open issues",
    value: String(totalOpenIssues),
    hint: `Across ${projects.length} projects`,
    icon: "flag",
  },
  {
    label: "Active projects",
    value: String(activeProjects),
    hint: "Currently receiving updates",
    icon: "folder",
  },
  {
    label: "Last activity",
    value: formatDate(lastUpdated),
    hint: "Most recent project update",
    icon: "calendar",
  },
  {
    label: "Team seats",
    value: "8 of 10",
    hint: "Two seats available on your plan",
    icon: "people",
  },
];

export function Dashboard() {
  const firstName = user.name.split(" ")[0];
  const busiest = projects.reduce((a, b) => (b.issues > a.issues ? b : a), projects[0]);
  const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 3);

  return (
    <Column gap="32">
      <Column gap="8">
        <Heading as="h1" textVariant="display-strong-xs">
          Welcome back, {firstName}
        </Heading>
        <Text textVariant="body-default-m" onBackground="neutral-weak">
          {busiest.name} has the most open issues right now ({busiest.issues}). Here is where your
          workspace stands today.
        </Text>
      </Column>

      <Grid columns="4" m={{ columns: 2 }} s={{ columns: 1 }} gap="16" as="ul" padding="0" margin="0">
        {stats.map((stat) => (
          <Column
            as="li"
            key={stat.label}
            background="surface"
            border
            radius="l"
            padding="20"
            gap="12"
          >
            <Row vertical="center" gap="8">
              <Icon name={stat.icon} size="s" onBackground="neutral-weak" />
              <Text textVariant="label-default-s" onBackground="neutral-weak">
                {stat.label}
              </Text>
            </Row>
            <Text textVariant="heading-strong-xl">{stat.value}</Text>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              {stat.hint}
            </Text>
          </Column>
        ))}
      </Grid>

      <Column gap="16" as="section" aria-labelledby="recent-heading">
        <Heading as="h2" id="recent-heading" textVariant="heading-strong-l">
          Recently updated
        </Heading>
        <Column background="surface" border radius="l" as="ul" padding="0" margin="0">
          {recent.map((project, index) => (
            <Row
              as="li"
              key={project.key}
              paddingX="20"
              paddingY="16"
              gap="16"
              vertical="center"
              wrap
              borderTop={index > 0 ? true : undefined}
            >
              <Column flex={1} gap="4" minWidth={12}>
                <Text textVariant="label-strong-m">{project.name}</Text>
                <Text textVariant="body-default-xs" onBackground="neutral-weak">
                  {project.key} · {project.issues} open issues · Updated {formatDate(project.updated)}
                </Text>
              </Column>
              <Tag tone={statusTone[project.status]} label={project.status} size="s" />
            </Row>
          ))}
        </Column>
      </Column>
    </Column>
  );
}
