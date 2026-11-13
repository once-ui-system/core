"use client";

import { Button, Column, Grid, Heading, Icon, Row, Tag, Text } from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";
import { formatDate, members, projects, recentProjects } from "@/lib/data";
import type { ProjectStatus } from "@/lib/data";
import { PageHeader } from "./PageHeader";
import { useLumen } from "./LumenProvider";

const statusScheme: Record<ProjectStatus, "success" | "warning" | "neutral"> = {
  Active: "success",
  Paused: "warning",
  Archived: "neutral",
};

export function DashboardView() {
  const { openCreate, openInvite, openPalette } = useLumen();

  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const activeProjects = projects.filter((p) => p.status === "Active").length;
  const activeMembers = members.filter((m) => m.status === "Active").length;
  const pendingInvites = members.filter((m) => m.status === "Invited").length;

  const stats: { label: string; value: number; note: string; icon: IconName }[] = [
    { label: "Open issues", value: openIssues, note: "Across all projects", icon: "checkbox" },
    { label: "Active projects", value: activeProjects, note: `${projects.length} in total`, icon: "folder" },
    { label: "Active members", value: activeMembers, note: `${members.length} seats used`, icon: "people" },
    { label: "Pending invites", value: pendingInvites, note: "Waiting to accept", icon: "mail" },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="A quick look at how your team is doing this week."
        actions={
          <Row gap="8" wrap>
            <Button variant="secondary" size="s" prefixIcon="mail" label="Invite member" onClick={openInvite} />
            <Button size="s" prefixIcon="plus" label="Create project" onClick={openCreate} />
          </Row>
        }
      />

      <Grid columns="4" m={{ columns: 2 }} s={{ columns: 1 }} gap="16" fillWidth>
        {stats.map((stat) => (
          <Column key={stat.label} background="page" border radius="l" padding="20" gap="12">
            <Row gap="8" vertical="center">
              <Icon name={stat.icon} size="s" onBackground="neutral-weak" />
              <Text variant="label-default-s" onBackground="neutral-weak">
                {stat.label}
              </Text>
            </Row>
            <Text variant="display-strong-s">{stat.value}</Text>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              {stat.note}
            </Text>
          </Column>
        ))}
      </Grid>

      <Column gap="16" fillWidth>
        <Heading as="h2" variant="heading-strong-l">
          Recently updated
        </Heading>
        <Column background="page" border radius="l" fillWidth>
          {recentProjects.map((p, index) => (
            <Row
              key={p.key}
              fillWidth
              padding="16"
              gap="16"
              vertical="center"
              horizontal="between"
              borderTop={index > 0}
            >
              <Column gap="2" flex={1} minWidth={8}>
                <Text variant="label-strong-m">{p.name}</Text>
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  {p.key} · updated {formatDate(p.updated)}
                </Text>
              </Column>
              <Tag scheme={statusScheme[p.status]} label={p.status} />
            </Row>
          ))}
        </Column>
        <Row gap="8" vertical="center" wrap>
          <Text variant="body-default-s" onBackground="neutral-weak">
            Jump anywhere with the command palette.
          </Text>
          <Button variant="tertiary" size="s" label="Open palette" onClick={openPalette} />
        </Row>
      </Column>
    </>
  );
}
