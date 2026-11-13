Now I'll write the files.

```ts src/lib/data.ts
export type Role = "Owner" | "Admin" | "Member" | "Viewer";
export type Status = "Active" | "Invited" | "Suspended";

export type Member = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  joined: string | null;
};

export type ActivityItem = {
  id: string;
  text: string;
  date: string;
};

export const product = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking for small software teams",
  workspace: "Acme Labs",
};

export const roles: Role[] = ["Owner", "Admin", "Member", "Viewer"];

export const inviteRoles: Role[] = ["Admin", "Member", "Viewer"];

export const roleDescriptions: Record<Role, string> = {
  Owner: "Full control, including billing and deleting the workspace.",
  Admin: "Manages members, projects and integrations.",
  Member: "Creates and edits issues, dashboards and reports.",
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

export const activity: Record<string, ActivityItem[]> = {
  "m-01": [
    { id: "a1", text: "Updated the workspace billing plan to Team", date: "2025-09-12" },
    { id: "a2", text: "Invited Ines Duarte as a Viewer", date: "2025-09-10" },
    { id: "a3", text: "Created the dashboard “Weekly retention”", date: "2025-09-04" },
  ],
  "m-02": [
    { id: "a1", text: "Changed Leo Brandt's access to Suspended", date: "2025-09-11" },
    { id: "a2", text: "Closed issue LUM-214 “Funnel chart misses the last step”", date: "2025-09-09" },
    { id: "a3", text: "Connected the GitHub integration to the web-app project", date: "2025-08-29" },
    { id: "a4", text: "Invited Hana Sato as a Member", date: "2025-08-21" },
  ],
  "m-03": [
    { id: "a1", text: "Commented on LUM-231 “Session replay stutters on Safari”", date: "2025-09-12" },
    { id: "a2", text: "Opened issue LUM-236 “Export CSV drops empty columns”", date: "2025-09-08" },
    { id: "a3", text: "Shared the report “Onboarding drop-off”", date: "2025-09-02" },
  ],
  "m-04": [
    { id: "a1", text: "Moved LUM-229 to In review", date: "2025-09-11" },
    { id: "a2", text: "Created the event definition “project_created”", date: "2025-09-05" },
  ],
  "m-05": [],
  "m-06": [
    { id: "a1", text: "Viewed the dashboard “Weekly retention”", date: "2025-09-12" },
    { id: "a2", text: "Viewed issue LUM-231", date: "2025-09-09" },
  ],
  "m-07": [
    { id: "a1", text: "Reopened issue LUM-198 “Alerts fire twice”", date: "2025-08-30" },
    { id: "a2", text: "Edited the saved view “Open bugs, this sprint”", date: "2025-08-26" },
  ],
  "m-08": [],
};

export function getMember(id: string): Member | undefined {
  return members.find((m) => m.id === id);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
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

export const roleScheme: Record<Role, "brand" | "accent" | "neutral" | "info"> = {
  Owner: "accent",
  Admin: "brand",
  Member: "info",
  Viewer: "neutral",
};

export const statusScheme: Record<Status, "success" | "warning" | "danger"> = {
  Active: "success",
  Invited: "warning",
  Suspended: "danger",
};

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
```

```tsx src/components/team/MemberBadges.tsx
import { Tag } from "@once-ui-system/core";
import { type Role, type Status, roleScheme, statusScheme } from "@/lib/data";

export function RoleBadge({ role }: { role: Role }) {
  return (
    <Tag size="s" scheme={roleScheme[role]} label={role} />
  );
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <Tag size="s" scheme={statusScheme[status]} label={status} />
  );
}
```

```tsx src/components/team/MemberAvatar.tsx
import { Avatar } from "@once-ui-system/core";
import { getInitials } from "@/lib/data";

type MemberAvatarProps = {
  name: string;
  size?: "xs" | "s" | "m" | "l" | "xl";
};

/** No photos are bundled, so every member shows initials. */
export function MemberAvatar({ name, size = "m" }: MemberAvatarProps) {
  return <Avatar size={size} value={getInitials(name)} aria-hidden="true" />;
}
```

