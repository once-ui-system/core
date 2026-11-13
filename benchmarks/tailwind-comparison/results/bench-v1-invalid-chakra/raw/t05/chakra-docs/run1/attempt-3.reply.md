Nothing new shows up in the project tree. The shared layer is the stock layout, `Provider` and `Toaster`, and I can't change those.

Hydration error #418 with `args[]=HTML` means the server-rendered HTML differs from what the client rendered. If the stock layer were the cause, every Chakra-and-Next project would fail the same way. The docs' own pattern, a server page that renders Chakra primitives directly, is the same as mine, so the mismatch must come from something I render that the server and client resolve differently.

Rereading my code with that in mind, one difference stands out. `Table.Row` and `Table.Cell` accept a responsive `display` prop (`{ base: "none", md: "table-cell" }`). Chakra emits those as CSS media queries, so they render the same on both sides. That isn't a mismatch.

There is one place where I put a value that can differ on each side: the `id` in `handleInvite`, which uses `Date.now()`. It only runs on a click, not during render, so it isn't it either.

What is left is the elements I render inside Chakra elements that can't legally contain them. In `Table.Header` I put `<Box as="span" srOnly>` inside a `th`, which is valid. In the member page I use `<Stack as="dl">` with `<Box>` wrappers around `dt`/`dd`. A `div` inside a `dl` is valid HTML. But `Text as="dt"` renders a `<dt>` inside a `<div>`. That is valid too.

The invalid nesting is in `Stack as="ul"` containing `Box as="li"`. Chakra's `Stack` wraps each child with separators only when asked, so that is also fine.

I can't find a nesting error by inspection. The remaining shared factor is that the `Field` snippet renders `ChakraField.RequiredIndicator` and the Chakra `Select` and `Menu` generate ids with `useId`. Those are consistent for server and client in React 19.

I'll simplify to a version with the fewest moving parts. I'll render the pages with only plain Chakra layout primitives, with no `dl` or `dt` or `dd` and no `Table`. The data table will use semantic HTML through Chakra's `Table` but rendered natively with the `native` prop. That removes the one structure I haven't ruled out, which is the nested table markup.

I'll also remove `generateStaticParams` interplay by keeping it, since it is harmless. Here is the full set of files with those changes.

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
  when: string;
}

export const PRODUCT_NAME = "Lumen";

export const ROLES: Role[] = ["Owner", "Admin", "Member", "Viewer"];
export const INVITE_ROLES: Role[] = ["Admin", "Member", "Viewer"];

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  Owner: "Full access, including billing and deleting the workspace.",
  Admin: "Manages members, projects and integrations.",
  Member: "Can create and edit issues, dashboards and reports.",
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
    { id: "a1", text: "Updated the workspace billing plan to Team", when: "2 days ago" },
    { id: "a2", text: "Created the “Q3 retention” dashboard", when: "5 days ago" },
    { id: "a3", text: "Invited Ines Duarte as Viewer", when: "1 week ago" },
  ],
  "m-02": [
    { id: "a1", text: "Closed issue LUM-214 “Funnel chart drops last day”", when: "3 hours ago" },
    { id: "a2", text: "Changed Leo Brandt's access to Suspended", when: "Yesterday" },
    { id: "a3", text: "Connected the GitHub integration", when: "4 days ago" },
    { id: "a4", text: "Commented on LUM-231 “Export CSV times out”", when: "6 days ago" },
  ],
  "m-03": [
    { id: "a1", text: "Opened issue LUM-238 “Cohort filter resets on refresh”", when: "Yesterday" },
    { id: "a2", text: "Shared the “Onboarding funnel” report", when: "3 days ago" },
  ],
  "m-04": [
    { id: "a1", text: "Merged a fix linked to LUM-219", when: "6 hours ago" },
    { id: "a2", text: "Added a new event, “project_archived”", when: "4 days ago" },
    { id: "a3", text: "Commented on LUM-225 “Slow dashboard load”", when: "1 week ago" },
  ],
  "m-05": [],
  "m-06": [
    { id: "a1", text: "Viewed the “Weekly active teams” dashboard", when: "Today" },
    { id: "a2", text: "Viewed issue LUM-214", when: "3 days ago" },
  ],
  "m-07": [
    { id: "a1", text: "Last active in the workspace", when: "3 weeks ago" },
    { id: "a2", text: "Reassigned LUM-190 to Tomás Lindqvist", when: "3 weeks ago" },
  ],
  "m-08": [],
};

