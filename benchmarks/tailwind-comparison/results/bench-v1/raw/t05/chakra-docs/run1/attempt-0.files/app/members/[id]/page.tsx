import {
  Box,
  Card,
  Flex,
  Grid,
  Heading,
  Text,
  Timeline,
} from "@chakra-ui/react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LuActivity, LuArrowLeft } from "react-icons/lu";
import { AppShell } from "@/components/app-shell";
import { RoleBadge, StatusBadge } from "@/components/member-badges";
import { Avatar } from "@/components/ui/avatar";
import { DataListItem, DataListRoot } from "@/components/ui/data-list";
import {
  ROLE_DESCRIPTIONS,
  formatDate,
  getActivity,
  getMember,
  members,
} from "@/lib/data";

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return members.map((m) => ({ id: m.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const member = getMember(id);
  return { title: member ? `${member.name} · Team · Lumen` : "Member not found · Lumen" };
}

export default async function MemberPage({ params }: PageProps) {
  const { id } = await params;
  const member = getMember(id);
  if (!member) notFound();

  const activity = getActivity(member.id);

  return (
    <AppShell>
      <Box mb="4">
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <LuArrowLeft aria-hidden="true" />
          <Text as="span" fontSize="sm" fontWeight="medium">
            Back to team
          </Text>
        </Link>
      </Box>

      <Flex
        direction={{ base: "column", sm: "row" }}
        align={{ base: "flex-start", sm: "center" }}
        gap="4"
        mb="6"
      >
        <Avatar name={member.name} size="2xl" />
        <Box minW="0">
          <Heading as="h1" size={{ base: "xl", md: "2xl" }}>
            {member.name}
          </Heading>
          <Text color="fg.muted" mb="2" wordBreak="break-all">
            {member.email}
          </Text>
          <Flex gap="2" wrap="wrap">
            <RoleBadge role={member.role} />
            <StatusBadge status={member.status} />
          </Flex>
        </Box>
      </Flex>

      <Grid templateColumns={{ base: "1fr", lg: "1fr 1.4fr" }} gap="6" alignItems="start">
        <Card.Root>
          <Card.Header>
            <Card.Title as="h2">Profile</Card.Title>
          </Card.Header>
          <Card.Body>
            <DataListRoot orientation="horizontal" gap="4">
              <DataListItem label="Email" value={<Text wordBreak="break-all">{member.email}</Text>} />
              <DataListItem label="Role" value={<RoleBadge role={member.role} />} />
              <DataListItem label="Status" value={<StatusBadge status={member.status} />} />
              <DataListItem label="Joined" value={formatDate(member.joined)} />
              <DataListItem label="Access" value={ROLE_DESCRIPTIONS[member.role]} />
            </DataListRoot>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Header>
            <Card.Title as="h2">Recent activity</Card.Title>
          </Card.Header>
          <Card.Body>
            {activity.length === 0 ? (
              <Text color="fg.muted">No activity yet.</Text>
            ) : (
              <Timeline.Root size="md" variant="subtle">
                {activity.map((item) => (
                  <Timeline.Item key={item.id}>
                    <Timeline.Connector>
                      <Timeline.Separator />
                      <Timeline.Indicator>
                        <LuActivity aria-hidden="true" />
                      </Timeline.Indicator>
                    </Timeline.Connector>
                    <Timeline.Content>
                      <Timeline.Title>{item.text}</Timeline.Title>
                      {item.detail ? (
                        <Text color="fg.muted" fontSize="sm">
                          {item.detail}
                        </Text>
                      ) : null}
                      <Timeline.Description>{item.when}</Timeline.Description>
                    </Timeline.Content>
                  </Timeline.Item>
                ))}
              </Timeline.Root>
            )}
          </Card.Body>
        </Card.Root>
      </Grid>
    </AppShell>
  );
}
