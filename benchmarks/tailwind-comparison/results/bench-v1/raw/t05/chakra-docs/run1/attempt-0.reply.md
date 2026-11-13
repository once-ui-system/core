Now I'll write the files. First the data layer:

**lib/data.ts**

**components/member-badges.tsx**

**components/app-shell.tsx**

**components/invite-dialog.tsx**

**components/change-role-dialog.tsx**

**components/team-page.tsx**

**app/page.tsx** and **app/members/[id]/page.tsx**

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
  id: string;
  text: string;
  detail?: string;
  when: string;
}

export const PRODUCT_NAME = "Lumen";
export const WORKSPACE_NAME = "Acme Labs";

export const ROLES: Role[] = ["Owner", "Admin", "Member", "Viewer"];
export const ASSIGNABLE_ROLES: Role[] = ["Admin", "Member", "Viewer"];

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  Owner: "Full control of the workspace, billing and members.",
  Admin: "Manages projects, integrations and team members.",
  Member: "Creates and triages issues, and views analytics.",
  Viewer: "Read-only access to dashboards and issues.",
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

const activityByMember: Record<string, ActivityItem[]> = {
  "m-01": [
    {
      id: "a-01-1",
      text: "Updated the workspace billing plan",
      detail: "Switched to the Team plan, 10 seats",
      when: "2 days ago",
    },
    {
      id: "a-01-2",
      text: "Changed Daniel Reyes's role to Admin",
      when: "last week",
    },
    {
      id: "a-01-3",
      text: "Created the dashboard “Weekly activation”",
      when: "3 weeks ago",
    },
  ],
  "m-02": [
    {
      id: "a-02-1",
      text: "Resolved issue LUM-214",
      detail: "Funnel chart drops events after midnight UTC",
      when: "3 hours ago",
    },
    {
      id: "a-02-2",
      text: "Connected the GitHub integration",
      detail: "Repository acmelabs/web-app",
      when: "yesterday",
    },
    {
      id: "a-02-3",
      text: "Invited Hana Sato as Member",
      when: "4 days ago",
    },
    {
      id: "a-02-4",
      text: "Commented on LUM-198",
      detail: "“Let's sample session replays at 20% for now.”",
      when: "last week",
    },
  ],
  "m-03": [
    {
      id: "a-03-1",
      text: "Opened issue LUM-221",
      detail: "Retention cohort export is missing the signup week",
      when: "yesterday",
    },
    {
      id: "a-03-2",
      text: "Saved the report “Checkout drop-off by plan”",
      when: "5 days ago",
    },
  ],
  "m-04": [
    {
      id: "a-04-1",
      text: "Closed issue LUM-207",
      detail: "Tooltip overlaps legend on narrow screens",
      when: "2 days ago",
    },
    {
      id: "a-04-2",
      text: "Added 3 labels to LUM-219",
      when: "last week",
    },
  ],
  "m-05": [
    {
      id: "a-05-1",
      text: "Invitation sent by Daniel Reyes",
      detail: "Waiting for Hana to accept",
      when: "4 days ago",
    },
  ],
  "m-06": [
    {
      id: "a-06-1",
      text: "Viewed the dashboard “Weekly activation”",
      when: "this morning",
    },
    {
      id: "a-06-2",
      text: "Viewed issue LUM-214",
      when: "3 days ago",
    },
  ],
  "m-07": [
    {
      id: "a-07-1",
      text: "Account suspended by Maya Okafor",
      detail: "Pending a security review of the shared API key",
      when: "2 weeks ago",
    },
    {
      id: "a-07-2",
      text: "Opened issue LUM-188",
      detail: "Alert rules fire twice for the same threshold",
      when: "3 weeks ago",
    },
  ],
  "m-08": [
    {
      id: "a-08-1",
      text: "Invitation sent by Maya Okafor",
      detail: "Waiting for Ines to accept",
      when: "yesterday",
    },
  ],
};

export function getMember(id: string): Member | undefined {
  return members.find((m) => m.id === id);
}