export function getMember(id: string): Member | undefined {
  return members.find((m) => m.id === id);
}

export function getActivity(id: string): ActivityItem[] {
  return activityByMember[id] ?? [];
}

export function statusColor(status: Status): "green" | "orange" | "red" {
  if (status === "Active") return "green";
  if (status === "Invited") return "orange";
  return "red";
}

export function roleColor(role: Role): "purple" | "blue" | "gray" | "cyan" {
  if (role === "Owner") return "purple";
  if (role === "Admin") return "blue";
  if (role === "Member") return "cyan";
  return "gray";
}

const AVATAR_PALETTE = ["blue", "green", "purple", "orange", "teal", "pink", "cyan", "red"] as const;

export function avatarColor(name: string): (typeof AVATAR_PALETTE)[number] {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % 997;
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0].charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
  return (first + last).toUpperCase();
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDate(iso: string | null): string {
  if (!iso) return "Not joined yet";
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
```

```tsx components/members/member-avatar.tsx
import { Box } from "@chakra-ui/react";
import { avatarColor, initialsOf } from "@/lib/data";

interface MemberAvatarProps {
  name: string;
  size?: "sm" | "xl";
}

const SIZES = {
  sm: { box: "32px", font: "xs" },
  xl: { box: "80px", font: "2xl" },
} as const;

export function MemberAvatar({ name, size = "sm" }: MemberAvatarProps) {
  const palette = avatarColor(name);
  const s = SIZES[size];
  return (
    <Box
      aria-hidden="true"
      flexShrink={0}
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      rounded="full"
      fontWeight="medium"
      userSelect="none"
      width={s.box}
      height={s.box}
      fontSize={s.font}
      bg={`${palette}.subtle`}
      color={`${palette}.fg`}
    >
      {initialsOf(name)}
    </Box>
  );
}
```

```tsx components/site-header.tsx
import NextLink from "next/link";
import { Box, Container, Flex } from "@chakra-ui/react";
import { PRODUCT_NAME } from "@/lib/data";

export function SiteHeader({ maxW }: { maxW: string }) {
  return (
    <Box as="header" bg="bg" borderBottomWidth="1px">
      <Container maxW={maxW} py="3">
        <Flex align="center" justify="space-between">
          <NextLink
            href="/"
            style={{ fontWeight: 600, fontSize: "1.125rem", textDecoration: "none", color: "inherit" }}
          >
            {PRODUCT_NAME}
          </NextLink>
        </Flex>
      </Container>
    </Box>
  );
}
```

```tsx components/members/member-badges.tsx
import { Badge } from "@chakra-ui/react";
import { type Role, type Status, roleColor, statusColor } from "@/lib/data";

export function RoleBadge({ role }: { role: Role }) {
  return (
    <Badge colorPalette={roleColor(role)} variant="subtle">
      {role}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge colorPalette={statusColor(status)} variant="subtle">
      {status}
    </Badge>
  );
}
```

```tsx components/members/invite-dialog.tsx
"use client";

import { useState } from "react";
import { Button, Input, Stack, Text, Textarea } from "@chakra-ui/react";
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
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select";
import { INVITE_ROLES, type Role, isValidEmail } from "@/lib/data";

interface InviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (invite: { email: string; role: Role; message: string }) => void;
}

interface Errors {
  email?: string;
  role?: string;
}

