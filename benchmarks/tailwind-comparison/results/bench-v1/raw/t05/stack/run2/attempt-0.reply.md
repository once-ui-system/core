Data first.

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
  summary: string;
  detail: string;
  date: string;
};

export const product =
  "Lumen, a product-analytics and issue-tracking app for small software teams";

export const roles: Role[] = ["Owner", "Admin", "Member", "Viewer"];

export const roleDescriptions: Record<Role, string> = {
  Owner: "Full control of the workspace, billing and members.",
  Admin: "Manages members, projects and integrations.",
  Member: "Can create and edit issues, dashboards and reports.",
  Viewer: "Read-only access to dashboards and issues.",
};

export const initialMembers: Member[] = [
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

const activity: Record<string, ActivityItem[]> = {
  "m-01": [
    {
      id: "a-01-1",
      summary: "Updated workspace billing contact",
      detail: "Billing → Acme Labs, Inc.",
      date: "2026-02-10",
    },
    {
      id: "a-01-2",
      summary: "Promoted Daniel Reyes to Admin",
      detail: "Team → Roles",
      date: "2025-12-02",
    },
    {
      id: "a-01-3",
      summary: "Created the “Q1 retention” dashboard",
      detail: "Analytics → Dashboards",
      date: "2025-11-18",
    },
  ],
  "m-02": [
    {
      id: "a-02-1",
      summary: "Closed LUM-482 “Funnel chart drops the last step”",
      detail: "Issues → Web app",
      date: "2026-02-12",
    },
    {
      id: "a-02-2",
      summary: "Connected the GitHub integration",
      detail: "Settings → Integrations",
      date: "2026-02-06",
    },
    {
      id: "a-02-3",
      summary: "Invited Hana Sato as a Member",
      detail: "Team → Invitations",
      date: "2026-01-28",
    },
    {
      id: "a-02-4",
      summary: "Shared the “Signup conversion” report with the team",
      detail: "Analytics → Reports",
      date: "2026-01-15",
    },
  ],
  "m-03": [
    {
      id: "a-03-1",
      summary: "Opened LUM-497 “Export CSV times out on large projects”",
      detail: "Issues → Web app",
      date: "2026-02-11",
    },
    {
      id: "a-03-2",
      summary: "Commented on LUM-482",
      detail: "Issues → Web app",
      date: "2026-02-09",
    },
  ],
  "m-04": [
    {
      id: "a-04-1",
      summary: "Added the “Checkout” event to the tracking plan",
      detail: "Analytics → Events",
      date: "2026-02-08",
    },
    {
      id: "a-04-2",
      summary: "Resolved LUM-455 “Session replay skips idle time”",
      detail: "Issues → Mobile app",
      date: "2026-01-30",
    },
  ],
  "m-05": [],
  "m-06": [
    {
      id: "a-06-1",
      summary: "Viewed the “Weekly active teams” dashboard",
      detail: "Analytics → Dashboards",
      date: "2026-02-12",
    },
  ],
  "m-07": [
    {
      id: "a-07-1",
      summary: "Access suspended by Maya Okafor",
      detail: "Team → Members",
      date: "2026-01-09",
    },
    {
      id: "a-07-2",
      summary: "Resolved LUM-431 “Tooltip clipped on narrow screens”",
      detail: "Issues → Web app",
      date: "2025-12-19",
    },
  ],
  "m-08": [],
};

export function getMember(id: string): Member | undefined {
  return initialMembers.find((member) => member.id === id);
}

export function getActivity(id: string): ActivityItem[] {
  return activity[id] ?? [];
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0].charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
  return (first + last).toUpperCase();
}

/** Formats an ISO date (YYYY-MM-DD) deterministically, so server and client agree. */
export function formatDate(iso: string | null): string {
  if (!iso) return "Not joined yet";
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[month - 1]} ${day}, ${year}`;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: string): boolean {
  return emailPattern.test(value.trim());
}
```

Badges and shared bits:

```tsx src/components/team/badges.tsx
import { Tag } from "@once-ui-system/core";
import type { Role, Status } from "@/lib/data";

const roleScheme: Record<Role, "brand" | "accent" | "neutral" | "info"> = {
  Owner: "accent",
  Admin: "brand",
  Member: "info",
  Viewer: "neutral",
};

const statusScheme: Record<Status, "success" | "warning" | "danger"> = {
  Active: "success",
  Invited: "warning",
  Suspended: "danger",
};

export function RoleBadge({ role }: { role: Role }) {
  return (
    <Tag size="s" scheme={roleScheme[role]}>
      {role}
    </Tag>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <Tag size="s" scheme={statusScheme[status]}>
      {status}
    </Tag>
  );
}
```

```tsx src/components/team/TeamShell.tsx
import { Column, Row, SmartLink, Text, VisuallyHidden, Icon } from "@once-ui-system/core";

export function TeamShell({ children }: { children: React.ReactNode }) {
  return (
    <Column fillWidth flex={1}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Row
        as="header"
        fillWidth
        horizontal="center"
        borderBottom
        background="surface"
        paddingX="24"
        paddingY="12"
      >
        <Row fillWidth maxWidth="l" vertical="center" horizontal="between" gap="16">
          <SmartLink href="/" aria-label="Lumen, team home">
            <Row gap="8" vertical="center">
              <Icon name="sparkle" onBackground="brand-strong" />
              <Text variant="heading-strong-m">Lumen</Text>
            </Row>
          </SmartLink>
          <Row as="nav" aria-label="Workspace" gap="16" vertical="center">
            <Text variant="label-default-s" onBackground="neutral-weak" s={{ hide: true }}>
              Acme Labs
            </Text>
            <Row gap="4" vertical="center">
              <Icon name="people" size="s" onBackground="neutral-strong" />
              <Text variant="label-strong-s">Team</Text>
            </Row>
          </Row>
        </Row>
      </Row>
      <Column as="main" id="main" fillWidth horizontal="center" paddingX="24" paddingY="40" flex={1}>
        {children}
      </Column>
    </Column>
  );
}
```

The members table with search, role filter, row actions and the invite dialog:

```tsx src/components/team/MembersTable.tsx
"use client";

import {
  Avatar,
  Button,
  Column,
  DropdownWrapper,
  Heading,
  IconButton,
  Input,
  Option,
  Row,
  Select,
  SmartLink,
  Text,
  useToast,
} from "@once-ui-system/core";
import { useMemo, useState } from "react";
import { type Member, type Role, getInitials, initialMembers, roles } from "@/lib/data";
import { InviteDialog } from "./InviteDialog";
import { RoleBadge, StatusBadge } from "./badges";

const ALL = "all";

type RoleFilter = typeof ALL | Role;

export function MembersTable() {
  const { addToast } = useToast();
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>(ALL);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [roleTarget, setRoleTarget] = useState<string | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((member) => {
      if (roleFilter !== ALL && member.role !== roleFilter) return false;
      if (!q) return true;
      return (
        member.name.toLowerCase().includes(q) ||
        member.email.toLowerCase().includes(q)
      );
    });
  }, [members, query, roleFilter]);

  const filtering = query.trim() !== "" || roleFilter !== ALL;

  const clearFilters = () => {
    setQuery("");
    setRoleFilter(ALL);
  };

  const handleInvite = (email: string, role: Role) => {
    const name = email
      .split("@")[0]
      .split(/[._-]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
    setMembers((current) => [
      ...current,
      {
        id: `m-${String(current.length + 1).padStart(2, "0")}-new-${current.length}`,
        name: name || email,
        email,
        role,
        status: "Invited",
        joined: null,
      },
    ]);
    setInviteOpen(false);
    addToast({ variant: "success", message: `Invitation sent to ${email}.` });
  };

  const changeRole = (id: string, role: Role) => {
    const member = members.find((m) => m.id === id);
    setMembers((current) => current.map((m) => (m.id === id ? { ...m, role } : m)));
    setRoleTarget(null);
    if (member) {
      addToast({ variant: "success", message: `${member.name} is now ${role}.` });
    }
  };

  const resendInvite = (member: Member) => {
    addToast({ variant: "success", message: `Invite resent to ${member.email}.` });
  };

  const removeMember = (member: Member) => {
    setMembers((current) => current.filter((m) => m.id !== member.id));
    addToast({ variant: "success", message: `${member.name} was removed from the team.` });
  };

  const roleOptions = [
    { value: ALL, label: "All roles" },
    ...roles.map((role) => ({ value: role, label: role })),
  ];

  const target = roleTarget ? members.find((m) => m.id === roleTarget) : undefined;

  return (
    <Column maxWidth="l" fillWidth gap="24">
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
          <Text variant="body-default-s" onBackground="neutral-weak">
            {members.length} people in the Acme Labs workspace. Manage who can see and edit
            your analytics and issues.
          </Text>
        </Column>
        <Button prefixIcon="plus" onClick={() => setInviteOpen(true)}>
          Invite member
        </Button>
      </Row>

      <Row fillWidth gap="12" s={{ direction: "column" }}>
        <Column flex={3} fillWidth>
          <Input
            id="member-search"
            type="search"
            label="Search members"
            placeholder="Search by name or email"
            size="s"
            prefix={<span aria-hidden="true" />}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </Column>
        <Column flex={1} fillWidth>
          <Select
            id="role-filter"
            label="Role"
            size="s"
            options={roleOptions}
            value={roleFilter}
            onSelect={(value) => {
              const next = Array.isArray(value) ? value[0] : value;
              setRoleFilter((next || ALL) as RoleFilter);
            }}
          />
        </Column>
      </Row>

      <Text variant="body-default-xs" onBackground="neutral-weak" aria-live="polite" role="status">
        Showing {visible.length} of {members.length} members
      </Text>

      <Column background="surface" border radius="l" overflow="hidden">
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", minWidth: "44rem" }}
            aria-label="Team members"
          >
            <thead>
              <tr>
                {["Member", "Role", "Status", ""].map((heading, index) => (
                  <th
                    key={heading || "actions"}
                    scope="col"
                    style={{
                      textAlign: "left",
                      padding: "12px 16px",
                      borderBottom: "1px solid var(--neutral-alpha-medium)",
                      width: index === 3 ? "4rem" : undefined,
                    }}
                  >
                    {heading ? (
                      <Text variant="label-default-xs" onBackground="neutral-weak">
                        {heading}
                      </Text>
                    ) : (
                      <span
                        style={{
                          position: "absolute",
                          width: 1,
                          height: 1,
                          overflow: "hidden",
                          clip: "rect(0 0 0 0)",
                        }}
                      >
                        Actions
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((member) => (
                <tr key={member.id}>
                  <td style={cellStyle}>
                    <Row gap="12" vertical="center">
                      <Avatar
                        size="m"
                        value={getInitials(member.name)}
                        aria-hidden="true"
                      />
                      <Column gap="2" minWidth={0}>
                        <SmartLink
                          href={`/members/${member.id}`}
                          aria-label={`${member.name}, view profile`}
                        >
                          <Text variant="label-strong-s">{member.name}</Text>
                        </SmartLink>
                        <Text variant="body-default-xs" onBackground="neutral-weak">
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
                  <td style={{ ...cellStyle, textAlign: "right" }}>
                    <DropdownWrapper
                      placement="bottom-end"
                      trigger={
                        <IconButton
                          icon="moreHorizontal"
                          variant="tertiary"
                          size="s"
                          ariaLabel={`Actions for ${member.name}`}
                        />
                      }
                      dropdown={
                        <Column minWidth={12} padding="4" gap="2">
                          <Option
                            value="role"
                            label="Change role"
                            onClick={() => setRoleTarget(member.id)}
                          />
                          {member.status === "Invited" && (
                            <Option
                              value="resend"
                              label="Resend invite"
                              onClick={() => resendInvite(member)}
                            />
                          )}
                          <Option
                            value="remove"
                            label="Remove"
                            danger
                            onClick={() => removeMember(member)}
                          />
                        </Column>
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {visible.length === 0 && (
          <Column center gap="12" padding="40">
            <Text variant="heading-strong-s">No members found</Text>
            <Text variant="body-default-s" onBackground="neutral-weak" align="center">
              {filtering
                ? "Nobody matches your search and filter."
                : "Invite your first teammate to get started."}
            </Text>
            {filtering ? (
              <Button size="s" variant="secondary" onClick={clearFilters}>
                Clear search and filter
              </Button>
            ) : (
              <Button size="s" prefixIcon="plus" onClick={() => setInviteOpen(true)}>
                Invite member
              </Button>
            )}
          </Column>
        )}
      </Column>

      <InviteDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvite={handleInvite}
        existingEmails={members.map((m) => m.email.toLowerCase())}
      />

      <RoleDialog
        member={target}
        onClose={() => setRoleTarget(null)}
        onChange={changeRole}
      />
    </Column>
  );
}

const cellStyle: React.CSSProperties = {
  padding: "12px 16px",
  borderBottom: "1px solid var(--neutral-alpha-weak)",
  verticalAlign: "middle",
};

import { Dialog } from "@once-ui-system/core";
import { roleDescriptions } from "@/lib/data";

function RoleDialog({
  member,
  onClose,
  onChange,
}: {
  member: Member | undefined;
  onClose: () => void;
  onChange: (id: string, role: Role) => void;
}) {
  return (
    <Dialog
      open={!!member}
      onClose={onClose}
      title={member ? `Change role for ${member.name}` : "Change role"}
      description="Pick the access level this person should have."
    >
      {member && (
        <Column gap="8" paddingTop="8">
          {roles.map((role) => (
            <Button
              key={role}
              variant={member.role === role ? "primary" : "secondary"}
              fillWidth
              horizontal="between"
              onClick={() => onChange(member.id, role)}
              suffixIcon={member.role === role ? "check" : undefined}
              aria-pressed={member.role === role}
            >
              {role}
            </Button>
          ))}
          <Text variant="body-default-xs" onBackground="neutral-weak">
            {roleDescriptions[member.role]}
          </Text>
        </Column>
      )}
    </Dialog>
  );
}
```