export function getActivity(id: string): ActivityItem[] {
  return activityByMember[id] ?? [];
}

export function formatDate(iso: string | null): string {
  if (!iso) return "Not joined yet";
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}
```

```tsx components/member-badges.tsx
import { Badge } from "@chakra-ui/react";
import type { Role, Status } from "@/lib/data";

const roleColor: Record<Role, string> = {
  Owner: "purple",
  Admin: "blue",
  Member: "gray",
  Viewer: "cyan",
};

const statusColor: Record<Status, string> = {
  Active: "green",
  Invited: "orange",
  Suspended: "red",
};

export function RoleBadge({ role }: { role: Role }) {
  return (
    <Badge colorPalette={roleColor[role]} variant="subtle" size="md">
      {role}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge colorPalette={statusColor[status]} variant="subtle" size="md">
      {status}
    </Badge>
  );
}
```

```tsx components/app-shell.tsx
import { Box, Container, Flex, Heading, Text } from "@chakra-ui/react";
import Link from "next/link";
import { LuSparkles } from "react-icons/lu";
import { ColorModeButton } from "@/components/ui/color-mode";
import { PRODUCT_NAME, WORKSPACE_NAME } from "@/lib/data";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Box minH="100dvh" bg="bg.subtle">
      <Box as="header" bg="bg" borderBottomWidth="1px">
        <Container maxW="6xl">
          <Flex h="14" align="center" justify="space-between" gap="4">
            <Link href="/" aria-label={`${PRODUCT_NAME} team home`}>
              <Flex align="center" gap="2">
                <Flex
                  boxSize="8"
                  align="center"
                  justify="center"
                  rounded="md"
                  bg="orange.solid"
                  color="orange.contrast"
                  aria-hidden="true"
                >
                  <LuSparkles />
                </Flex>
                <Text fontWeight="semibold" fontSize="lg">
                  {PRODUCT_NAME}
                </Text>
              </Flex>
            </Link>
            <Flex align="center" gap="3">
              <Text color="fg.muted" fontSize="sm" display={{ base: "none", sm: "block" }}>
                {WORKSPACE_NAME}
              </Text>
              <ColorModeButton />
            </Flex>
          </Flex>
        </Container>
      </Box>
      <Box as="main" id="main">
        <Container maxW="6xl" py={{ base: "6", md: "10" }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}

export function PageHeading({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <Flex
      direction={{ base: "column", sm: "row" }}
      align={{ base: "stretch", sm: "flex-start" }}
      justify="space-between"
      gap="4"
      mb="6"
    >
      <Box>
        <Heading as="h1" size={{ base: "xl", md: "2xl" }}>
          {title}
        </Heading>
        {description ? (
          <Text color="fg.muted" mt="1">
            {description}
          </Text>
        ) : null}
      </Box>
      {actions}
    </Flex>
  );
}
```

```tsx components/invite-dialog.tsx
"use client";

import { useState } from "react";
import { Button, Input, Stack, Textarea } from "@chakra-ui/react";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import {
  NativeSelectField,
  NativeSelectRoot,
} from "@/components/ui/native-select";
import { ASSIGNABLE_ROLES, isValidEmail, type Role } from "@/lib/data";

interface InviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingEmails: string[];
  onInvite: (invite: { email: string; role: Role; message: string }) => void;
}

interface Errors {
  email?: string;
  role?: string;
}

