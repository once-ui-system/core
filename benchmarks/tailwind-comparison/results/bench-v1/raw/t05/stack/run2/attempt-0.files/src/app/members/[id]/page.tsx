import { Avatar, Breadcrumbs, Button, Column, Grid, Heading, Row, Text } from "@once-ui-system/core";
import { notFound } from "next/navigation";
import { RoleBadge, StatusBadge } from "@/components/team/badges";
import { TeamShell } from "@/components/team/TeamShell";
import {
  formatDate,
  getActivity,
  getInitials,
  getMember,
  initialMembers,
  roleDescriptions,
} from "@/lib/data";

export function generateStaticParams() {
  return initialMembers.map((member) => ({ id: member.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = getMember(id);
  return {
    title: member ? `${member.name} · Team · Lumen` : "Member not found · Lumen",
  };
}

export default async function MemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = getMember(id);
  if (!member) notFound();

  const activity = getActivity(member.id);

  return (
    <TeamShell>
      <Column maxWidth="m" fillWidth gap="32">
        <Breadcrumbs
          aria-label="Breadcrumb"
          items={[
            { label: "Team", href: "/" },
            { label: member.name },
          ]}
        />

        <Row gap="24" vertical="center" s={{ direction: "column", vertical: "start" }}>
          <Avatar size="xl" value={getInitials(member.name)} />
          <Column gap="8">
            <Heading as="h1" variant="display-strong-xs">
              {member.name}
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              {member.email}
            </Text>
            <Row gap="8" wrap>
              <RoleBadge role={member.role} />
              <StatusBadge status={member.status} />
            </Row>
          </Column>
        </Row>

        <Column as="section" aria-labelledby="profile-heading" gap="16">
          <Heading as="h2" id="profile-heading" variant="heading-strong-l">
            Profile
          </Heading>
          <Grid columns="2" s={{ columns: 1 }} gap="16">
            <Column background="surface" border radius="l" padding="20" gap="4">
              <Text variant="label-default-xs" onBackground="neutral-weak">
                Role
              </Text>
              <Text variant="heading-strong-s">{member.role}</Text>
              <Text variant="body-default-s" onBackground="neutral-weak">
                {roleDescriptions[member.role]}
              </Text>
            </Column>
            <Column background="surface" border radius="l" padding="20" gap="4">
              <Text variant="label-default-xs" onBackground="neutral-weak">
                Status
              </Text>
              <Text variant="heading-strong-s">{member.status}</Text>
              <Text variant="body-default-s" onBackground="neutral-weak">
                {member.status === "Active" && "Has access to the workspace."}
                {member.status === "Invited" && "Invitation sent, waiting for them to accept."}
                {member.status === "Suspended" && "Access is paused until an admin restores it."}
              </Text>
            </Column>
            <Column background="surface" border radius="l" padding="20" gap="4">
              <Text variant="label-default-xs" onBackground="neutral-weak">
                Joined
              </Text>
              <Text variant="heading-strong-s">{formatDate(member.joined)}</Text>
            </Column>
            <Column background="surface" border radius="l" padding="20" gap="4">
              <Text variant="label-default-xs" onBackground="neutral-weak">
                Email
              </Text>
              <Text variant="heading-strong-s">{member.email}</Text>
            </Column>
          </Grid>
        </Column>

        <Column as="section" aria-labelledby="activity-heading" gap="16">
          <Heading as="h2" id="activity-heading" variant="heading-strong-l">
            Recent activity
          </Heading>
          {activity.length === 0 ? (
            <Column background="surface" border radius="l" padding="24">
              <Text variant="body-default-s" onBackground="neutral-weak">
                {member.status === "Invited"
                  ? "No activity yet. Activity appears here once they accept the invite."
                  : "No recent activity."}
              </Text>
            </Column>
          ) : (
            <Column as="ol" background="surface" border radius="l" margin="0" padding="0">
              {activity.map((item, index) => (
                <Column
                  as="li"
                  key={item.id}
                  gap="4"
                  padding="20"
                  borderTop={index > 0}
                  style={{ listStyle: "none" }}
                >
                  <Text variant="label-strong-s">{item.summary}</Text>
                  <Row gap="8" wrap>
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      {item.detail}
                    </Text>
                    <Text variant="body-default-xs" onBackground="neutral-weak" aria-hidden="true">
                      ·
                    </Text>
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      {formatDate(item.date)}
                    </Text>
                  </Row>
                </Column>
              ))}
            </Column>
          )}
        </Column>

        <Row>
          <Button href="/" variant="secondary" prefixIcon="arrowLeft">
            Back to team
          </Button>
        </Row>
      </Column>
    </TeamShell>
  );
}
