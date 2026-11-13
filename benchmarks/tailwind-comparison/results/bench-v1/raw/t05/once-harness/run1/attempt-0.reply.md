I have what I need. Writing the files now.

```ts lib/data.ts
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

export const PRODUCT_NAME = "Lumen";
export const WORKSPACE_NAME = "Acme Labs";

export const ROLES: Role[] = ["Owner", "Admin", "Member", "Viewer"];

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  Owner: "Full control, including billing and deleting the workspace.",
  Admin: "Manages members, projects and integrations.",
  Member: "Can create and edit issues, dashboards and reports.",
  Viewer: "Read-only access to dashboards and issues.",
};

export const MEMBERS: Member[] = [
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

export type Activity = {
  id: string;
  icon: "bolt" | "chat" | "barChart" | "flag" | "people" | "settings" | "mail" | "lock";
  text: string;
  when: string;
};

const ACTIVITY: Record<string, Activity[]> = {
  "m-01": [
    { id: "a1", icon: "settings", text: "Updated the workspace billing plan to Team", when: "2 days ago" },
    { id: "a2", icon: "people", text: "Invited Ines Duarte as Viewer", when: "4 days ago" },
    { id: "a3", icon: "barChart", text: "Shared the “Weekly retention” dashboard", when: "last week" },
  ],
  "m-02": [
    { id: "a1", icon: "flag", text: "Closed issue LUM-212 “Funnel chart drops last step”", when: "3 hours ago" },
    { id: "a2", icon: "people", text: "Changed Leo Brandt's access to Suspended", when: "yesterday" },
    { id: "a3", icon: "bolt", text: "Connected the GitHub integration to the Web app project", when: "3 days ago" },
    { id: "a4", icon: "chat", text: "Commented on LUM-198 “Export CSV times out”", when: "last week" },
  ],
  "m-03": [
    { id: "a1", icon: "barChart", text: "Created the “Activation by cohort” report", when: "yesterday" },
    { id: "a2", icon: "flag", text: "Opened issue LUM-221 “Session replay missing clicks”", when: "2 days ago" },
    { id: "a3", icon: "chat", text: "Commented on LUM-205 “Dark mode contrast”", when: "5 days ago" },
  ],
  "m-04": [
    { id: "a1", icon: "flag", text: "Moved LUM-217 to In review", when: "5 hours ago" },
    { id: "a2", icon: "bolt", text: "Pushed a fix linked to LUM-209", when: "2 days ago" },
  ],
  "m-05": [
    { id: "a1", icon: "mail", text: "Invitation sent by Daniel Reyes", when: "3 days ago" },
  ],
  "m-06": [
    { id: "a1", icon: "barChart", text: "Viewed the “Weekly retention” dashboard", when: "this morning" },
    { id: "a2", icon: "barChart", text: "Viewed the “Activation by cohort” report", when: "last week" },
  ],
  "m-07": [
    { id: "a1", icon: "lock", text: "Access suspended by Daniel Reyes", when: "yesterday" },
    { id: "a2", icon: "flag", text: "Opened issue LUM-190 “Alert emails delayed”", when: "3 weeks ago" },
  ],
  "m-08": [
    { id: "a1", icon: "mail", text: "Invitation sent by Maya Okafor", when: "4 days ago" },
  ],
};

export function getMember(id: string): Member | undefined {
  return MEMBERS.find((m) => m.id === id);
}

export function getActivity(id: string): Activity[] {
  return ACTIVITY[id] ?? [];
}

export function getInitials(name: string): string {
  const parts = name.split(/[\s@.]+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const second = parts.length > 1 ? parts[1]?.[0] ?? "" : "";
  return (first + second).toUpperCase();
}

export function formatDate(iso: string | null): string {
  if (!iso) return "Not joined yet";
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
```

