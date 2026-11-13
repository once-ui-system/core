"use client";

import { useMemo, useState } from "react";
import NextLink from "next/link";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Input,
  Link,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react";
import { LuSearch, LuUserPlus } from "react-icons/lu";
import { Avatar } from "@/components/ui/avatar";
import { ColorModeButton } from "@/components/ui/color-mode";
import { Field } from "@/components/ui/field";
import { InputGroup } from "@/components/ui/input-group";
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select";
import { toaster } from "@/components/ui/toaster";
import {
  PRODUCT_NAME,
  ROLES,
  members as initialMembers,
  nameFromEmail,
  type Member,
  type Role,
} from "@/lib/data";
import { ChangeRoleDialog } from "./change-role-dialog";
import { InviteDialog } from "./invite-dialog";
import { MemberActions } from "./member-actions";
import { RoleBadge, StatusBadge } from "./member-badges";
import { RemoveDialog } from "./remove-dialog";

export function TeamPage() {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [roleTarget, setRoleTarget] = useState<Member | null>(null);
  const [removeTarget, setRemoveTarget] = useState<Member | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      const matchesRole = roleFilter === "all" || m.role === roleFilter;
      const matchesQuery =
        !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
      return matchesRole && matchesQuery;
    });
  }, [members, query, roleFilter]);

  function handleInvite(invite: { email: string; role: Role; message: string }) {
    const next: Member = {
      id: `m-${String(Date.now()).slice(-6)}`,
      name: nameFromEmail(invite.email),
      email: invite.email,
      role: invite.role,
      status: "Invited",
      joined: null,
    };
    setMembers((prev) => [...prev, next]);
    toaster.create({
      type: "success",
      title: "Invite sent",
      description: `We emailed an invitation to ${invite.email}.`,
    });
  }

  function handleChangeRole(id: string, role: Role) {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
    const member = members.find((m) => m.id === id);
    toaster.create({
      type: "success",
      title: "Role updated",
      description: member ? `${member.name} is now ${role}.` : undefined,
    });
  }

  function handleRemove(id: string) {
    const member = members.find((m) => m.id === id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
    toaster.create({
      type: "info",
      title: "Member removed",
      description: member ? `${member.name} no longer has access.` : undefined,
    });
  }

  function handleResend(member: Member) {
    toaster.create({
      type: "success",
      title: "Invite resent",
      description: `A fresh invitation was sent to ${member.email}.`,
    });
  }

  return (
    <Box minH="100vh" bg="bg.subtle">
      <Box as="header" bg="bg" borderBottomWidth="1px">
        <Container maxW="6xl" py="3">
          <Flex align="center" justify="space-between">
            <Text fontWeight="semibold" fontSize="lg">
              {PRODUCT_NAME}
            </Text>
            <ColorModeButton />
          </Flex>
        </Container>
      </Box>

      <Container as="main" maxW="6xl" py={{ base: "6", md: "10" }} id="main">
        <Stack gap="6">
          <Flex
            direction={{ base: "column", sm: "row" }}
            justify="space-between"
            align={{ base: "stretch", sm: "center" }}
            gap="4"
          >
            <Box>
              <Heading as="h1" size="2xl">
                Team
              </Heading>
              <Text color="fg.muted" mt="1">
                Manage who can access your Lumen workspace and what they can do.
              </Text>
            </Box>
            <Button colorPalette="blue" onClick={() => setInviteOpen(true)}>
              <LuUserPlus />
              Invite member
            </Button>
          </Flex>

          <Flex
            direction={{ base: "column", sm: "row" }}
            gap="3"
            role="search"
            aria-label="Filter members"
          >
            <Field label="Search members" flex="1" maxW={{ sm: "md" }}>
              <InputGroup startElement={<LuSearch />} w="full">
                <Input
                  type="search"
                  placeholder="Search by name or email"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </InputGroup>
            </Field>
            <Field label="Role" w={{ base: "full", sm: "48" }}>
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
          </Flex>

          <Text fontSize="sm" color="fg.muted" aria-live="polite">
            Showing {filtered.length} of {members.length} members
          </Text>

          <Box bg="bg" borderWidth="1px" rounded="lg" overflow="hidden">
            <Table.ScrollArea>
              <Table.Root size="md" interactive>
                <Table.Caption srOnly>
                  Members of the Lumen workspace with their role and status
                </Table.Caption>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader minW="240px">Member</Table.ColumnHeader>
                    <Table.ColumnHeader display={{ base: "none", md: "table-cell" }}>
                      Email
                    </Table.ColumnHeader>
                    <Table.ColumnHeader>Role</Table.ColumnHeader>
                    <Table.ColumnHeader>Status</Table.ColumnHeader>
                    <Table.ColumnHeader w="12">
                      <Box as="span" srOnly>
                        Actions
                      </Box>
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filtered.map((m) => (
                    <Table.Row key={m.id}>
                      <Table.Cell>
                        <HStack gap="3">
                          <Avatar name={m.name} size="sm" />
                          <Box minW="0">
                            <Link asChild fontWeight="medium" colorPalette="blue">
                              <NextLink href={`/members/${m.id}`}>{m.name}</NextLink>
                            </Link>
                            <Text
                              fontSize="sm"
                              color="fg.muted"
                              display={{ base: "block", md: "none" }}
                              truncate
                            >
                              {m.email}
                            </Text>
                          </Box>
                        </HStack>
                      </Table.Cell>
                      <Table.Cell display={{ base: "none", md: "table-cell" }} color="fg.muted">
                        {m.email}
                      </Table.Cell>
                      <Table.Cell>
                        <RoleBadge role={m.role} />
                      </Table.Cell>
                      <Table.Cell>
                        <StatusBadge status={m.status} />
                      </Table.Cell>
                      <Table.Cell textAlign="end">
                        <MemberActions
                          member={m}
                          onChangeRole={setRoleTarget}
                          onResendInvite={handleResend}
                          onRemove={setRemoveTarget}
                        />
                      </Table.Cell>
                    </Table.Row>
                  ))}
                  {filtered.length === 0 && (
                    <Table.Row>
                      <Table.Cell colSpan={5}>
                        <Stack align="center" py="8" gap="1">
                          <Text fontWeight="medium">No members found</Text>
                          <Text color="fg.muted" fontSize="sm">
                            Try a different search or choose another role.
                          </Text>
                        </Stack>
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table.Root>
            </Table.ScrollArea>
          </Box>
        </Stack>
      </Container>

      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} onInvite={handleInvite} />
      <ChangeRoleDialog
        member={roleTarget}
        onClose={() => setRoleTarget(null)}
        onChange={handleChangeRole}
      />
      <RemoveDialog
        member={removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemove}
      />
    </Box>
  );
}
