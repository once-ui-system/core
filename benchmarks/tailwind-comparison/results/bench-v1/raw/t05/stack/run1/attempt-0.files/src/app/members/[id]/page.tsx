import {
  Avatar,
  Button,
  Column,
  Grid,
  Heading,
  Row,
  Text,
} from "@once-ui-system/core";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RoleBadge, StatusBadge } from "@/components/MemberBadges";
import {
  formatDate,
  getActivity,
  getInitials,
  getMember,
  members,
} from "@/lib/data";

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return members.map((m) => ({ id: m.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const member = getMember(id);
  return {
    title: member ? `${member.name} · Team · Lumen` : "Member not found · Lumen",
    description: member
      ? `${member.name}'s profile, role and recent activity in Lumen.`
      : undefined,
  };
}

export default async function MemberPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const member = getMember(id);
  if (!member) notFound();

  const activity = getActivity(member.id);

  return (
    <Column
      as="main"
      id="main"
      fillWidth
      horizontal="center"
      paddingY="48"
      paddingX="24"
      s={{ paddingX: "16", paddingY: "24" }}
    >
      <Column maxWidth="m" gap="24">
        <Row>
          <Button href="/" variant="tertiary" size="s" prefixIcon="arrowLeft">
            Back to team
          </Button>
        </Row>

        <Row gap="20" vertical="center" s={{ direction: "column", horizontal: "start", vertical: "start" }}>
          <Avatar size="xl" value={getInitials(member.name)} />
          <Column gap="8">
            <Heading as="h1" variant="display-strong-xs">
              {member.name}
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-weak">
              {member.email}
            </Text>
            <Row gap="8" wrap>
              <RoleBadge role={member.role} />
              <StatusBadge status={member.status} />
            </Row>
          </Column>
        </Row>

        <Column background="surface" border radius="l" padding="24" gap="16">
          <Heading as="h2" variant="heading-strong-m">
            Profile
          </Heading>
          <Grid columns="3" s={{ columns: 1 }} gap="16" as="dl" margin="0">
            <Column gap="4">
              <Text as="dt" variant="label-default-xs" onBackground="neutral-weak">
                Role
              </Text>
              <Text as="dd" variant="body-default-s" style={{ margin: 0 }}>
                {member.role}
              </Text>
            </Column>
            <Column gap="4">
              <Text as="dt" variant="label-default-xs" onBackground="neutral-weak">
                Status
              </Text>
              <Text as="dd" variant="body-default-s" style={{ margin: 0 }}>
                {member.status}
              </Text>
            </Column>
            <Column gap="4">
              <Text as="dt" variant="label-default-xs" onBackground="neutral-weak">
                Joined
              </Text>
              <Text as="dd" variant="body-default-s" style={{ margin: 0 }}>
                {member.joined ? formatDate(member.joined) : "Hasn't accepted the invite yet"}
              </Text>
            </Column>
          </Grid>
        </Column>

        <Column background="surface" border radius="l" padding="24" gap="16">
          <Heading as="h2" variant="heading-strong-m">
            Recent activity
          </Heading>
          {activity.length === 0 ? (
            <Text variant="body-default-s" onBackground="neutral-weak">
              No activity yet. Activity shows up here once {member.name.split(" ")[0]} starts
              using the workspace.
            </Text>
          ) : (
            <Column as="ul" gap="12" margin="0" padding="0" style={{ listStyle: "none" }}>
              {activity.map((item) => (
                <Row
                  as="li"
                  key={item.id}
                  horizontal="between"
                  vertical="start"
                  gap="16"
                  paddingBottom="12"
                  borderBottom="neutral-alpha-weak"
                  s={{ direction: "column", gap: "4" }}
                >
                  <Text variant="body-default-s">{item.text}</Text>
                  <Text variant="body-default-xs" onBackground="neutral-weak">
                    {item.when}
                  </Text>
                </Row>
              ))}
            </Column>
          )}
        </Column>
      </Column>
    </Column>
  );
}