```tsx components/Badges.tsx
import { Tag } from "@once-ui-system/core";
import type { Role, Status } from "@/lib/data";

type Tone = "neutral" | "brand" | "accent" | "info" | "danger" | "warning" | "success";

const ROLE_TONE: Record<Role, Tone> = {
  Owner: "accent",
  Admin: "brand",
  Member: "neutral",
  Viewer: "info",
};

const STATUS_TONE: Record<Status, Tone> = {
  Active: "success",
  Invited: "warning",
  Suspended: "danger",
};

export function RoleBadge({ role }: { role: Role }) {
  return (
    <Tag size="s" tone={ROLE_TONE[role]} as="span">
      {role}
    </Tag>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <Tag size="s" tone={STATUS_TONE[status]} as="span">
      {status}
    </Tag>
  );
}
```

```tsx components/InviteDialog.tsx
"use client";

import { Button, Column, Dialog, Input, Row, Select, Textarea } from "@once-ui-system/core";
import { useState } from "react";
import { ROLES, ROLE_DESCRIPTIONS, type Role } from "@/lib/data";

export type InvitePayload = { email: string; role: Role; message: string };

type Errors = { email?: string; role?: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function InviteDialog({
  open,
  onClose,
  onInvite,
}: {
  open: boolean;
  onClose: () => void;
  onInvite: (payload: InvitePayload) => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
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
      description="They'll get an email with a link to join your Lumen workspace."
    >
      <Column as="form" gap="16" onSubmit={handleSubmit} noValidate aria-label="Invite a member">
        <Input
          id="invite-email"
          label="Email address"
          type="email"
          value={email}
          required
          autoComplete="off"
          error={Boolean(errors.email)}
          errorMessage={errors.email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
        />
        <Column gap="8" fillWidth>
          <Select
            id="invite-role"
            label="Role"
            value={role}
            error={Boolean(errors.role)}
            errorMessage={errors.role}
            options={ROLES.map((r) => ({
              value: r,
              label: r,
              description: ROLE_DESCRIPTIONS[r],
            }))}
            onValueChange={(value) => {
              setRole(Array.isArray(value) ? (value[0] ?? "") : value);
              if (errors.role) setErrors((prev) => ({ ...prev, role: undefined }));
            }}
          />
        </Column>
        <Textarea
          id="invite-message"
          label="Message (optional)"
          lines={3}
          value={message}
          description="Add a note to the invitation email."
          onChange={(event) => setMessage(event.target.value)}
        />
        <Row gap="12" horizontal="end" s={{ direction: "column-reverse" }}>
          <Button type="button" variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" prefixIcon="send">
            Send invite
          </Button>
        </Row>
      </Column>
    </Dialog>
  );
}
```

```tsx components/MemberActions.tsx
"use client";

import { Dropdown, IconButton, Option } from "@once-ui-system/core";
import type { Member } from "@/lib/data";

export type MemberAction = "change-role" | "resend" | "remove";

export function MemberActions({
  member,
  onAction,
}: {
  member: Member;
  onAction: (action: MemberAction, member: Member) => void;
}) {
  return (
    <Dropdown
      placement="bottom-end"
      minWidth={13}
      onSelect={(value) => onAction(value as MemberAction, member)}
      trigger={
        <IconButton
          icon="moreHorizontal"
          variant="tertiary"
          size="s"
          aria-label={`Actions for ${member.name}`}
          tooltip="Actions"
        />
      }
    >
      <Option value="change-role" label="Change role" prefix={<span aria-hidden />} />
      {member.status === "Invited" && <Option value="resend" label="Resend invite" />}
      <Option value="remove" label="Remove" danger />
    </Dropdown>
  );
}
```

```tsx components/ChangeRoleDialog.tsx
"use client";

import { Button, Column, Dialog, Row, Select } from "@once-ui-system/core";
import { useState } from "react";
import { ROLES, ROLE_DESCRIPTIONS, type Member, type Role } from "@/lib/data";

export function ChangeRoleDialog({
  member,
  onClose,
  onSave,
}: {
  member: Member | null;
  onClose: () => void;
  onSave: (id: string, role: Role) => void;
}) {
  return (
    <Dialog
      open={member !== null}
      onClose={onClose}
      title="Change role"
      description={member ? `Choose a new role for ${member.name}.` : undefined}
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
  onSave: (id: string, role: Role) => void;
}) {
  const [role, setRole] = useState<string>(member.role);

  return (
    <Column
      as="form"
      gap="16"
      aria-label={`Change role for ${member.name}`}
      onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSave(member.id, role as Role);
      }}
    >
      <Select
        id="change-role"
        label="Role"
        value={role}
        options={ROLES.map((r) => ({ value: r, label: r, description: ROLE_DESCRIPTIONS[r] }))}
        onValueChange={(value) => setRole(Array.isArray(value) ? (value[0] ?? member.role) : value)}
      />
      <Row gap="12" horizontal="end" s={{ direction: "column-reverse" }}>
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Save role</Button>
      </Row>
    </Column>
  );
}
```

