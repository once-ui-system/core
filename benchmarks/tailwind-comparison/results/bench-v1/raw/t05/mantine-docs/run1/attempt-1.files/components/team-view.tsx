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
                <Table.Caption style={srOnly}>
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