The `prefix={<span aria-hidden />}` on the search input is pointless, so I'll fix that and move the import to the top while I'm at it. Final version of the file:

```tsx src/components/team/MembersTable.tsx
"use client";

import {
  Avatar,
  Button,
  Column,
  Dialog,
  DropdownWrapper,
  Heading,
  Icon,
  IconButton,
  Input,
  Option,
  Row,
  Select,
  SmartLink,
  Text,
  useToast,
} from "@once-ui-system/core";
import { useMemo, useState } from "react";
import {
  type Member,
  type Role,
  getInitials,
  initialMembers,
  roleDescriptions,
  roles,
} from "@/lib/data";
import { InviteDialog } from "./InviteDialog";
import { RoleBadge, StatusBadge } from "./badges";

const ALL = "all";

type RoleFilter = typeof ALL | Role;

const cellStyle: React.CSSProperties = {
  padding: "12px 16px",
  borderBottom: "1px solid var(--neutral-alpha-weak)",
  verticalAlign: "middle",
};

const srOnly: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
};

export function MembersTable() {
  const { addToast } = useToast();
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>(ALL);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [roleTarget, setRoleTarget] = useState<string | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((member) => {
      if (roleFilter !== ALL && member.role !== roleFilter) return false;
      if (!q) return true;
      return member.name.toLowerCase().includes(q) || member.email.toLowerCase().includes(q);
    });
  }, [members, query, roleFilter]);

  const filtering = query.trim() !== "" || roleFilter !== ALL;

  const clearFilters = () => {
    setQuery("");
    setRoleFilter(ALL);
  };

  const handleInvite = (email: string, role: Role) => {
    const name = email
      .split("@")[0]
      .split(/[._-]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
    setMembers((current) => [
      ...current,
      {
        id: `m-new-${current.length + 1}`,
        name: name || email,
        email,
        role,
        status: "Invited",
        joined: null,
      },
    ]);
    setInviteOpen(false);
    addToast({ variant: "success", message: `Invitation sent to ${email}.` });
  };

  const changeRole = (id: string, role: Role) => {
    const member = members.find((m) => m.id === id);
    setMembers((current) => current.map((m) => (m.id === id ? { ...m, role } : m)));
    setRoleTarget(null);
    if (member) {
      addToast({ variant: "success", message: `${member.name} is now ${role}.` });
    }
  };

  const resendInvite = (member: Member) => {
    addToast({ variant: "success", message: `Invite resent to ${member.email}.` });
  };

  const removeMember = (member: Member) => {
    setMembers((current) => current.filter((m) => m.id !== member.id));
    addToast({ variant: "success", message: `${member.name} was removed from the team.` });
  };

  const roleOptions = [
    { value: ALL, label: "All roles" },
    ...roles.map((role) => ({ value: role, label: role })),
  ];

  const target = roleTarget ? members.find((m) => m.id === roleTarget) : undefined;

  return (
    <Column maxWidth="l" fillWidth gap="24">
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
          <Text variant="body-default-s" onBackground="neutral-weak">
            {members.length} people in the Acme Labs workspace. Manage who can see and edit your
            analytics and issues.
          </Text>
        </Column>
        <Button prefixIcon="plus" onClick={() => setInviteOpen(true)}>
          Invite member
        </Button>
      </Row>

      <Row fillWidth gap="12" s={{ direction: "column" }}>
        <Column flex={3} fillWidth>
          <Input
            id="member-search"
            type="search"
            label="Search members"
            placeholder="Search by name or email"
            size="s"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </Column>
        <Column flex={1} fillWidth>
          <Select
            id="role-filter"
            label="Role"
            size="s"
            options={roleOptions}
            value={roleFilter}
            onSelect={(value) => {
              const next = Array.isArray(value) ? value[0] : value;
              setRoleFilter((next || ALL) as RoleFilter);
            }}
          />
        </Column>
      </Row>

      <Text variant="body-default-xs" onBackground="neutral-weak" role="status" aria-live="polite">
        Showing {visible.length} of {members.length} members
      </Text>

      <Column background="surface" border radius="l" overflow="hidden">
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", minWidth: "42rem" }}
            aria-label="Team members"
          >
            <thead>
              <tr>
                <th scope="col" style={headStyle}>
                  <Text variant="label-default-xs" onBackground="neutral-weak">
                    Member
                  </Text>
                </th>
                <th scope="col" style={headStyle}>
                  <Text variant="label-default-xs" onBackground="neutral-weak">
                    Role
                  </Text>
                </th>
                <th scope="col" style={headStyle}>
                  <Text variant="label-default-xs" onBackground="neutral-weak">
                    Status
                  </Text>
                </th>
                <th scope="col" style={{ ...headStyle, width: "4rem" }}>
                  <span style={srOnly}>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((member) => (
                <tr key={member.id}>
                  <td style={cellStyle}>
                    <Row gap="12" vertical="center">
                      <Avatar size="m" value={getInitials(member.name)} />
                      <Column gap="2">
                        <SmartLink href={`/members/${member.id}`}>
                          <Text variant="label-strong-s">{member.name}</Text>
                        </SmartLink>
                        <Text variant="body-default-xs" onBackground="neutral-weak">
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
                  <td style={{ ...cellStyle, textAlign: "right" }}>
                    <DropdownWrapper
                      placement="bottom-end"
                      trigger={
                        <IconButton
                          icon="moreHorizontal"
                          variant="tertiary"
                          size="s"
                          ariaLabel={`Actions for ${member.name}`}
                        />
                      }
                      dropdown={
                        <Column minWidth={12} padding="4" gap="2">
                          <Option
                            value="role"
                            label="Change role"
                            onClick={() => setRoleTarget(member.id)}
                          />
                          {member.status === "Invited" && (
                            <Option
                              value="resend"
                              label="Resend invite"
                              onClick={() => resendInvite(member)}
                            />
                          )}
                          <Option
                            value="remove"
                            label="Remove"
                            danger
                            onClick={() => removeMember(member)}
                          />
                        </Column>
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {visible.length === 0 && (
          <Column center gap="12" padding="40">
            <Icon name="people" onBackground="neutral-weak" />
            <Text variant="heading-strong-s">No members found</Text>
            <Text variant="body-default-s" onBackground="neutral-weak" align="center">
              {filtering
                ? "Nobody matches your search and filter."
                : "Invite your first teammate to get started."}
            </Text>
            {filtering ? (
              <Button size="s" variant="secondary" onClick={clearFilters}>
                Clear search and filter
              </Button>
            ) : (
              <Button size="s" prefixIcon="plus" onClick={() => setInviteOpen(true)}>
                Invite member
              </Button>
            )}
          </Column>
        )}
      </Column>

      <InviteDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvite={handleInvite}
        existingEmails={members.map((m) => m.email.toLowerCase())}
      />

      <Dialog
        open={!!target}
        onClose={() => setRoleTarget(null)}
        title={target ? `Change role for ${target.name}` : "Change role"}
        description="Pick the access level this person should have."
      >
        {target && (
          <Column gap="8" paddingTop="8">
            {roles.map((role) => (
              <Button
                key={role}
                variant={target.role === role ? "primary" : "secondary"}
                fillWidth
                horizontal="between"
                suffixIcon={target.role === role ? "check" : undefined}
                aria-pressed={target.role === role}
                onClick={() => changeRole(target.id, role)}
              >
                {role}
              </Button>
            ))}
            <Text variant="body-default-xs" onBackground="neutral-weak">
              {roleDescriptions[target.role]}
            </Text>
          </Column>
        )}
      </Dialog>
    </Column>
  );
}

const headStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "12px 16px",
  borderBottom: "1px solid var(--neutral-alpha-medium)",
};
```