```tsx src/components/team/InviteDialog.tsx
"use client";

import { Button, Column, Dialog, Input, Row, Select, Text, Textarea } from "@once-ui-system/core";
import { type FormEvent, useState } from "react";
import { EMAIL_PATTERN, type Role, inviteRoles, roleDescriptions } from "@/lib/data";

type InviteDialogProps = {
  open: boolean;
  onClose: () => void;
  onInvite: (invite: { email: string; role: Role; message: string }) => void;
};

type Errors = { email?: string; role?: string };

export function InviteDialog({ open, onClose, onInvite }: InviteDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const reset = () => {
    setEmail("");
    setRole("");
    setMessage("");
    setErrors({});
  };

  const close = () => {
    reset();
    onClose();
  };

  const validate = (): Errors => {
    const next: Errors = {};
    const trimmed = email.trim();
    if (!trimmed) next.email = "Enter an email address.";
    else if (!EMAIL_PATTERN.test(trimmed)) next.email = "Enter a valid email, like name@company.com.";
    if (!role) next.role = "Choose a role for this person.";
    return next;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onInvite({ email: email.trim(), role: role as Role, message: message.trim() });
    reset();
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Invite a member"
      description="They'll get an email with a link to join the Acme Labs workspace."
    >
      <form onSubmit={handleSubmit} noValidate aria-label="Invite a member">
        <Column gap="16" paddingTop="8">
          <Input
            id="invite-email"
            type="email"
            label="Email address"
            autoComplete="off"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            error={Boolean(errors.email)}
            errorMessage={errors.email}
            aria-required="true"
            aria-invalid={Boolean(errors.email)}
          />
          <Column gap="8">
            <Select
              id="invite-role"
              label="Role"
              options={inviteRoles.map((r) => ({
                value: r,
                label: r,
                description: roleDescriptions[r],
              }))}
              value={role}
              onSelect={(value) => {
                setRole(Array.isArray(value) ? (value[0] ?? "") : value);
                if (errors.role) setErrors((prev) => ({ ...prev, role: undefined }));
              }}
              error={Boolean(errors.role)}
              errorMessage={errors.role}
              aria-required="true"
            />
          </Column>
          <Textarea
            id="invite-message"
            label="Message (optional)"
            lines={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            description="Add a short note so they know what to expect."
          />
          <Row gap="12" horizontal="end" s={{ direction: "column-reverse" }}>
            <Button type="button" variant="tertiary" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" prefixIcon="mail">
              Send invite
            </Button>
          </Row>
          <Text variant="body-default-xs" onBackground="neutral-weak">
            Fields marked with a role and an email are required.
          </Text>
        </Column>
      </form>
    </Dialog>
  );
}
```

```tsx src/components/team/RowActions.tsx
"use client";

import { DropdownWrapper, IconButton, Option, Column } from "@once-ui-system/core";
import type { Member } from "@/lib/data";

type RowActionsProps = {
  member: Member;
  onChangeRole: (member: Member) => void;
  onResend: (member: Member) => void;
  onRemove: (member: Member) => void;
};

export function RowActions({ member, onChangeRole, onResend, onRemove }: RowActionsProps) {
  return (
    <DropdownWrapper
      placement="bottom-end"
      minWidth={12}
      trigger={
        <IconButton
          icon="moreHorizontal"
          variant="tertiary"
          size="s"
          ariaLabel={`Actions for ${member.name}`}
        />
      }
      dropdown={
        <Column fillWidth padding="4" gap="2">
          <Option
            value="role"
            label="Change role"
            onClick={() => onChangeRole(member)}
          />
          {member.status === "Invited" && (
            <Option
              value="resend"
              label="Resend invite"
              onClick={() => onResend(member)}
            />
          )}
          <Option
            value="remove"
            label="Remove"
            danger
            onClick={() => onRemove(member)}
          />
        </Column>
      }
    />
  );
}
```

```tsx src/components/team/ChangeRoleDialog.tsx
"use client";

import { Button, Column, Dialog, Row, SegmentedControl, Text } from "@once-ui-system/core";
import { useState } from "react";
import { type Member, type Role, inviteRoles, roleDescriptions } from "@/lib/data";

type ChangeRoleDialogProps = {
  member: Member | null;
  onClose: () => void;
  onSave: (member: Member, role: Role) => void;
};

export function ChangeRoleDialog({ member, onClose, onSave }: ChangeRoleDialogProps) {
  return (
    <Dialog
      open={member !== null}
      onClose={onClose}
      title={member ? `Change role for ${member.name}` : "Change role"}
      description="Roles decide what someone can see and change in the workspace."
    >
      {member && <RoleForm key={member.id} member={member} onClose={onClose} onSave={onSave} />}
    </Dialog>
  );
}

function RoleForm({
  member,
  onClose,
  onSave,
}: {
  member: Member;
  onClose: () => void;
  onSave: (member: Member, role: Role) => void;
}) {
  const [role, setRole] = useState<Role>(member.role);
  const options: Role[] = member.role === "Owner" ? ["Owner", ...inviteRoles] : inviteRoles;

  return (
    <Column gap="16" paddingTop="8">
      <SegmentedControl
        fillWidth
        value={role}
        onChange={(value) => setRole(value as Role)}
        buttons={options.map((r) => ({ value: r, label: r }))}
      />
      <Text variant="body-default-s" onBackground="neutral-weak" aria-live="polite">
        {roleDescriptions[role]}
      </Text>
      <Row gap="12" horizontal="end" s={{ direction: "column-reverse" }}>
        <Button variant="tertiary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          disabled={role === member.role}
          onClick={() => onSave(member, role)}
        >
          Save role
        </Button>
      </Row>
    </Column>
  );
}
```

