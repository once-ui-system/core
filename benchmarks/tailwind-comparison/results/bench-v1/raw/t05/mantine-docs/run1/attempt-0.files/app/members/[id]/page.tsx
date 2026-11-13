import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Anchor,
  Badge,
  Box,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Timeline,
  TimelineItem,
  Title,
} from "@mantine/core";
import { IconArrowLeft, IconClockHour4 } from "@tabler/icons-react";
import { MemberAvatar } from "@/components/member-avatar";
import {
  ROLE_COLORS,
  ROLE_DESCRIPTIONS,
  STATUS_COLORS,
  activityByMember,
  formatDate,
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: 0.8 }}>
        {label}
      </Text>
      <Box mt={6}>{children}</Box>
    </Box>
  );
}

export default async function MemberPage({ params }: PageProps) {
  const { id } = await params;
  const member = getMember(id);
  if (!member) notFound();

  const activity = activityByMember[member.id] ?? [];

  return (
    <main>
      <Box maw={880} mx="auto" px={{ base: "md", sm: "xl" }} py={{ base: "lg", sm: 40 }}>
        <Stack gap="lg">
          <Anchor component={Link} href="/" size="sm" c="dimmed">
            <Group gap={6} wrap="nowrap" component="span" display="inline-flex">
              <IconArrowLeft size={16} aria-hidden="true" />
              Back to team
            </Group>
          </Anchor>

          <Card withBorder radius="md" padding="lg">
            <Group gap="lg" wrap="nowrap" align="center">
              <MemberAvatar name={member.name} role={member.role} size={72} />
              <Box miw={0}>
                <Title order={1} size="h2">
                  {member.name}
                </Title>
                <Text c="dimmed" size="sm" style={{ overflowWrap: "anywhere" }}>
                  {member.email}
                </Text>
                <Group gap="xs" mt="sm">
                  <Badge color={ROLE_COLORS[member.role]} variant="light">
                    {member.role}
                  </Badge>
                  <Badge color={STATUS_COLORS[member.status]} variant="dot">
                    {member.status}
                  </Badge>
                </Group>
              </Box>
            </Group>
          </Card>

          <Card withBorder radius="md" padding="lg" component="section" aria-labelledby="profile-heading">
            <Title order={2} size="h4" id="profile-heading" mb="md">
              Profile
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
              <Field label="Role">
                <Text size="sm" fw={600}>
                  {member.role}
                </Text>
                <Text size="sm" c="dimmed">
                  {ROLE_DESCRIPTIONS[member.role]}
                </Text>
              </Field>
              <Field label="Status">
                <Text size="sm" fw={600}>
                  {member.status}
                </Text>
                <Text size="sm" c="dimmed">
                  {member.status === "Active" && "Has accepted the invitation and can sign in."}
                  {member.status === "Invited" && "Invitation sent and waiting to be accepted."}
                  {member.status === "Suspended" && "Access is paused until an admin restores it."}
                </Text>
              </Field>
              <Field label="Joined">
                <Text size="sm" fw={600}>
                  {formatDate(member.joined)}
                </Text>
              </Field>
              <Field label="Email">
                <Text size="sm" fw={600} style={{ overflowWrap: "anywhere" }}>
                  {member.email}
                </Text>
              </Field>
            </SimpleGrid>
          </Card>

          <Card withBorder radius="md" padding="lg" component="section" aria-labelledby="activity-heading">
            <Title order={2} size="h4" id="activity-heading" mb="md">
              Recent activity
            </Title>
            {activity.length > 0 ? (
              <Timeline bulletSize={22} lineWidth={2} active={activity.length - 1} color="indigo">
                {activity.map((item) => (
                  <TimelineItem
                    key={`${item.title}-${item.when}`}
                    title={item.title}
                    bullet={<IconClockHour4 size={12} aria-hidden="true" />}
                  >
                    <Text c="dimmed" size="sm">
                      {item.detail}
                    </Text>
                    <Text size="xs" mt={4} c="dimmed">
                      {item.when}
                    </Text>
                  </TimelineItem>
                ))}
              </Timeline>
            ) : (
              <Text c="dimmed" size="sm">
                No activity yet. Activity will appear here once {member.name} accepts the invitation
                and starts using Lumen.
              </Text>
            )}
          </Card>
        </Stack>
      </Box>
    </main>
  );
}
