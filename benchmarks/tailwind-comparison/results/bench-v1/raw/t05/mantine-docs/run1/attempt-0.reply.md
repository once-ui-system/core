Now I'll write the files. First the data:

**lib/data.ts**: members, types, badge colors, activity per member, and helpers.

**components/**: `team-view.tsx`, `invite-modal.tsx`, `member-avatar.tsx`.

**app/**: `page.tsx` and `members/[id]/page.tsx`.

Two decisions for the activity data: it is keyed by member id, and `Invited` members have none, which the detail page handles with an empty state instead of a fabricated timeline. Dates are formatted with a fixed UTC `Intl` formatter so server and client render identically.

```ts lib/data.ts
export type Role = "Owner" | "Admin" | "Member" | "Viewer";
export type Status = "Active" | "Invited" | "Suspended";

export interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  joined: string | null;
}

export interface ActivityItem {
  title: string;
  detail: string;
  when: string;
}

export const PRODUCT_NAME = "Lumen";

export const ROLES: Role[] = ["Owner", "Admin", "Member", "Viewer"];

/** Roles that can be assigned to someone else (there is a single Owner). */
export const ASSIGNABLE_ROLES: Role[] = ["Admin", "Member", "Viewer"];

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  Owner: "Full access, billing and workspace deletion",
  Admin: "Manage members, projects and integrations",
  Member: "Create and edit issues, dashboards and reports",
  Viewer: "Read-only access to dashboards and issues",
};

export const ROLE_COLORS: Record<Role, string> = {
  Owner: "grape",
  Admin: "indigo",
  Member: "teal",
  Viewer: "gray",
};

export const STATUS_COLORS: Record<Status, string> = {
  Active: "green",
  Invited: "yellow",
  Suspended: "red",
};

export const members: Member[] = [
  {
    id: "m-01",
    name: "Maya Okafor",
    email: "maya@acmelabs.io",
    role: "Owner",
    status: "Active",
    joined: "2024-03-02",
  },
  {
    id: "m-02",
    name: "Daniel Reyes",
    email: "daniel@acmelabs.io",
    role: "Admin",
    status: "Active",
    joined: "2024-05-19",
  },
  {
    id: "m-03",
    name: "Priya Natarajan",
    email: "priya@acmelabs.io",
    role: "Member",
    status: "Active",
    joined: "2024-11-07",
  },
  {
    id: "m-04",
    name: "Tomás Lindqvist",
    email: "tomas@acmelabs.io",
    role: "Member",
    status: "Active",
    joined: "2025-02-14",
  },
  {
    id: "m-05",
    name: "Hana Sato",
    email: "hana@acmelabs.io",
    role: "Member",
    status: "Invited",
    joined: null,
  },
  {
    id: "m-06",
    name: "Grace Mensah",
    email: "grace@acmelabs.io",
    role: "Viewer",
    status: "Active",
    joined: "2025-06-30",
  },
  {
    id: "m-07",
    name: "Leo Brandt",
    email: "leo@acmelabs.io",
    role: "Member",
    status: "Suspended",
    joined: "2025-01-21",
  },
  {
    id: "m-08",
    name: "Ines Duarte",
    email: "ines@acmelabs.io",
    role: "Viewer",
    status: "Invited",
    joined: null,
  },
];