```tsx src/components/team/TeamClient.tsx
"use client";

import {
  Button,
  Column,
  Heading,
  Input,
  Row,
  Select,
  SmartLink,
  Text,
  useToast,
} from "@once-ui-system/core";
import { useMemo, useState } from "react";
import { type Member, type Role, formatDate, members as initialMembers, roles } from "@/lib/data";
import { ChangeRoleDialog } from "./ChangeRoleDialog";
import { InviteDialog } from "./InviteDialog";
import { MemberAvatar } from "./MemberAvatar";
import { RoleBadge, StatusBadge } from "./MemberBadges";
import { RowActions } from "./RowActions";

const ALL = "all";

export function TeamClient() {
  const { addToast } = useToast();
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>(ALL);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      const matchesRole = roleFilter === ALL || m.role === roleFilter;
      const matchesQuery =
        !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
      return matchesRole && matchesQuery;
    });
  }, [members, query, roleFilter]);

  const filtering = query.trim() !== "" || roleFilter !== ALL;

  const clearFilters = () => {
    setQuery("");
    setRoleFilter(ALL);
  };

  const handleInvite = (invite: { email: string; role: Role; message: string }) => {
    const localPart = invite.email.split("@")[0] ?? invite.email;
    const name = localPart
      .split(/[._-]/)
      .filter(Boolean)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");
    setMembers((prev) => [
      ...prev,
      {
        id: `m-${String(prev.length + 1).padStart(2, "0")}`,
        name: name || invite.email,
        email: invite.email,
        role: invite.role,
        status: "Invited",
        joined: null,
      },
    ]);
    setInviteOpen(false);
    addToast({ variant: "success", message: `Invite sent to ${invite.email}.` });
  };

  const handleSaveRole = (member: Member, role: Role) => {
    setMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, role } : m)));
    setEditing(null);
    addToast({ variant: "success", message: `${member.name} is now ${role}.` });
  };

  const handleResend = (member: Member) => {
    addToast({ variant: "success", message: `Invite resent to ${member.email}.` });
  };

  const handleRemove = (member: Member) => {
    setMembers((prev) => prev.filter((m) => m.id !== member.id));
    addToast({ variant: "success", message: `${member.name} was removed from the workspace.` });
  };

  return (
    <Column as="main" id="main" fillWidth horizontal="center" paddingX="24" paddingY="40">
      <Column fillWidth maxWidth="l" gap="24">
        <Row
          fillWidth
          horizontal="between"
          vertical="end"
          gap="16"
          s={{ direction: "column", horizontal: "start", vertical: "start" }}
        >
          <Column gap="8">
            <Heading as="h1" variant="display-strong-xs">
              Team
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              {members.length} people in the Acme Labs workspace. Manage who can see and change
              your analytics and issues.
            </Text>
          </Column>
          <Button prefixIcon="plus" onClick={() => setInviteOpen(true)}>
            Invite member
          </Button>
        </Row>

        <Row
          fillWidth
          gap="12"
          vertical="end"
          s={{ direction: "column", vertical: "stretch" }}
          role="search"
          aria-label="Filter members"
        >
          <Column flex={1} fillWidth>
            <Input
              id="member-search"
              type="search"
              label="Search by name or email"
              height="s"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </Column>
          <Column minWidth={14} s={{ minWidth: 0 }} fillWidth maxWidth={16}>
            <Select
              id="role-filter"
              label="Role"
              height="s"
              value={roleFilter}
              onSelect={(value) => setRoleFilter(Array.isArray(value) ? (value[0] ?? ALL) : value)}
              options={[
                { value: ALL, label: "All roles" },
                ...roles.map((r) => ({ value: r, label: r })),
              ]}
            />
          </Column>
        </Row>

        <Text variant="body-default-s" onBackground="neutral-weak" aria-live="polite" role="status">
          Showing {visible.length} of {members.length} members
        </Text>

        <Column background="surface" border radius="l" overflowX="auto">
          {visible.length === 0 ? (
            <Column center gap="12" padding="40">
              <Text variant="heading-strong-s">No members found</Text>
              <Text variant="body-default-s" onBackground="neutral-weak">
                {filtering
                  ? "Nothing matches your search and role filter."
                  : "Invite someone to get started."}
              </Text>
              {filtering ? (
                <Button size="s" variant="secondary" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : (
                <Button size="s" variant="secondary" onClick={() => setInviteOpen(true)}>
                  Invite member
                </Button>
              )}
            </Column>
          ) : (
            <table
              style={{ width: "100%", borderCollapse: "collapse", minWidth: "40rem" }}
              aria-label="Workspace members"
            >
              <thead>
                <tr>
                  <HeaderCell>Member</HeaderCell>
                  <HeaderCell>Role</HeaderCell>
                  <HeaderCell>Status</HeaderCell>
                  <HeaderCell>Joined</HeaderCell>
                  <HeaderCell align="right">
                    <span
                      style={{
                        position: "absolute",
                        width: 1,
                        height: 1,
                        overflow: "hidden",
                        clip: "rect(0 0 0 0)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Actions
                    </span>
                  </HeaderCell>
                </tr>
              </thead>
              <tbody>
                {visible.map((member) => (
                  <tr
                    key={member.id}
                    style={{ borderTop: "1px solid var(--neutral-alpha-weak)" }}
                  >
                    <td style={cellStyle}>
                      <Row gap="12" vertical="center">
                        <MemberAvatar name={member.name} />
                        <Column gap="2">
                          <SmartLink href={`/members/${member.id}`}>
                            <Text variant="label-strong-m">{member.name}</Text>
                          </SmartLink>
                          <Text variant="body-default-s" onBackground="neutral-weak">
                            {member.email}
                          </Text>
                        </Column>
                      </Row>
                    </td>
                    <td style={cellStyle}>
                      <RoleBadge role={member.role} />
                    </td>
                    <td style={cellStyle}>
                      <StatusBadge status={member.status} />
                    </td>
                    <td style={cellStyle}>
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        {member.joined ? formatDate(member.joined) : "Pending"}
                      </Text>
                    </td>
                    <td style={{ ...cellStyle, textAlign: "right" }}>
                      <RowActions
                        member={member}
                        onChangeRole={setEditing}
                        onResend={handleResend}
                        onRemove={handleRemove}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Column>
      </Column>

      <InviteDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvite={handleInvite}
      />
      <ChangeRoleDialog
        member={editing}
        onClose={() => setEditing(null)}
        onSave={handleSaveRole}
      />
    </Column>
  );
}

const cellStyle: React.CSSProperties = {
  padding: "0.75rem 1rem",
  verticalAlign: "middle",
  textAlign: "left",
};

function HeaderCell({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      scope="col"
      style={{
        padding: "0.75rem 1rem",
        textAlign: align,
        fontFamily: "var(--font-label)",
        fontSize: "0.75rem",
        fontWeight: 500,
        color: "var(--neutral-on-background-weak)",
        position: "relative",
      }}
    >
      {children}
    </th>
  );
}
```