The invite dialog with validation:

```tsx src/components/team/InviteDialog.tsx
"use client";

import { Button, Column, Dialog, Row, Select, Textarea, Input } from "@once-ui-system/core";
import { useEffect, useState } from "react";
import { type Role, isValidEmail, roles } from "@/lib/data";

type Errors = {
  email?: string;
  role?: string;
};

export function InviteDialog({
  open,
  onClose,
  onInvite,
  existingEmails,
}: {
  open: boolean;
  onClose: () => void;
  onInvite: (email: string, role: Role) => void;
  existingEmails: string[];
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (!open) {
      setEmail("");
      setRole("");
      setMessage("");
      setErrors({});
    }
  }, [open]);

  const validate = (): Errors => {
    const next: Errors = {};
    const trimmed = email.trim();
    if (!trimmed) {
      next.email = "Enter an email address.";
    } else if (!isValidEmail(trimmed)) {
      next.email = "Enter a valid email address, like name@company.com.";
    } else if (existingEmails.includes(trimmed.toLowerCase())) {
      next.email = "This person is already on the team.";
    }
    if (!role) {
      next.role = "Choose a role for this person.";
    }
    return next;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onInvite(email.trim(), role as Role);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Invite a member"
      description="They’ll get an email with a link to join the Acme Labs workspace."
    >
      <form onSubmit={handleSubmit} noValidate aria-label="Invite a member">
        <Column gap="16" paddingTop="8">
          <Input
            id="invite-email"
            type="email"
            label="Email"
            placeholder="name@company.com"
            value={email}
            required
            autoComplete="off"
            error={!!errors.email}
            errorMessage={errors.email}
            aria-invalid={!!errors.email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (errors.email) setErrors((current) => ({ ...current, email: undefined }));
            }}
          />
          <Select
            id="invite-role"
            label="Role"
            options={roles.map((r) => ({ value: r, label: r }))}
            value={role}
            error={!!errors.role}
            errorMessage={errors.role}
            onSelect={(value) => {
              const next = Array.isArray(value) ? value[0] : value;
              setRole(next ?? "");
              if (errors.role) setErrors((current) => ({ ...current, role: undefined }));
            }}
          />
          <Textarea
            id="invite-message"
            label="Message (optional)"
            lines={3}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
          <Row gap="12" horizontal="end" s={{ direction: "column-reverse" }}>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" prefixIcon="send">
              Send invite
            </Button>
          </Row>
        </Column>
      </form>
    </Dialog>
  );
}
```