export const activityByMember: Record<string, ActivityItem[]> = {
  "m-01": [
    {
      title: "Updated workspace billing plan",
      detail: "Switched Acme Labs to the Team plan with 12 seats",
      when: "Today, 09:12",
    },
    {
      title: "Created dashboard “Weekly retention”",
      detail: "Added 4 charts tracking activation and week-over-week retention",
      when: "Yesterday, 16:40",
    },
    {
      title: "Invited Ines Duarte as Viewer",
      detail: "Invitation sent to ines@acmelabs.io",
      when: "3 days ago",
    },
  ],
  "m-02": [
    {
      title: "Closed issue LUM-212 “Funnel drops off at step 3”",
      detail: "Fixed a tracking bug in the onboarding checkout events",
      when: "Today, 11:05",
    },
    {
      title: "Changed Tomás Lindqvist's role to Member",
      detail: "Role updated from Viewer to Member",
      when: "Yesterday, 14:22",
    },
    {
      title: "Connected the Slack integration",
      detail: "Daily digests now post to #product-metrics",
      when: "4 days ago",
    },
    {
      title: "Resent invitation to Hana Sato",
      detail: "Invitation sent to hana@acmelabs.io",
      when: "Last week",
    },
  ],
  "m-03": [
    {
      title: "Commented on LUM-231 “Session replay is laggy”",
      detail: "Shared a HAR export and reproduction steps",
      when: "Today, 10:31",
    },
    {
      title: "Saved report “Feature adoption by cohort”",
      detail: "Filtered to accounts created since September",
      when: "2 days ago",
    },
  ],
  "m-04": [
    {
      title: "Opened issue LUM-244 “CSV export times out”",
      detail: "Exports above 50k rows fail after 30 seconds",
      when: "Yesterday, 08:50",
    },
    {
      title: "Created segment “Power users”",
      detail: "Users with 10+ sessions in the last 14 days",
      when: "5 days ago",
    },
  ],
  "m-05": [],
  "m-06": [
    {
      title: "Viewed dashboard “Weekly retention”",
      detail: "Read-only access via Viewer role",
      when: "Today, 08:03",
    },
    {
      title: "Viewed report “Feature adoption by cohort”",
      detail: "Read-only access via Viewer role",
      when: "3 days ago",
    },
  ],
  "m-07": [
    {
      title: "Account suspended by Maya Okafor",
      detail: "Access paused while a security review is completed",
      when: "2 weeks ago",
    },
    {
      title: "Merged LUM-198 “Rename events table columns”",
      detail: "Schema migration shipped to production",
      when: "3 weeks ago",
    },
  ],
  "m-08": [],
};

export function getMember(id: string): Member | undefined {
  return members.find((m) => m.id === id);
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

export function formatDate(iso: string | null): string {
  if (!iso) return "Not joined yet";
  return dateFormatter.format(new Date(`${iso}T00:00:00Z`));
}

/** Derive a display name from an email local part, e.g. "ana.silva@x.io" -> "Ana Silva". */
export function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  const words = local.split(/[._-]+/).filter(Boolean);
  if (words.length === 0) return email;
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}
```

```tsx components/member-avatar.tsx
import { Avatar } from "@mantine/core";
import { getInitials, type Role } from "@/lib/data";
import { ROLE_COLORS } from "@/lib/data";

interface MemberAvatarProps {
  name: string;
  role: Role;
  size?: number | string;
}

/** No image URLs are loaded from the network, so every member shows initials. */
export function MemberAvatar({ name, role, size = 40 }: MemberAvatarProps) {
  return (
    <Avatar
      size={size}
      radius="xl"
      color={ROLE_COLORS[role]}
      variant="light"
      name={name}
      alt=""
      aria-hidden="true"
    >
      {getInitials(name)}
    </Avatar>
  );
}
```

```tsx components/invite-modal.tsx
"use client";

