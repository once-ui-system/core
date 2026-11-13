import { Column, Grid, Heading, Row, Text } from "@once-ui-system/core";
import { formatDate, members, projects, recentProjects, user } from "@/lib/data";
import { PageHeader } from "./PageHeader";
import { StatusTag } from "./StatusTag";

export function DashboardView() {
  const openIssues = projects.reduce((sum, project) => sum + project.issues, 0);
  const activeProjects = projects.filter((project) => project.status === "Active").length;
  const activeMembers = members.filter((member) => member.status === "Active").length;
  const pendingInvites = members.filter((member) => member.status === "Invited").length;

  const stats = [
    { label: "Open issues", value: openIssues, note: "across all projects" },
    { label: "Active projects", value: activeProjects, note: `of ${projects.length} total` },
    { label: "Active members", value: activeMembers, note: `${members.length} in the workspace` },
    { label: "Pending invites", value: pendingInvites, note: "waiting to accept" },
  ];

  return (
    <Column gap="32">
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Here is where things stand across Acme Labs today."
      />

      <Grid columns="4" gap="16" m={{ columns: 2 }} s={{ columns: 1 }} as="section" aria-label="Key numbers">
        {stats.map((stat) => (
          <Column key={stat.label} background="surface" border radius="l" padding="24" gap="8">
            <Text textVariant="label-default-s" onBackground="neutral-weak">
              {stat.label}
            </Text>
            <Heading as="p" textVariant="display-strong-s">
              {stat.value}
            </Heading>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              {stat.note}
            </Text>
          </Column>
        ))}
      </Grid>

      <Column as="section" gap="16" aria-labelledby="recent-heading">
        <Heading as="h2" id="recent-heading" textVariant="display-strong-xs">
          Recently updated
        </Heading>
        <Column background="surface" border radius="l" as="ul" margin="0" padding="0">
          {recentProjects.map((project, index) => (
            <Row
              as="li"
              key={project.key}
              padding="16"
              gap="16"
              vertical="center"
              horizontal="between"
              wrap
              borderTop={index > 0}
            >
              <Column gap="2" flex={1} minWidth="12rem">
                <Text textVariant="label-strong-m">{project.name}</Text>
                <Text textVariant="body-default-xs" onBackground="neutral-weak">
                  {project.key} · {project.issues} open issues · updated {formatDate(project.updated)}
                </Text>
              </Column>
              <StatusTag status={project.status} />
            </Row>
          ))}
        </Column>
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          Tip: press the search button above to jump anywhere or run a quick action.
        </Text>
      </Column>
    </Column>
  );
}