export function InviteDialog({ open, onOpenChange, onInvite }: InviteDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  function reset() {
    setEmail("");
    setRole("");
    setMessage("");
    setErrors({});
  }

  function validate(): Errors {
    const next: Errors = {};
    const trimmed = email.trim();
    if (!trimmed) next.email = "Enter an email address.";
    else if (!isValidEmail(trimmed)) next.email = "Enter a valid email address, like name@company.com.";
    if (!role) next.role = "Choose a role for the new member.";
    return next;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
      onOpenChange={(details) => {
        onOpenChange(details.open);
        if (!details.open) reset();
      }}
      placement="center"
      motionPreset="slide-in-bottom"
    >
      <DialogContent mx="4">
        <form onSubmit={handleSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>Invite member</DialogTitle>
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
                  placeholder="teammate@company.com"
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
                    placeholder="Select a role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    items={INVITE_ROLES}
                  />
                </NativeSelectRoot>
              </Field>
              <Field label="Message" optionalText={<Text as="span" color="fg.muted" fontSize="sm">(optional)</Text>}>
                <Textarea
                  name="message"
                  rows={3}
                  placeholder="Add a short note, e.g. what they'll be working on."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </Field>
            </Stack>
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogActionTrigger>
            <Button type="submit" colorPalette="blue">
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

```tsx components/members/change-role-dialog.tsx
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
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select";
import { ROLES, ROLE_DESCRIPTIONS, type Member, type Role } from "@/lib/data";

interface ChangeRoleDialogProps {
  member: Member | null;
  onClose: () => void;
  onChange: (id: string, role: Role) => void;
}

export function ChangeRoleDialog({ member, onClose, onChange }: ChangeRoleDialogProps) {
  return (
    <DialogRoot
      open={member !== null}
      onOpenChange={(details) => {
        if (!details.open) onClose();
      }}
      placement="center"
    >
      {member && (
        <ChangeRoleBody key={member.id} member={member} onClose={onClose} onChange={onChange} />
      )}
    </DialogRoot>
  );
}

function ChangeRoleBody({
  member,
  onClose,
  onChange,
}: {
  member: Member;
  onClose: () => void;
  onChange: (id: string, role: Role) => void;
}) {
  const [role, setRole] = useState<Role>(member.role);

  return (
    <DialogContent mx="4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onChange(member.id, role);
          onClose();
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
                  items={ROLES}
                />
              </NativeSelectRoot>
            </Field>
            <Text fontSize="sm" color="fg.muted">
              {ROLE_DESCRIPTIONS[role]}
            </Text>
          </Stack>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </DialogActionTrigger>
          <Button type="submit" colorPalette="blue" disabled={role === member.role}>
            Save role
          </Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </form>
    </DialogContent>
  );
}
```

```tsx components/members/remove-dialog.tsx
"use client";

import { Button } from "@chakra-ui/react";
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
import type { Member } from "@/lib/data";

interface RemoveDialogProps {
  member: Member | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export function RemoveDialog({ member, onClose, onConfirm }: RemoveDialogProps) {
  return (
    <DialogRoot
      role="alertdialog"
      open={member !== null}
      onOpenChange={(details) => {
        if (!details.open) onClose();
      }}
      placement="center"
    >
      {member && (
        <DialogContent mx="4">
          <DialogHeader>
            <DialogTitle>Remove {member.name}?</DialogTitle>
          </DialogHeader>
          <DialogBody>
            {member.name} will lose access to your Lumen workspace right away.
            Issues assigned to them will become unassigned.
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button variant="outline">Cancel</Button>
            </DialogActionTrigger>
            <Button
              colorPalette="red"
              onClick={() => {
                onConfirm(member.id);
                onClose();
              }}
            >
              Remove member
            </Button>
          </DialogFooter>
          <DialogCloseTrigger />
        </DialogContent>
      )}
    </DialogRoot>
  );
}
```

```tsx components/members/member-actions.tsx
"use client";

import { IconButton } from "@chakra-ui/react";
import { LuEllipsis, LuMailPlus, LuTrash2, LuUserCog } from "react-icons/lu";
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu";
import type { Member } from "@/lib/data";

interface MemberActionsProps {
  member: Member;
  onChangeRole: (member: Member) => void;
  onResendInvite: (member: Member) => void;
  onRemove: (member: Member) => void;
}

export function MemberActions({
  member,
  onChangeRole,
  onResendInvite,
  onRemove,
}: MemberActionsProps) {
  return (
    <MenuRoot
      positioning={{ placement: "bottom-end" }}
      ids={{ trigger: `actions-trigger-${member.id}`, content: `actions-content-${member.id}` }}
    >
      <MenuTrigger asChild>
        <IconButton
          variant="ghost"
          size="sm"
          aria-label={`Actions for ${member.name}`}
        >
          <LuEllipsis />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        <MenuItem value="change-role" onClick={() => onChangeRole(member)}>
          <LuUserCog />
          Change role
        </MenuItem>
        {member.status === "Invited" && (
          <MenuItem value="resend-invite" onClick={() => onResendInvite(member)}>
            <LuMailPlus />
            Resend invite
          </MenuItem>
        )}
        <MenuSeparator />
        <MenuItem
          value="remove"
          color="fg.error"
          _hover={{ bg: "bg.error", color: "fg.error" }}
          onClick={() => onRemove(member)}
        >
          <LuTrash2 />
          Remove
        </MenuItem>
      </MenuContent>
    </MenuRoot>
  );
}
```

```tsx components/members/team-page.tsx
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
  Stack,
  Text,
} from "@chakra-ui/react";
import { LuSearch, LuUserPlus } from "react-icons/lu";
import { SiteHeader } from "@/components/site-header";
import { Field } from "@/components/ui/field";
import { InputGroup } from "@/components/ui/input-group";
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select";
import { toaster } from "@/components/ui/toaster";
import {
  ROLES,
  members as initialMembers,
  nameFromEmail,
  type Member,
  type Role,
} from "@/lib/data";
import { ChangeRoleDialog } from "./change-role-dialog";
import { InviteDialog } from "./invite-dialog";
import { MemberActions } from "./member-actions";
import { MemberAvatar } from "./member-avatar";
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
      <SiteHeader maxW="6xl" />

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

          <Box
            bg="bg"
            borderWidth="1px"
            rounded="lg"
            overflowX="auto"
            role="region"
            aria-label="Members table"
            tabIndex={0}
          >
            <Box
              as="table"
              width="full"
              css={{
                borderCollapse: "collapse",
                "& th, & td": {
                  textAlign: "start",
                  padding: "12px 16px",
                  borderBottomWidth: "1px",
                  verticalAlign: "middle",
                },
                "& th": {
                  fontSize: "var(--chakra-font-sizes-sm)",
                  fontWeight: 600,
                  color: "var(--chakra-colors-fg-muted)",
                },
                "& tbody tr:last-of-type td": { borderBottomWidth: 0 },
              }}
            >
              <Box as="thead">
                <tr>
                  <th scope="col">Member</th>
                  <Box as="th" scope="col" display={{ base: "none", md: "table-cell" }}>
                    Email
                  </Box>
                  <th scope="col">Role</th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    <Box as="span" srOnly>
                      Actions
                    </Box>
                  </th>
                </tr>
              </Box>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <HStack gap="3">
                        <MemberAvatar name={m.name} />
                        <Box minW="0">
                          <NextLink
                            href={`/members/${m.id}`}
                            style={{ fontWeight: 500, textDecoration: "underline" }}
                          >
                            {m.name}
                          </NextLink>
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
                    </td>
                    <Box as="td" display={{ base: "none", md: "table-cell" }} color="fg.muted">
                      {m.email}
                    </Box>
                    <td>
                      <RoleBadge role={m.role} />
                    </td>
                    <td>
                      <StatusBadge status={m.status} />
                    </td>
                    <Box as="td" textAlign="end">
                      <MemberActions
                        member={m}
                        onChangeRole={setRoleTarget}
                        onResendInvite={handleResend}
                        onRemove={setRemoveTarget}
                      />
                    </Box>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5}>
                      <Stack align="center" py="8" gap="1">
                        <Text fontWeight="medium">No members found</Text>
                        <Text color="fg.muted" fontSize="sm">
                          Try a different search or choose another role.
                        </Text>
                      </Stack>
                    </td>
                  </tr>
                )}
              </tbody>
            </Box>
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
```

```tsx app/page.tsx
import type { Metadata } from "next";
import { TeamPage } from "@/components/members/team-page";

export const metadata: Metadata = {
  title: "Team · Lumen",
  description: "Manage members, roles and invitations in your Lumen workspace.",
};

export default function Page() {
  return <TeamPage />;
}
```

```tsx app/members/[id]/page.tsx
import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import {
  Box,
  Container,
  Flex,
  Heading,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import { LuArrowLeft } from "react-icons/lu";
import { SiteHeader } from "@/components/site-header";
import { MemberAvatar } from "@/components/members/member-avatar";
import { RoleBadge, StatusBadge } from "@/components/members/member-badges";
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
  return { title: member ? `${member.name} · Lumen` : "Member not found · Lumen" };
}

function ProfileRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Text fontSize="sm" color="fg.muted" mb="1">
        {label}
      </Text>
      {children}
    </Box>
  );
}

export default async function MemberPage({ params }: PageProps) {
  const { id } = await params;
  const member = getMember(id);
  if (!member) notFound();

  const activity = getActivity(member.id);

  return (
    <Box minH="100vh" bg="bg.subtle">
      <SiteHeader maxW="4xl" />

      <Container as="main" maxW="4xl" py={{ base: "6", md: "10" }}>
        <Stack gap="6">
          <NextLink
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              alignSelf: "flex-start",
              textDecoration: "underline",
            }}
          >
            <LuArrowLeft aria-hidden="true" />
            Back to team
          </NextLink>

          <Flex
            bg="bg"
            borderWidth="1px"
            rounded="lg"
            p={{ base: "5", md: "6" }}
            gap="5"
            direction={{ base: "column", sm: "row" }}
            align={{ base: "flex-start", sm: "center" }}
          >
            <MemberAvatar name={member.name} size="xl" />
            <Stack gap="2">
              <Heading as="h1" size="2xl">
                {member.name}
              </Heading>
              <Text color="fg.muted" wordBreak="break-all">
                {member.email}
              </Text>
              <HStack gap="2">
                <RoleBadge role={member.role} />
                <StatusBadge status={member.status} />
              </HStack>
            </Stack>
          </Flex>

          <Flex gap="6" direction={{ base: "column", md: "row" }} align="stretch">
            <Box
              as="section"
              aria-labelledby="profile-heading"
              bg="bg"
              borderWidth="1px"
              rounded="lg"
              p={{ base: "5", md: "6" }}
              flex="1"
            >
              <Heading as="h2" id="profile-heading" size="md" mb="4">
                Profile
              </Heading>
              <Stack gap="4">
                <ProfileRow label="Role">
                  <Text>{member.role}</Text>
                  <Text fontSize="sm" color="fg.muted">
                    {ROLE_DESCRIPTIONS[member.role]}
                  </Text>
                </ProfileRow>
                <ProfileRow label="Status">
                  <Text>{member.status}</Text>
                </ProfileRow>
                <ProfileRow label="Joined">
                  <Text>
                    {member.joined ? formatDate(member.joined) : "Invitation pending"}
                  </Text>
                </ProfileRow>
              </Stack>
            </Box>

            <Box
              as="section"
              aria-labelledby="activity-heading"
              bg="bg"
              borderWidth="1px"
              rounded="lg"
              p={{ base: "5", md: "6" }}
              flex="1.4"
            >
              <Heading as="h2" id="activity-heading" size="md" mb="4">
                Recent activity
              </Heading>
              {activity.length === 0 ? (
                <Text color="fg.muted">
                  No activity yet. Activity will appear here once {member.name} joins the workspace.
                </Text>
              ) : (
                <Stack gap="4">
                  {activity.map((item) => (
                    <Box
                      key={item.id}
                      borderStartWidth="2px"
                      borderColor="border.emphasized"
                      ps="4"
                    >
                      <Text>{item.text}</Text>
                      <Text fontSize="sm" color="fg.muted">
                        {item.when}
                      </Text>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </Flex>
        </Stack>
      </Container>
    </Box>
  );
}
```

```tsx app/members/[id]/not-found.tsx
import NextLink from "next/link";
import { Container, Heading, Stack, Text } from "@chakra-ui/react";

export default function NotFound() {
  return (
    <Container maxW="md" py="20">
      <Stack gap="3" align="flex-start">
        <Heading as="h1" size="2xl">
          Member not found
        </Heading>
        <Text color="fg.muted">
          That person isn&apos;t part of this workspace, or they may have been removed.
        </Text>
        <NextLink href="/" style={{ textDecoration: "underline" }}>
          Back to team
        </NextLink>
      </Stack>
    </Container>
  );
}
```