```tsx components/TeamView.tsx
"use client";

import {
  Avatar,
  Button,
  Column,
  Heading,
  Input,
  Row,
  Select,
  SmartLink,
  Text,
  VisuallyHidden,
  useToast,
} from "@once-ui-system/core";
import { useMemo, useState } from "react";
import { MEMBERS, ROLES, WORKSPACE_NAME, getInitials, type Member } from "@/lib/data";
import { RoleBadge, StatusBadge } from "./Badges";
import { ChangeRoleDialog } from "./ChangeRoleDialog";
import { InviteDialog, type InvitePayload } from "./InviteDialog";
import { MemberActions, type MemberAction } from "./MemberActions";
import styles from "./TeamView.module.css";

const ALL_ROLES = "all";

function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function TeamView() {
  const { addToast } = useToast();
  const [members, setMembers] = useState<Member[]>(MEMBERS);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>(ALL_ROLES);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [roleTarget, setRoleTarget] = useState<Member | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      if (roleFilter !== ALL_ROLES && m.role !== roleFilter) return false;
      if (!q) return true;
      return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
    });
  }, [members, query, roleFilter]);

  const filtersActive = query.trim() !== "" || roleFilter !== ALL_ROLES;

  const handleAction = (action: MemberAction, member: Member) => {
    if (action === "change-role") {
      setRoleTarget(member);
    } else if (action === "resend") {
      addToast({ tone: "success", message: `Invitation resent to ${member.email}.` });
    } else {
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
      addToast({ tone: "neutral", message: `${member.name} was removed from the team.` });
    }
  };

  const handleInvite = ({ email, role }: InvitePayload) => {
    const exists = members.some((m) => m.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      addToast({ tone: "warning", message: `${email} is already on the team.` });
      return;
    }
    const next: Member = {
      id: `m-${String(Date.now()).slice(-6)}`,
      name: nameFromEmail(email),
      email,
      role,
      status: "Invited",
      joined: null,
    };
    setMembers((prev) => [...prev, next]);
    setInviteOpen(false);
    addToast({ tone: "success", message: `Invitation sent to ${email}.` });
  };

  const clearFilters = () => {
    setQuery("");
    setRoleFilter(ALL_ROLES);
  };

  return (
    <Column as="main" fillWidth horizontal="center" paddingY="40" paddingX="16" s={{ paddingY: "24" }}>
      <Column maxWidth="l" gap="24">
        <Row
          fillWidth
          horizontal="between"
          vertical="end"
          gap="16"
          s={{ direction: "column", horizontal: "start", vertical: "start" }}
        >
          <Column gap="8">
            <Text textVariant="label-default-s" onBackground="brand-medium">
              {WORKSPACE_NAME} · Lumen
            </Text>
            <Heading as="h1" textVariant="display-strong-xs">
              Team
            </Heading>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              Manage who can see and change your analytics and issues.
            </Text>
          </Column>
          <Button prefixIcon="plus" onClick={() => setInviteOpen(true)}>
            Invite member
          </Button>
        </Row>

        <Row fillWidth gap="12" s={{ direction: "column" }} vertical="end">
          <Row flex={1} fillWidth>
            <Input
              id="member-search"
              label="Search members"
              type="search"
              size="s"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              prefix={<span aria-hidden />}
            />
          </Row>
          <Row minWidth={14} s={{ fillWidth: true }}>
            <Select
              id="role-filter"
              label="Filter by role"
              size="s"
              value={roleFilter}
              options={[
                { value: ALL_ROLES, label: "All roles" },
                ...ROLES.map((r) => ({ value: r, label: r })),
              ]}
              onValueChange={(value) =>
                setRoleFilter(Array.isArray(value) ? (value[0] ?? ALL_ROLES) : value || ALL_ROLES)
              }
            />
          </Row>
        </Row>

        <Column background="surface" border radius="l" overflow="hidden" fillWidth>
          <div className={styles.scroll}>
            <table className={styles.table}>
              <caption>
                <VisuallyHidden>
                  Team members of {WORKSPACE_NAME}. {visible.length} shown.
                </VisuallyHidden>
              </caption>
              <thead>
                <tr>
                  <th scope="col">Member</th>
                  <th scope="col" className={styles.hideOnPhone}>
                    Email
                  </th>
                  <th scope="col">Role</th>
                  <th scope="col" className={styles.hideOnSmall}>
                    Status
                  </th>
                  <th scope="col" className={styles.actionsCol}>
                    <VisuallyHidden>Actions</VisuallyHidden>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <Row gap="12" vertical="center">
                        <Avatar size="m" value={getInitials(member.name)} />
                        <Column gap="2" minWidth={0}>
                          <SmartLink href={`/members/${member.id}`}>
                            <Text textVariant="label-strong-s">{member.name}</Text>
                          </SmartLink>
                          <span className={styles.showOnPhone}>
                            <Text textVariant="body-default-xs" onBackground="neutral-weak">
                              {member.email}
                            </Text>
                          </span>
                          <span className={styles.showOnSmall}>
                            <StatusBadge status={member.status} />
                          </span>
                        </Column>
                      </Row>
                    </td>
                    <td className={styles.hideOnPhone}>
                      <Text textVariant="body-default-s" onBackground="neutral-weak">
                        {member.email}
                      </Text>
                    </td>
                    <td>
                      <RoleBadge role={member.role} />
                    </td>
                    <td className={styles.hideOnSmall}>
                      <StatusBadge status={member.status} />
                    </td>
                    <td className={styles.actionsCol}>
                      <MemberActions member={member} onAction={handleAction} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {visible.length === 0 && (
            <Column center gap="12" padding="40" role="status">
              <Text textVariant="label-strong-m">No members found</Text>
              <Text textVariant="body-default-s" onBackground="neutral-weak" align="center">
                {filtersActive
                  ? "Nobody matches your search and role filter."
                  : "Invite your first teammate to get started."}
              </Text>
              {filtersActive ? (
                <Button size="s" variant="secondary" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : (
                <Button size="s" prefixIcon="plus" onClick={() => setInviteOpen(true)}>
                  Invite member
                </Button>
              )}
            </Column>
          )}
        </Column>

        <Text textVariant="body-default-xs" onBackground="neutral-weak" aria-live="polite">
          Showing {visible.length} of {members.length} members
        </Text>
      </Column>

      <InviteDialog open={inviteOpen} onClose={() => setInviteOpen(false)} onInvite={handleInvite} />
      <ChangeRoleDialog
        member={roleTarget}
        onClose={() => setRoleTarget(null)}
        onSave={(id, role) => {
          setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
          const person = members.find((m) => m.id === id);
          setRoleTarget(null);
          addToast({
            tone: "success",
            message: person ? `${person.name} is now ${role}.` : "Role updated.",
          });
        }}
      />
    </Column>
  );
}
```

