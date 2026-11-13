import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Column, Grid, Heading, Row, SmartLink, Text } from "@once-ui-system/core";
import { MemberAvatar } from "@/components/team/MemberAvatar";
import { RoleBadge, StatusBadge } from "@/components/team/MemberBadges";
import { activity, formatDate, getMember, members, roleDescriptions } from "@/lib/data";

type PageProps = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return members.map((m) => ({ id: m.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const member = getMember(id);
  return {
    title: member ? `${member.name} · Team · Lumen` : "Member not found · Lumen",
    description: member
      ? `${member.name}'s profile, role and recent activity in the Acme Labs workspace.`
      : undefined,
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const member = getMember(id);
  if (!member) notFound();

  const items = activity[member.id] ?? [];

  return (
    <Column as="main" id="main" fillWidth horizontal="center" paddingX="24" paddingY="40">
      <Column fillWidth maxWidth="m" gap="32">
        <SmartLink href="/" prefixIcon="chevronLeft">
          Back to team
        </SmartLink>

        <Row gap="20" vertical="center" s={{ direction: "column", vertical: "start" }}>
          <MemberAvatar name={member.name} size="xl" />
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

        <Column as="section" aria-labelledby="details-heading" gap="16">
          <Heading as="h2" id="details-heading" variant="heading-strong-l">
            Details
          </Heading>
          <Grid
            columns="3"
            s={{ columns: 1 }}
            m={{ columns: 1 }}
            gap="16"
            background="surface"
            border
            radius="l"
            padding="24"
          >
            <Column gap="4">
              <Text variant="label-default-s" onBackground="neutral-weak">
                Role
              </Text>
              <Text variant="body-strong-m">{member.role}</Text>
              <Text variant="body-default-s" onBackground="neutral-weak">
                {roleDescriptions[member.role]}
              </Text>
            </Column>
            <Column gap="4">
              <Text variant="label-default-s" onBackground="neutral-weak">
                Status
              </Text>
              <Text variant="body-strong-m">{member.status}</Text>
            </Column>
            <Column gap="4">
              <Text variant="label-default-s" onBackground="neutral-weak">
                Joined
              </Text>
              <Text variant="body-strong-m">{formatDate(member.joined)}</Text>
            </Column>
          </Grid>
        </Column>

        <Column as="section" aria-labelledby="activity-heading" gap="16">
          <Heading as="h2" id="activity-heading" variant="heading-strong-l">
            Recent activity
          </Heading>
          {items.length === 0 ? (
            <Column background="surface" border radius="l" padding="24">
              <Text variant="body-default-s" onBackground="neutral-weak">
                {member.status === "Invited"
                  ? `${member.name} hasn't accepted the invite yet, so there's no activity to show.`
                  : "No recent activity."}
              </Text>
            </Column>
          ) : (
            <Column
              as="ul"
              background="surface"
              border
              radius="l"
              margin="0"
              padding="0"
              style={{ listStyle: "none" }}
            >
              {items.map((item, index) => (
                <Row
                  as="li"
                  key={item.id}
                  paddingX="24"
                  paddingY="16"
                  gap="16"
                  horizontal="between"
                  vertical="center"
                  s={{ direction: "column", horizontal: "start", vertical: "start", gap: "4" }}
                  borderTop={index > 0}
                >
                  <Text variant="body-default-m">{item.text}</Text>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    <time dateTime={item.date}>{formatDate(item.date)}</time>
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