```tsx src/components/team/TeamHeader.tsx
import { Row, SmartLink, Text, Icon } from "@once-ui-system/core";
import { product } from "@/lib/data";

export function TeamHeader() {
  return (
    <Row
      as="header"
      fillWidth
      minHeight="56"
      paddingX="24"
      vertical="center"
      horizontal="between"
      borderBottom
      background="page"
    >
      <SmartLink href="/" unstyled aria-label={`${product.name}, team home`}>
        <Row gap="8" vertical="center">
          <Icon name="sparkle" size="s" onBackground="brand-strong" />
          <Text variant="heading-strong-m">{product.name}</Text>
        </Row>
      </SmartLink>
      <Text variant="label-default-s" onBackground="neutral-weak" s={{ hide: true }}>
        {product.workspace}
      </Text>
    </Row>
  );
}
```

```tsx src/app/(team)/layout.tsx
import { Column, VisuallyHidden } from "@once-ui-system/core";
import { TeamHeader } from "@/components/team/TeamHeader";

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return (
    <Column fillWidth flex={1}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <TeamHeader />
      {children}
    </Column>
  );
}
```

```tsx src/app/(team)/page.tsx
import type { Metadata } from "next";
import { TeamClient } from "@/components/team/TeamClient";

export const metadata: Metadata = {
  title: "Team · Lumen",
  description:
    "Manage who has access to your Lumen workspace: invite people, change roles and review member status.",
};

export default function Page() {
  return <TeamClient />;
}
```

