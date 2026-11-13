"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Input,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react";
import Link from "next/link";
import {
  LuMail,
  LuEllipsis,
  LuSearch,
  LuTrash2,
  LuUserCog,
  LuUserPlus,
} from "react-icons/lu";
import { PageHeading } from "@/components/app-shell";
import { ChangeRoleDialog } from "@/components/change-role-dialog";
import { InviteDialog } from "@/components/invite-dialog";
import { RoleBadge, StatusBadge } from "@/components/member-badges";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@/components/ui/menu";
import {
  NativeSelectField,
  NativeSelectRoot,
} from "@/components/ui/native-select";
import { toaster } from "@/components/ui/toaster";
import { ROLES, members as initialMembers, type Member, type Role } from "@/lib/data";

function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function TeamPage() {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [roleTarget, setRoleTarget] = useState<Member | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      const matchesQuery =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q);
      const matchesRole = roleFilter === "all" || m.role === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [members, query, roleFilter]);

  function handleInvite(invite: { email: string; role: Role; message: string }) {
    setMembers((prev) => [
      ...prev,
      {
        id: `m-new-${prev.length + 1}`,
        name: nameFromEmail(invite.email),
        email: invite.email,
        role: invite.role,
        status: "Invited",
        joined: null,
      },
    ]);
    toaster.create({
      title: "Invitation sent",
      description: `${invite.email} was invited as ${invite.role}.`,
      type: "success",
    });
  }

  function handleChangeRole(id: string, role: Role) {
    const target = members.find((m) => m.id === id);
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
    setRoleTarget(null);
    if (target) {
      toaster.create({
        title: "Role updated",
        description: `${target.name} is now ${role}.`,
        type: "success",
      });
    }
  }

  function handleResend(member: Member) {
    toaster.create({
      title: "Invite resent",
      description: `A fresh invitation was sent to ${member.email}.`,
      type: "success",
    });
  }

  function handleRemove(member: Member) {
    setMembers((prev) => prev.filter((m) => m.id !== member.id));
    toaster.create({
      title: "Member removed",
      description: `${member.name} no longer has access to the workspace.`,
      type: "info",
    });
  }

  function clearFilters() {
    setQuery("");
    setRoleFilter("all");
  }

  const isFiltering = query.trim() !== "" || roleFilter !== "all";

  return (
    <>
      <PageHeading
        title="Team"
        description="Manage who can see and work on your Lumen projects."
        actions={
          <Button
            colorPalette="orange"
            onClick={() => setInviteOpen(true)}
            alignSelf={{ base: "stretch", sm: "flex-start" }}
          >
            <LuUserPlus />
            Invite member
          </Button>
        }
      />

      <Box bg="bg" borderWidth="1px" rounded="lg" overflow="hidden">
        <Stack
          direction={{ base: "column", md: "row" }}
          gap="3"
          p="4"
          borderBottomWidth="1px"
          role="search"
          aria-label="Filter members"
        >
          <Field label="Search members" flex="1" minW="0">
            <Box position="relative" w="full">
              <Box
                position="absolute"
                insetStart="3"
                top="0"
                bottom="0"
                display="flex"
                alignItems="center"
                color="fg.muted"
                pointerEvents="none"
                aria-hidden="true"
              >
                <LuSearch />
              </Box>
              <Input
                type="search"
                ps="9"
                placeholder="Search by name or email"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </Box>
          </Field>
          <Field label="Role" w={{ base: "full", md: "52" }}>
            <NativeSelectRoot>
              <NativeSelectField
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All roles</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </NativeSelectField>
            </NativeSelectRoot>
          </Field>
        </Stack>

        <Text srOnly role="status" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "member" : "members"} shown
        </Text>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<LuSearch />}
            title="No members match"
            description="Try a different name or email, or clear the filters."
            py="12"
          >
            {isFiltering ? (
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : null}
          </EmptyState>
        ) : (
          <Table.ScrollArea>
            <Table.Root size="md" interactive>
              <Table.Caption srOnly>Members of the Acme Labs workspace</Table.Caption>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader minW="64">Member</Table.ColumnHeader>
                  <Table.ColumnHeader>Role</Table.ColumnHeader>
                  <Table.ColumnHeader>Status</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="end" w="1">
                    <Text as="span" srOnly>
                      Actions
                    </Text>
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filtered.map((m) => (
                  <Table.Row key={m.id}>
                    <Table.Cell>
                      <HStack gap="3" minW="0">
                        <Avatar name={m.name} size="sm" />
                        <Box minW="0">
                          <Link
                            href={`/members/${m.id}`}
                            style={{ fontWeight: 600 }}
                          >
                            {m.name}
                          </Link>
                          <Text color="fg.muted" fontSize="sm" truncate>
                            {m.email}
                          </Text>
                        </Box>
                      </HStack>
                    </Table.Cell>
                    <Table.Cell>
                      <RoleBadge role={m.role} />
                    </Table.Cell>
                    <Table.Cell>
                      <StatusBadge status={m.status} />
                    </Table.Cell>
                    <Table.Cell textAlign="end">
                      <MenuRoot positioning={{ placement: "bottom-end" }}>
                        <MenuTrigger asChild>
                          <IconButton
                            variant="ghost"
                            size="sm"
                            aria-label={`Actions for ${m.name}`}
                          >
                            <LuEllipsis />
                          </IconButton>
                        </MenuTrigger>
                        <MenuContent>
                          <MenuItem
                            value="change-role"
                            onClick={() => setRoleTarget(m)}
                          >
                            <LuUserCog />
                            Change role
                          </MenuItem>
                          {m.status === "Invited" ? (
                            <MenuItem
                              value="resend"
                              onClick={() => handleResend(m)}
                            >
                              <LuMail />
                              Resend invite
                            </MenuItem>
                          ) : null}
                          <MenuItem
                            value="remove"
                            color="fg.error"
                            _hover={{ bg: "bg.error", color: "fg.error" }}
                            onClick={() => handleRemove(m)}
                          >
                            <LuTrash2 />
                            Remove
                          </MenuItem>
                        </MenuContent>
                      </MenuRoot>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
        )}

        <Flex px="4" py="3" borderTopWidth="1px" color="fg.muted" fontSize="sm">
          Showing {filtered.length} of {members.length} members
        </Flex>
      </Box>

      <InviteDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        existingEmails={members.map((m) => m.email.toLowerCase())}
        onInvite={handleInvite}
      />
      <ChangeRoleDialog
        member={roleTarget}
        onClose={() => setRoleTarget(null)}
        onChange={handleChangeRole}
      />
    </>
  );
}