```css components/TeamView.module.css
.scroll {
  width: 100%;
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.table caption {
  caption-side: top;
}

.table th {
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--neutral-on-background-weak);
  border-bottom: 1px solid var(--neutral-alpha-medium);
  white-space: nowrap;
}

.table td {
  padding: 0.75rem 1rem;
  vertical-align: middle;
  border-bottom: 1px solid var(--neutral-alpha-weak);
}

.table tbody tr:last-child td {
  border-bottom: none;
}

.table tbody tr:hover {
  background: var(--neutral-alpha-weak);
}

.actionsCol {
  width: 1%;
  text-align: right;
  white-space: nowrap;
}

.showOnPhone,
.showOnSmall {
  display: none;
}

@media (max-width: 1024px) {
  .hideOnSmall {
    display: none;
  }
  .showOnSmall {
    display: inline-flex;
    margin-top: 0.25rem;
  }
}

@media (max-width: 768px) {
  .hideOnPhone {
    display: none;
  }
  .showOnPhone {
    display: block;
  }
  .table th,
  .table td {
    padding: 0.75rem;
  }
}
```

```tsx components/MemberDetail.tsx
import { Avatar, Column, Grid, Heading, Icon, Row, SmartLink, Text } from "@once-ui-system/core";
import {
  ROLE_DESCRIPTIONS,
  formatDate,
  getActivity,
  getInitials,
  type Member,
} from "@/lib/data";
import { RoleBadge, StatusBadge } from "./Badges";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Column gap="4" as="div">
      <Text textVariant="label-default-xs" onBackground="neutral-weak">
        {label}
      </Text>
      {children}
    </Column>
  );
}

export function MemberDetail({ member }: { member: Member }) {
  const activity = getActivity(member.id);

  return (
    <Column as="main" fillWidth horizontal="center" paddingY="40" paddingX="16" s={{ paddingY: "24" }}>
      <Column maxWidth="m" gap="24">
        <Row>
          <SmartLink href="/" prefixIcon="chevronLeft">
            Back to team
          </SmartLink>
        </Row>

        <Row gap="20" vertical="center" s={{ direction: "column", vertical: "start" }}>
          <Avatar size="xl" value={getInitials(member.name)} />
          <Column gap="8">
            <Heading as="h1" textVariant="display-strong-xs">
              {member.name}
            </Heading>
            <Text textVariant="body-default-m" onBackground="neutral-weak">
              {member.email}
            </Text>
            <Row gap="8" wrap>
              <RoleBadge role={member.role} />
              <StatusBadge status={member.status} />
            </Row>
          </Column>
        </Row>

        <Column as="section" aria-labelledby="profile-heading" background="surface" border radius="l" padding="24" gap="20">
          <Heading as="h2" id="profile-heading" textVariant="heading-strong-m">
            Profile
          </Heading>
          <Grid columns="2" s={{ columns: "1" }} gap="20">
            <Field label="Role">
              <Row>
                <RoleBadge role={member.role} />
              </Row>
              <Text textVariant="body-default-s" onBackground="neutral-weak">
                {ROLE_DESCRIPTIONS[member.role]}
              </Text>
            </Field>
            <Field label="Status">
              <Row>
                <StatusBadge status={member.status} />
              </Row>
            </Field>
            <Field label="Email">
              <Text textVariant="body-default-s">{member.email}</Text>
            </Field>
            <Field label="Joined">
              <Text textVariant="body-default-s">{formatDate(member.joined)}</Text>
            </Field>
          </Grid>
        </Column>

        <Column as="section" aria-labelledby="activity-heading" background="surface" border radius="l" padding="24" gap="16">
          <Heading as="h2" id="activity-heading" textVariant="heading-strong-m">
            Recent activity
          </Heading>
          {activity.length === 0 ? (
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              No activity yet.
            </Text>
          ) : (
            <Column as="ul" gap="16" margin="0" padding="0">
              {activity.map((item) => (
                <Row as="li" key={item.id} gap="12" vertical="start">
                  <Row
                    fit
                    padding="8"
                    radius="m"
                    background="neutral-alpha-weak"
                    aria-hidden="true"
                  >
                    <Icon name={item.icon} size="s" />
                  </Row>
                  <Column gap="2" flex={1}>
                    <Text textVariant="body-default-s">{item.text}</Text>
                    <Text textVariant="body-default-xs" onBackground="neutral-weak">
                      {item.when}
                    </Text>
                  </Column>
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

```tsx app/page.tsx
import { TeamView } from "@/components/TeamView";

export default function Page() {
  return <TeamView />;
}
```

```tsx app/members/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MemberDetail } from "@/components/MemberDetail";
import { MEMBERS, getMember } from "@/lib/data";

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return MEMBERS.map((m) => ({ id: m.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  const member = getMember(id);
  return { title: member ? `${member.name} · Team · Lumen` : "Member not found · Lumen" };
}

export default async function MemberPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const member = getMember(id);
  if (!member) notFound();
  return <MemberDetail member={member} />;
}
```