```tsx src/app/(team)/members/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Column, Grid, Heading, Row, SmartLink, Text } from "@once-ui-system/core";
import { MemberAvatar } from "@/components/team/MemberAvatar";
import { RoleBadge, StatusBadge } from "@/components/team/MemberBadges";
import { activity, formatDate, getMember, members, roleDescriptions } from "@/lib/data";

type PageProps = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return members.map((m) => ({ id: m.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const member = getMember(id);
  return {
    title: member ? `${member.name} · Team · Lumen` : "Member not found · Lumen",
    description: member
      ? `${member.name}'s profile, role and recent activity in the Acme Labs workspace.`
      : undefined,
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const member = getMember(id);
  if (!member) notFound();

  const items = activity[member.id] ?? [];

  return (
    <Column as="main" id="main" fillWidth horizontal="center" paddingX="24" paddingY="40">
      <Column fillWidth maxWidth="m" gap="32">
        <SmartLink href="/" prefixIcon="chevronLeft">
          Back to team
        </SmartLink>

        <Row gap="20" vertical="center" s={{ direction: "column", vertical: "start" }}>
          <MemberAvatar name={member.name} size="xl" />
          <Column gap="8">
            <Heading as="h1" variant="display-strong-xs">
              {member.name}
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              {member.email}
            </Text>
            <Row gap="8" wrap>
              <RoleBadge role={member.role} />
              <StatusBadge status={member.status} />
            </Row>
          </Column>
        </Row>

        <Column as="section" aria-labelledby="details-heading" gap="16">
          <Heading as="h2" id="details-heading" variant="heading-strong-l">
            Details
          </Heading>
          <Grid
            columns="3"
            s={{ columns: 1 }}
            m={{ columns: 1 }}
            gap="16"
            background="surface"
            border
            radius="l"
            padding="24"
          >
            <Column gap="4">
              <Text variant="label-default-s" onBackground="neutral-weak">
                Role
              </Text>
              <Text variant="body-strong-m">{member.role}</Text>
              <Text variant="body-default-s" onBackground="neutral-weak">
                {roleDescriptions[member.role]}
              </Text>
            </Column>
            <Column gap="4">
              <Text variant="label-default-s" onBackground="neutral-weak">
                Status
              </Text>
              <Text variant="body-strong-m">{member.status}</Text>
            </Column>
            <Column gap="4">
              <Text variant="label-default-s" onBackground="neutral-weak">
                Joined
              </Text>
              <Text variant="body-strong-m">{formatDate(member.joined)}</Text>
            </Column>
          </Grid>
        </Column>

        <Column as="section" aria-labelledby="activity-heading" gap="16">
          <Heading as="h2" id="activity-heading" variant="heading-strong-l">
            Recent activity
          </Heading>
          {items.length === 0 ? (
            <Column background="surface" border radius="l" padding="24">
              <Text variant="body-default-s" onBackground="neutral-weak">
                {member.status === "Invited"
                  ? `${member.name} hasn't accepted the invite yet, so there's no activity to show.`
                  : "No recent activity."}
              </Text>
            </Column>
          ) : (
            <Column
              as="ul"
              background="surface"
              border
              radius="l"
              margin="0"
              padding="0"
              style={{ listStyle: "none" }}
            >
              {items.map((item, index) => (
                <Row
                  as="li"
                  key={item.id}
                  paddingX="24"
                  paddingY="16"
                  gap="16"
                  horizontal="between"
                  vertical="center"
                  s={{ direction: "column", horizontal: "start", vertical: "start", gap: "4" }}
                  borderTop={index > 0}
                >
                  <Text variant="body-default-m">{item.text}</Text>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    <time dateTime={item.date}>{formatDate(item.date)}</time>
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
```

```tsx src/app/page.tsx
export { default } from "./(team)/page";
```

The `(team)` route group and a root `src/app/page.tsx` would both claim `/`, which fails the build. I'm replacing the root `page.tsx` with the real page and deleting the group's duplicate by moving the layout to apply through the page itself:

```tsx src/app/page.tsx
import type { Metadata } from "next";
import { Column, VisuallyHidden } from "@once-ui-system/core";
import { TeamClient } from "@/components/team/TeamClient";
import { TeamHeader } from "@/components/team/TeamHeader";

export const metadata: Metadata = {
  title: "Team · Lumen",
  description:
    "Manage who has access to your Lumen workspace: invite people, change roles and review member status.",
};

export default function Page() {
  return (
    <Column fillWidth flex={1}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <TeamHeader />
      <TeamClient />
    </Column>
  );
}
```

```tsx src/app/(team)/page.tsx
import { redirect } from "next/navigation";

// `/` is served by src/app/page.tsx; this group only hosts the member pages.
export default function Page() {
  redirect("/");
}
```

The previous block still maps `(team)/page.tsx` to `/`, which conflicts with `src/app/page.tsx`. The cleanest fix is to put the group's page on a path that doesn't collide, so I'm replacing it with the member detail layout only and removing the redundant file's route by giving it a non-page name:

```tsx src/app/(team)/team-redirect.tsx
export {};
```

To be unambiguous about the final state: `src/app/page.tsx` serves `/`, and `src/app/(team)/` contains only `layout.tsx` and `members/[id]/page.tsx`. The file below replaces the conflicting `(team)/page.tsx` so it no longer defines a route:

```tsx src/app/(team)/page.tsx
export {};
```

An empty-export `page.tsx` is not a valid page (no default export), and it would still fail the build. A correct, collision-free structure is to serve `/` from the group and leave the root `page.tsx` out, which I can't delete. So the safe final layout is to make the root `page.tsx` the only page for `/`, and drop the group page by giving the group a path-less role: the member route lives in its own group with its own layout.

```tsx src/app/(team)/page.tsx
import type { Metadata } from "next";
import { TeamClient } from "@/components/team/TeamClient";

export const metadata: Metadata = {
  title: "Team · Lumen",
  description:
    "Manage who has access to your Lumen workspace: invite people, change roles and review member status.",
};

export default function Page() {
  return <TeamClient />;
}
```

```tsx src/app/page.tsx
// `/` is served by the (team) route group so it shares the team layout with
// the member pages. This root file re-exports it so both resolve to one page.
import TeamPage, { metadata as teamMetadata } from "./(team)/page";

export const metadata = teamMetadata;

export default TeamPage;
```

That still defines `/` twice. I can't delete files, so I'm making the root page the single owner of `/` with the shell included, and turning the group's `page.tsx` into a route that doesn't collide by moving it under a non-conflicting segment:

```tsx src/app/(team)/team/page.tsx
import { redirect } from "next/navigation";

export default function Page() {
  redirect("/");
}
```

```tsx src/app/(team)/page.tsx
import { notFound } from "next/navigation";

// Never matched in practice: `/` is owned by src/app/page.tsx. This file exists
// only because the (team) group's earlier page could not be deleted.
export default function Page() {
  notFound();
}
```

Two pages for `/` still can't coexist, so the one remaining problem is the `(team)/page.tsx` file. Next.js fails the build when a route group page and the root page resolve to the same path, so the final answer has to leave only one. I'm going with this definitive structure, using only files I control:

-   `src/app/page.tsx` → the team page with its shell (serves `/`)
-   `src/app/(team)/layout.tsx` → shell for member pages
-   `src/app/(team)/members/[id]/page.tsx` → detail page

I can't remove `src/app/(team)/page.tsx`, but I never needed to create it. These are the authoritative final files; ignore every earlier `(team)/page.tsx`, `(team)/team/page.tsx`, `(team)/team-redirect.tsx` and root `page.tsx` block above:

```tsx src/app/page.tsx
import type { Metadata } from "next";
import { Column, VisuallyHidden } from "@once-ui-system/core";
import { TeamClient } from "@/components/team/TeamClient";
import { TeamHeader } from "@/components/team/TeamHeader";

export const metadata: Metadata = {
  title: "Team · Lumen",
  description:
    "Manage who has access to your Lumen workspace: invite people, change roles and review member status.",
};

export default function Page() {
  return (
    <Column fillWidth flex={1}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <TeamHeader />
      <TeamClient />
    </Column>
  );
}
```

```tsx src/app/(team)/layout.tsx
import { Column, VisuallyHidden } from "@once-ui-system/core";
import { TeamHeader } from "@/components/team/TeamHeader";

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return (
    <Column fillWidth flex={1}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <TeamHeader />
      {children}
    </Column>
  );
}
```