The detail page:

```tsx src/app/members/[id]/page.tsx
import { Avatar, Breadcrumbs, Button, Column, Grid, Heading, Row, Text } from "@once-ui-system/core";
import { notFound } from "next/navigation";
import { RoleBadge, StatusBadge } from "@/components/team/badges";
import { TeamShell } from "@/components/team/TeamShell";
import {
  formatDate,
  getActivity,
  getInitials,
  getMember,
  initialMembers,
  roleDescriptions,
} from "@/lib/data";

export function generateStaticParams() {
  return initialMembers.map((member) => ({ id: member.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = getMember(id);
  return {
    title: member ? `${member.name} · Team · Lumen` : "Member not found · Lumen",
  };
}

export default async function MemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = getMember(id);
  if (!member) notFound();

  const activity = getActivity(member.id);

  return (
    <TeamShell>
      <Column maxWidth="m" fillWidth gap="32">
        <Breadcrumbs
          aria-label="Breadcrumb"
          items={[
            { label: "Team", href: "/" },
            { label: member.name },
          ]}
        />

        <Row gap="24" vertical="center" s={{ direction: "column", vertical: "start" }}>
          <Avatar size="xl" value={getInitials(member.name)} />
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

        <Column as="section" aria-labelledby="profile-heading" gap="16">
          <Heading as="h2" id="profile-heading" variant="heading-strong-l">
            Profile
          </Heading>
          <Grid columns="2" s={{ columns: 1 }} gap="16">
            <Column background="surface" border radius="l" padding="20" gap="4">
              <Text variant="label-default-xs" onBackground="neutral-weak">
                Role
              </Text>
              <Text variant="heading-strong-s">{member.role}</Text>
              <Text variant="body-default-s" onBackground="neutral-weak">
                {roleDescriptions[member.role]}
              </Text>
            </Column>
            <Column background="surface" border radius="l" padding="20" gap="4">
              <Text variant="label-default-xs" onBackground="neutral-weak">
                Status
              </Text>
              <Text variant="heading-strong-s">{member.status}</Text>
              <Text variant="body-default-s" onBackground="neutral-weak">
                {member.status === "Active" && "Has access to the workspace."}
                {member.status === "Invited" && "Invitation sent, waiting for them to accept."}
                {member.status === "Suspended" && "Access is paused until an admin restores it."}
              </Text>
            </Column>
            <Column background="surface" border radius="l" padding="20" gap="4">
              <Text variant="label-default-xs" onBackground="neutral-weak">
                Joined
              </Text>
              <Text variant="heading-strong-s">{formatDate(member.joined)}</Text>
            </Column>
            <Column background="surface" border radius="l" padding="20" gap="4">
              <Text variant="label-default-xs" onBackground="neutral-weak">
                Email
              </Text>
              <Text variant="heading-strong-s">{member.email}</Text>
            </Column>
          </Grid>
        </Column>

        <Column as="section" aria-labelledby="activity-heading" gap="16">
          <Heading as="h2" id="activity-heading" variant="heading-strong-l">
            Recent activity
          </Heading>
          {activity.length === 0 ? (
            <Column background="surface" border radius="l" padding="24">
              <Text variant="body-default-s" onBackground="neutral-weak">
                {member.status === "Invited"
                  ? "No activity yet. Activity appears here once they accept the invite."
                  : "No recent activity."}
              </Text>
            </Column>
          ) : (
            <Column as="ol" background="surface" border radius="l" margin="0" padding="0">
              {activity.map((item, index) => (
                <Column
                  as="li"
                  key={item.id}
                  gap="4"
                  padding="20"
                  borderTop={index > 0}
                  style={{ listStyle: "none" }}
                >
                  <Text variant="label-strong-s">{item.summary}</Text>
                  <Row gap="8" wrap>
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      {item.detail}
                    </Text>
                    <Text variant="body-default-xs" onBackground="neutral-weak" aria-hidden="true">
                      ·
                    </Text>
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      {formatDate(item.date)}
                    </Text>
                  </Row>
                </Column>
              ))}
            </Column>
          )}
        </Column>

        <Row>
          <Button href="/" variant="secondary" prefixIcon="arrowLeft">
            Back to team
          </Button>
        </Row>
      </Column>
    </TeamShell>
  );
}
```

The home page at `/` (overwriting the placeholder):

```tsx src/app/page.tsx
import { TeamShell } from "@/components/team/TeamShell";
import { MembersTable } from "@/components/team/MembersTable";

export const metadata = {
  title: "Team · Lumen",
  description:
    "Manage the people in your Lumen workspace: roles, invitations and access for your software team.",
};

export default function Page() {
  return (
    <TeamShell>
      <MembersTable />
    </TeamShell>
  );
}
```