import { Button, Group, Modal, Select, Stack, Textarea, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { ASSIGNABLE_ROLES, ROLE_DESCRIPTIONS, type Role } from "@/lib/data";

export interface InviteValues {
  email: string;
  role: string;
  message: string;
}

interface InviteModalProps {
  opened: boolean;
  onClose: () => void;
  onInvite: (values: { email: string; role: Role; message: string }) => void;
  existingEmails: string[];
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function InviteModal({ opened, onClose, onInvite, existingEmails }: InviteModalProps) {
  const form = useForm<InviteValues>({
    mode: "uncontrolled",
    initialValues: { email: "", role: "", message: "" },
    validate: {
      email: (value) => {
        const email = value.trim();
        if (!email) return "Email is required";
        if (!EMAIL_PATTERN.test(email)) return "Enter a valid email address, like name@company.com";
        if (existingEmails.includes(email.toLowerCase())) {
          return "This person is already on the team";
        }
        return null;
      },
      role: (value) => (value ? null : "Choose a role for the new member"),
      message: (value) => (value.length > 300 ? "Keep the message under 300 characters" : null),
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleSubmit = form.onSubmit(
    (values) => {
      onInvite({
        email: values.email.trim(),
        role: values.role as Role,
        message: values.message.trim(),
      });
      form.reset();
    },
    (errors) => {
      const firstPath = Object.keys(errors)[0];
      if (firstPath) form.getInputNode(firstPath)?.focus();
    },
  );

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Invite a team member"
      centered
      size="md"
      closeButtonProps={{ "aria-label": "Close invite dialog" }}
    >
      <form onSubmit={handleSubmit} noValidate>
        <Stack gap="md">
          <TextInput
            label="Email address"
            placeholder="name@company.com"
            type="email"
            autoComplete="off"
            withAsterisk
            data-autofocus
            key={form.key("email")}
            {...form.getInputProps("email")}
          />
          <Select
            label="Role"
            placeholder="Select a role"
            withAsterisk
            allowDeselect={false}
            data={ASSIGNABLE_ROLES.map((role) => ({
              value: role,
              label: `${role} – ${ROLE_DESCRIPTIONS[role]}`,
            }))}
            comboboxProps={{ withinPortal: true }}
            key={form.key("role")}
            {...form.getInputProps("role")}
          />
          <Textarea
            label="Personal message"
            description="Optional. Included in the invitation email."
            placeholder="Hi! We're using Lumen to track activation and bugs together."
            autosize
            minRows={3}
            maxRows={6}
            key={form.key("message")}
            {...form.getInputProps("message")}
          />
          <Group justify="flex-end" mt="xs">
            <Button variant="default" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Send invite</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
```

```tsx components/team-view.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ActionIcon,
  Anchor,
  Badge,
  Box,
  Button,
  Card,
  Group,
  Menu,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconCheck,
  IconDots,
  IconMailForward,
  IconSearch,
  IconTrash,
  IconUserPlus,
  IconUserShield,
  IconUsers,
} from "@tabler/icons-react";
import {
  ASSIGNABLE_ROLES,
  ROLE_COLORS,
  ROLES,
  STATUS_COLORS,
  members as initialMembers,
  nameFromEmail,
  type Member,
  type Role,
} from "@/lib/data";
import { InviteModal } from "./invite-modal";
import { MemberAvatar } from "./member-avatar";

const ALL_ROLES = "all";

export function TeamView() {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>(ALL_ROLES);
  const [inviteOpened, invite] = useDisclosure(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      const matchesRole = roleFilter === ALL_ROLES || m.role === roleFilter;
      const matchesQuery =
        !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
      return matchesRole && matchesQuery;
    });
  }, [members, query, roleFilter]);

  const filtersActive = query.trim() !== "" || roleFilter !== ALL_ROLES;

  const changeRole = (member: Member, role: Role) => {
    if (member.role === role) return;
    setMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, role } : m)));
    notifications.show({
      title: "Role updated",
      message: `${member.name} is now ${role === "Admin" ? "an" : "a"} ${role}.`,
      color: "teal",
      icon: <IconCheck size={16} />,
    });
  };

  const resendInvite = (member: Member) => {
    notifications.show({
      title: "Invite sent again",
      message: `A fresh invitation was emailed to ${member.email}.`,
      color: "blue",
      icon: <IconMailForward size={16} />,
    });
  };

  const removeMember = (member: Member) => {
    setMembers((prev) => prev.filter((m) => m.id !== member.id));
    notifications.show({
      title: "Member removed",
      message: `${member.name} no longer has access to Lumen.`,
      color: "red",
      icon: <IconTrash size={16} />,
    });
  };

  const handleInvite = (values: { email: string; role: Role; message: string }) => {
    const nextNumber =
      members.reduce((max, m) => Math.max(max, Number(m.id.replace("m-", "")) || 0), 0) + 1;
    const newMember: Member = {
      id: `m-${String(nextNumber).padStart(2, "0")}`,
      name: nameFromEmail(values.email),
      email: values.email,
      role: values.role,
      status: "Invited",
      joined: null,
    };
    setMembers((prev) => [...prev, newMember]);
    invite.close();
    notifications.show({
      title: "Invitation sent",
      message: `${values.email} was invited as ${values.role === "Admin" ? "an" : "a"} ${values.role}.`,
      color: "teal",
      icon: <IconCheck size={16} />,
    });
  };

  const rows = filtered.map((member) => (
    <Table.Tr key={member.id}>
      <Table.Td>
        <Group gap="sm" wrap="nowrap">
          <MemberAvatar name={member.name} role={member.role} size={38} />
          <Box miw={0}>
            <Anchor
              component={Link}
              href={`/members/${member.id}`}
              fw={600}
              size="sm"
              underline="hover"
              c="inherit"
            >
              {member.name}
            </Anchor>
            <Text size="xs" c="dimmed" hiddenFrom="md" truncate>
              {member.email}
            </Text>
          </Box>
        </Group>
      </Table.Td>
      <Table.Td visibleFrom="md">
        <Text size="sm" c="dimmed">
          {member.email}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge color={ROLE_COLORS[member.role]} variant="light">
          {member.role}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Badge color={STATUS_COLORS[member.status]} variant="dot">
          {member.status}
        </Badge>
      </Table.Td>
      <Table.Td w={56}>
        <Menu position="bottom-end" shadow="md" width={210} withinPortal>
          <Menu.Target>
            <ActionIcon
              variant="subtle"
              color="gray"
              aria-label={`Actions for ${member.name}`}
            >
              <IconDots size={18} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Sub position="left-start" openDelay={80} closeDelay={120}>
              <Menu.Sub.Target>
                <Menu.Sub.Item leftSection={<IconUserShield size={16} />}>
                  Change role
                </Menu.Sub.Item>
              </Menu.Sub.Target>
              <Menu.Sub.Dropdown>
                <Menu.Label>Set role</Menu.Label>
                {(member.role === "Owner" ? ROLES : ASSIGNABLE_ROLES).map((role) => (
                  <Menu.Item
                    key={role}
                    disabled={member.role === "Owner" ? role !== "Owner" : false}
                    rightSection={member.role === role ? <IconCheck size={14} /> : null}
                    onClick={() => changeRole(member, role)}
                  >
                    {role}
                  </Menu.Item>
                ))}
              </Menu.Sub.Dropdown>
            </Menu.Sub>
            {member.status === "Invited" && (
              <Menu.Item
                leftSection={<IconMailForward size={16} />}
                onClick={() => resendInvite(member)}
              >
                Resend invite
              </Menu.Item>
            )}
            <Menu.Divider />
            <Menu.Item
              color="red"
              leftSection={<IconTrash size={16} />}
              onClick={() => removeMember(member)}
            >
              Remove
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Box maw={1040} mx="auto" px={{ base: "md", sm: "xl" }} py={{ base: "lg", sm: 40 }}>
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
          <Box>
            <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: 1 }}>
              Lumen · Acme Labs
            </Text>
            <Title order={1} size="h2" mt={4}>
              Team
            </Title>
            <Text c="dimmed" size="sm" mt={4}>
              {members.length} people have access to your product analytics and issue tracker.
            </Text>
          </Box>
          <Button leftSection={<IconUserPlus size={18} />} onClick={invite.open}>
            Invite member
          </Button>
        </Group>

        <Group gap="sm" align="flex-end" wrap="wrap">
          <TextInput
            label="Search members"
            placeholder="Search by name or email"
            leftSection={<IconSearch size={16} />}
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            style={{ flex: "1 1 240px" }}
          />
          <Select
            label="Role"
            aria-label="Filter by role"
            data={[
              { value: ALL_ROLES, label: "All roles" },
              ...ROLES.map((r) => ({ value: r, label: r })),
            ]}
            value={roleFilter}
            onChange={(value) => setRoleFilter(value ?? ALL_ROLES)}
            allowDeselect={false}
            style={{ flex: "0 1 180px", minWidth: 140 }}
          />
        </Group>

        <Card withBorder padding={0} radius="md">
          {rows.length > 0 ? (
            <Table.ScrollContainer minWidth={440} type="native">
              <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
                <Table.Caption className="visually-hidden-caption" style={srOnly}>
                  Team members of Lumen with their role and status
                </Table.Caption>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th scope="col">Member</Table.Th>
                    <Table.Th scope="col" visibleFrom="md">
                      Email
                    </Table.Th>
                    <Table.Th scope="col">Role</Table.Th>
                    <Table.Th scope="col">Status</Table.Th>
                    <Table.Th scope="col">
                      <span style={srOnly}>Actions</span>
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          ) : (
            <Stack align="center" gap="xs" py={48} px="md">
              <IconUsers size={36} stroke={1.4} aria-hidden="true" />
              <Text fw={600}>No members found</Text>
              <Text c="dimmed" size="sm" ta="center">
                {filtersActive
                  ? "Nothing matches your search and role filter."
                  : "Invite your first teammate to get started."}
              </Text>
              {filtersActive && (
                <Button
                  variant="light"
                  size="xs"
                  onClick={() => {
                    setQuery("");
                    setRoleFilter(ALL_ROLES);
                  }}
                >
                  Clear filters
                </Button>
              )}
            </Stack>
          )}
        </Card>

        <Text size="xs" c="dimmed" role="status" aria-live="polite">
          Showing {filtered.length} of {members.length} members
        </Text>
      </Stack>

      <InviteModal
        opened={inviteOpened}
        onClose={invite.close}
        onInvite={handleInvite}
        existingEmails={members.map((m) => m.email.toLowerCase())}
      />
    </Box>
  );
}

const srOnly: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};
```

```tsx app/page.tsx
import type { Metadata } from "next";
import { TeamView } from "@/components/team-view";

export const metadata: Metadata = {
  title: "Team · Lumen",
  description: "Manage who has access to Lumen, your product analytics and issue tracker.",
};

export default function Page() {
  return (
    <main>
      <TeamView />
    </main>
  );
}
```

```tsx app/members/[id]/page.tsx
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
```