export function InviteDialog({
  open,
  onOpenChange,
  existingEmails,
  onInvite,
}: InviteDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  function reset() {
    setEmail("");
    setRole("");
    setMessage("");
    setErrors({});
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function validate(): Errors {
    const next: Errors = {};
    const trimmed = email.trim();
    if (!trimmed) {
      next.email = "Enter an email address.";
    } else if (!isValidEmail(trimmed)) {
      next.email = "Enter a valid email address, like name@company.com.";
    } else if (existingEmails.includes(trimmed.toLowerCase())) {
      next.email = "This person is already on the team.";
    }
    if (!role) next.role = "Choose a role for the new member.";
    return next;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onInvite({ email: email.trim(), role: role as Role, message: message.trim() });
    reset();
    onOpenChange(false);
  }

  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => handleOpenChange(e.open)}
      placement="center"
      motionPreset="slide-in-bottom"
      lazyMount
      unmountOnExit
    >
      <DialogContent mx="4">
        <form onSubmit={handleSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>Invite a member</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <DialogDescription mb="4">
              They&apos;ll get an email with a link to join your Lumen workspace.
            </DialogDescription>
            <Stack gap="4">
              <Field
                label="Email"
                required
                invalid={!!errors.email}
                errorText={errors.email}
              >
                <Input
                  type="email"
                  name="email"
                  autoComplete="off"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field
                label="Role"
                required
                invalid={!!errors.role}
                errorText={errors.role}
              >
                <NativeSelectRoot>
                  <NativeSelectField
                    name="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="">Select a role</option>
                    {ASSIGNABLE_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </NativeSelectField>
                </NativeSelectRoot>
              </Field>
              <Field
                label="Message"
                optionalText="(optional)"
                helperText="Add a short note to the invitation email."
              >
                <Textarea
                  name="message"
                  rows={3}
                  placeholder="Hi! We're triaging the beta feedback this week and could use your help."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </Field>
            </Stack>
          </DialogBody>
          <DialogFooter gap="2">
            <DialogActionTrigger asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogActionTrigger>
            <Button type="submit" colorPalette="orange">
              Send invite
            </Button>
          </DialogFooter>
          <DialogCloseTrigger />
        </form>
      </DialogContent>
    </DialogRoot>
  );
}
```

```tsx components/change-role-dialog.tsx
"use client";

import { useState } from "react";
import { Button, Stack, Text } from "@chakra-ui/react";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import {
  NativeSelectField,
  NativeSelectRoot,
} from "@/components/ui/native-select";
import { ROLES, ROLE_DESCRIPTIONS, type Member, type Role } from "@/lib/data";

interface ChangeRoleDialogProps {
  member: Member | null;
  onClose: () => void;
  onChange: (id: string, role: Role) => void;
}

export function ChangeRoleDialog({
  member,
  onClose,
  onChange,
}: ChangeRoleDialogProps) {
  return (
    <DialogRoot
      open={member !== null}
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
      placement="center"
      lazyMount
      unmountOnExit
    >
      <DialogContent mx="4">
        {member ? (
          <ChangeRoleForm
            key={member.id}
            member={member}
            onChange={onChange}
          />
        ) : null}
      </DialogContent>
    </DialogRoot>
  );
}

function ChangeRoleForm({
  member,
  onChange,
}: {
  member: Member;
  onChange: (id: string, role: Role) => void;
}) {
  const [role, setRole] = useState<Role>(member.role);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onChange(member.id, role);
      }}
    >
      <DialogHeader>
        <DialogTitle>Change role for {member.name}</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <Stack gap="3">
          <Field label="Role">
            <NativeSelectRoot>
              <NativeSelectField
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </NativeSelectField>
            </NativeSelectRoot>
          </Field>
          <Text color="fg.muted" fontSize="sm">
            {ROLE_DESCRIPTIONS[role]}
          </Text>
        </Stack>
      </DialogBody>
      <DialogFooter gap="2">
        <DialogActionTrigger asChild>
          <Button variant="outline" type="button">
            Cancel
          </Button>
        </DialogActionTrigger>
        <Button type="submit" colorPalette="orange" disabled={role === member.role}>
          Save role
        </Button>
      </DialogFooter>
      <DialogCloseTrigger />
    </form>
  );
}
```

```tsx components/team-page.tsx
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
```

```tsx app/page.tsx
import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { TeamPage } from "@/components/team-page";

export const metadata: Metadata = {
  title: "Team · Lumen",
  description: "Manage the members of your Lumen workspace.",
};

export default function Page() {
  return (
    <AppShell>
      <TeamPage />
    </AppShell>
  );
}
```

```tsx app/members/[id]/page.tsx
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
```