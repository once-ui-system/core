import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Avatar, Button, Column, Grid, Heading, Row, Text } from "@once-ui-system/core";
import { RoleBadge, StatusBadge } from "@/components/Badges";
import { formatDate, getActivity, getInitials, getMember, members } from "@/lib/data";

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return members.map((member) => ({ id: member.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const member = getMember(id);
  return { title: member ? `${member.name} · Team · Lumen` : "Member not found · Lumen" };
}

export default async function MemberPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const member = getMember(id);
  if (!member) notFound();

  const activity = getActivity(member.id);

  return (
    <Column as="main" fillWidth horizontal="center" paddingY="48" paddingX="16">
      <Column maxWidth="m" fillWidth gap="32">
        <Row>
          <Button href="/" variant="tertiary" size="s" prefixIcon="chevronLeft">
            Back to team
          </Button>
        </Row>

        <Row
          fillWidth
          gap="24"
          vertical="center"
          s={{ direction: "column", horizontal: "start", vertical: "start" }}
        >
          <Avatar size="xl" value={getInitials(member.name)} />
          <Column gap="8">
            <Heading as="h1" textVariant="display-strong-xs">
              {member.name}
            </Heading>
            <Text textVariant="body-default-m" onBackground="neutral-weak">
              {member.email}
            </Text>
            <Row gap="8" wrap>
              <RoleBadge role={member.role} />
              <StatusBadge status={member.status} />
            </Row>
          </Column>
        </Row>

        <Column background="surface" border radius="l" padding="24" gap="16" as="section" aria-labelledby="profile-heading">
          <Heading as="h2" id="profile-heading" textVariant="heading-strong-m">
            Profile
          </Heading>
          <Grid as="dl" columns="2" s={{ columns: 1 }} gap="24" margin="0">
            <Column gap="4">
              <Text as="dt" textVariant="label-default-s" onBackground="neutral-weak">
                Role
              </Text>
              <Text as="dd" textVariant="body-default-m" style={{ margin: 0 }}>
                {member.role}
              </Text>
            </Column>
            <Column gap="4">
              <Text as="dt" textVariant="label-default-s" onBackground="neutral-weak">
                Status
              </Text>
              <Text as="dd" textVariant="body-default-m" style={{ margin: 0 }}>
                {member.status}
              </Text>
            </Column>
            <Column gap="4">
              <Text as="dt" textVariant="label-default-s" onBackground="neutral-weak">
                Joined
              </Text>
              <Text as="dd" textVariant="body-default-m" style={{ margin: 0 }}>
                {member.joined ? formatDate(member.joined) : "Invitation pending"}
              </Text>
            </Column>
            <Column gap="4">
              <Text as="dt" textVariant="label-default-s" onBackground="neutral-weak">
                Email
              </Text>
              <Text as="dd" textVariant="body-default-m" style={{ margin: 0 }}>
                {member.email}
              </Text>
            </Column>
          </Grid>
        </Column>

        <Column background="surface" border radius="l" padding="24" gap="16" as="section" aria-labelledby="activity-heading">
          <Heading as="h2" id="activity-heading" textVariant="heading-strong-m">
            Recent activity
          </Heading>
          {activity.length === 0 ? (
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              No activity yet. Activity will appear here once {member.name.split(" ")[0]} joins the
              workspace.
            </Text>
          ) : (
            <Column as="ul" gap="16" margin="0" padding="0">
              {activity.map((item) => (
                <Row
                  as="li"
                  key={item.id}
                  gap="16"
                  horizontal="between"
                  vertical="start"
                  borderBottom
                  paddingBottom="16"
                  s={{ direction: "column", gap: "4" }}
                >
                  <Column gap="4">
                    <Text textVariant="label-strong-m">{item.summary}</Text>
                    <Text textVariant="body-default-s" onBackground="neutral-weak">
                      {item.detail}
                    </Text>
                  </Column>
                  <Text textVariant="body-default-xs" onBackground="neutral-weak">
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
