import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Column, Heading, Row, Text } from "@once-ui-system/core";
import { Button } from "@once-ui-system/core/components/Button";
import { MemberAvatar } from "@/components/MemberAvatar";
import { RoleBadge, StatusBadge } from "@/components/MemberBadges";
import {
  ROLE_DESCRIPTIONS,
  activity,
  formatDate,
  getMember,
  members,
} from "@/lib/data";

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

  const recent = activity[member.id] ?? [];

  return (
    <Column
      as="main"
      id="main"
      fillWidth
      horizontal="center"
      paddingY="48"
      paddingX="24"
      s={{ paddingY: "24", paddingX: "16" }}
    >
      <Column maxWidth="m" gap="32">
        <Row>
          <Button href="/" variant="tertiary" size="s" prefixIcon="chevronLeft">
            Back to team
          </Button>
        </Row>

        <Row gap="24" vertical="center" s={{ direction: "column", vertical: "start" }}>
          <MemberAvatar name={member.name} size="xl" />
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

        <Column
          as="section"
          aria-labelledby="profile-heading"
          background="surface"
          border
          radius="l"
          padding="24"
          gap="16"
          s={{ padding: "16" }}
        >
          <Heading as="h2" id="profile-heading" textVariant="heading-strong-l">
            Profile
          </Heading>
          <dl
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))",
              gap: "1rem 1.5rem",
              margin: 0,
            }}
          >
            <DetailItem term="Role" value={member.role} />
            <DetailItem term="Status" value={member.status} />
            <DetailItem
              term="Joined"
              value={member.joined ? formatDate(member.joined) : "Invitation pending"}
            />
            <DetailItem term="Email" value={member.email} />
          </dl>
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            {member.role}: {ROLE_DESCRIPTIONS[member.role]}
          </Text>
        </Column>

        <Column
          as="section"
          aria-labelledby="activity-heading"
          background="surface"
          border
          radius="l"
          padding="24"
          gap="16"
          s={{ padding: "16" }}
        >
          <Heading as="h2" id="activity-heading" textVariant="heading-strong-l">
            Recent activity
          </Heading>
          {recent.length === 0 ? (
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              {member.status === "Invited"
                ? `${member.name} hasn't accepted the invitation yet, so there's no activity to show.`
                : "No recent activity."}
            </Text>
          ) : (
            <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "1rem" }}>
              {recent.map((item) => (
                <li
                  key={item.id}
                  style={{
                    display: "grid",
                    gap: "0.25rem",
                    paddingBottom: "1rem",
                    borderBottom: "1px solid var(--neutral-alpha-weak)",
                  }}
                >
                  <Text textVariant="label-strong-m">{item.summary}</Text>
                  <Text textVariant="body-default-s" onBackground="neutral-weak">
                    {item.detail}
                  </Text>
                  <Text as="time" textVariant="body-default-xs" onBackground="neutral-weak">
                    {formatDate(item.date)}
                  </Text>
                </li>
              ))}
            </ol>
          )}
        </Column>
      </Column>
    </Column>
  );
}

function DetailItem({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt style={{ fontSize: "0.8125rem", color: "var(--neutral-on-background-weak)" }}>{term}</dt>
      <dd style={{ margin: "0.25rem 0 0", fontWeight: 600 }}>{value}</dd>
    </div>
  );
}
