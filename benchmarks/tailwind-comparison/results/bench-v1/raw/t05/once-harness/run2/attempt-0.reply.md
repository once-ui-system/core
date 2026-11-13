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

export type Activity = {
  id: string;
  summary: string;
  detail: string;
  when: string;
};

export const ROLES: Role[] = ["Owner", "Admin", "Member", "Viewer"];

export const PRODUCT = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking for small software teams",
  workspace: "Acme Labs",
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

const activityByMember: Record<string, Activity[]> = {
  "m-01": [
    {
      id: "a-01-1",
      summary: "Updated billing plan",
      detail: "Switched the workspace to the Team plan (10 seats).",
      when: "2 days ago",
    },
    {
      id: "a-01-2",
      summary: "Changed a role",
      detail: "Promoted Daniel Reyes to Admin.",
      when: "3 weeks ago",
    },
    {
      id: "a-01-3",
      summary: "Created dashboard",
      detail: "Built the “Weekly retention” dashboard.",
      when: "1 month ago",
    },
  ],
  "m-02": [
    {
      id: "a-02-1",
      summary: "Closed issue LUM-214",
      detail: "Fixed the funnel chart dropping events after midnight UTC.",
      when: "Today, 09:42",
    },
    {
      id: "a-02-2",
      summary: "Invited Hana Sato",
      detail: "Sent a Member invite to hana@acmelabs.io.",
      when: "Yesterday",
    },
    {
      id: "a-02-3",
      summary: "Edited saved view",
      detail: "Renamed “Checkout drop-off” to “Checkout drop-off (mobile)”.",
      when: "4 days ago",
    },
    {
      id: "a-02-4",
      summary: "Connected an integration",
      detail: "Linked the GitHub repository acmelabs/web-app.",
      when: "2 weeks ago",
    },
  ],
  "m-03": [
    {
      id: "a-03-1",
      summary: "Commented on LUM-231",
      detail: "Shared a session replay showing the onboarding stall.",
      when: "Yesterday",
    },
    {
      id: "a-03-2",
      summary: "Opened issue LUM-236",
      detail: "Reported a duplicate event in the signup funnel.",
      when: "5 days ago",
    },
  ],
  "m-04": [
    {
      id: "a-04-1",
      summary: "Resolved issue LUM-228",
      detail: "Patched the CSV export timeout for large projects.",
      when: "3 days ago",
    },
    {
      id: "a-04-2",
      summary: "Created saved view",
      detail: "Added “Errors by release” to the shared views.",
      when: "1 week ago",
    },
  ],
  "m-05": [],
  "m-06": [
    {
      id: "a-06-1",
      summary: "Viewed dashboard",
      detail: "Opened “Weekly retention”.",
      when: "Today, 08:15",
    },
    {
      id: "a-06-2",
      summary: "Exported report",
      detail: "Downloaded the March activation report as PDF.",
      when: "1 week ago",
    },
  ],
  "m-07": [
    {
      id: "a-07-1",
      summary: "Account suspended",
      detail: "Access paused by an admin pending a security review.",
      when: "6 weeks ago",
    },
    {
      id: "a-07-2",
      summary: "Commented on LUM-190",
      detail: "Asked for more detail on the alerting rules.",
      when: "7 weeks ago",
    },
  ],
  "m-08": [],
};

export function getMember(id: string): Member | undefined {
  return members.find((member) => member.id === id);
}

export function getActivity(id: string): Activity[] {
  return activityByMember[id] ?? [];
}

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

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
```

```tsx components/Badges.tsx
import { Tag } from "@once-ui-system/core";
import type { Role, Status } from "@/lib/data";

type Tone = "neutral" | "brand" | "accent" | "info" | "danger" | "warning" | "success";

const roleTone: Record<Role, Tone> = {
  Owner: "accent",
  Admin: "brand",
  Member: "neutral",
  Viewer: "info",
};

const statusTone: Record<Status, Tone> = {
  Active: "success",
  Invited: "warning",
  Suspended: "danger",
};

export function RoleBadge({ role }: { role: Role }) {
  return (
    <Tag size="s" tone={roleTone[role]} as="span">
      {role}
    </Tag>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <Tag size="s" tone={statusTone[status]} as="span">
      {status}
    </Tag>
  );
}
```

```tsx components/InviteDialog.tsx
"use client";

import { useState } from "react";
import { Button, Column, Dialog, Input, Row, Select, Textarea } from "@once-ui-system/core";
import { ROLES, type Role } from "@/lib/data";

type Errors = { email?: string; role?: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function InviteDialog({
  open,
  onClose,
  onInvite,
}: {
  open: boolean;
  onClose: () => void;
  onInvite: (invite: { email: string; role: Role; message: string }) => void;
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

  const handleClose = () => {
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
      onClose={handleClose}
      title="Invite a team member"
      description="They’ll get an email with a link to join your Lumen workspace."
    >
      <Column as="form" gap="16" fillWidth onSubmit={handleSubmit} noValidate>
        <Input
          id="invite-email"
          label="Email address"
          type="email"
          value={email}
          onValueChange={(value) => {
            setEmail(value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          error={Boolean(errors.email)}
          errorMessage={errors.email}
          autoComplete="off"
          required
        />
        <Select
          id="invite-role"
          label="Role"
          value={role}
          onValueChange={(value) => {
            setRole(Array.isArray(value) ? (value[0] ?? "") : value);
            if (errors.role) setErrors((prev) => ({ ...prev, role: undefined }));
          }}
          error={Boolean(errors.role)}
          errorMessage={errors.role}
          options={ROLES.map((item) => ({ value: item, label: item }))}
        />
        <Textarea
          id="invite-message"
          label="Message (optional)"
          lines={3}
          value={message}
          onValueChange={setMessage}
          description="Add a short note to include in the invite email."
        />
        <Row gap="12" horizontal="end" s={{ direction: "column-reverse" }} fillWidth>
          <Button type="button" variant="secondary" onClick={handleClose}>
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

```tsx components/TeamTable.tsx
"use client";

import { useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Column,
  Dialog,
  Dropdown,
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
import { RoleBadge, StatusBadge } from "@/components/Badges";
import { InviteDialog } from "@/components/InviteDialog";
import {
  PRODUCT,
  ROLES,
  getInitials,
  members as initialMembers,
  nameFromEmail,
  type Member,
  type Role,
} from "@/lib/data";

const ALL = "all";

export function TeamTable() {
  const { addToast } = useToast();
  const [people, setPeople] = useState<Member[]>(initialMembers);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>(ALL);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [roleTarget, setRoleTarget] = useState<Member | null>(null);
  const [removeTarget, setRemoveTarget] = useState<Member | null>(null);
  const [nextRole, setNextRole] = useState<Role>("Member");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return people.filter((person) => {
      if (roleFilter !== ALL && person.role !== roleFilter) return false;
      if (!q) return true;
      return (
        person.name.toLowerCase().includes(q) ||
        person.email.toLowerCase().includes(q) ||
        person.role.toLowerCase().includes(q) ||
        person.status.toLowerCase().includes(q)
      );
    });
  }, [people, query, roleFilter]);

  const filtering = query.trim() !== "" || roleFilter !== ALL;

  const clearFilters = () => {
    setQuery("");
    setRoleFilter(ALL);
  };

  const handleInvite = (invite: { email: string; role: Role; message: string }) => {
    const id = `m-${String(people.length + 1).padStart(2, "0")}`;
    setPeople((prev) => [
      ...prev,
      {
        id,
        name: nameFromEmail(invite.email),
        email: invite.email,
        role: invite.role,
        status: "Invited",
        joined: null,
      },
    ]);
    setInviteOpen(false);
    addToast({ tone: "success", message: `Invite sent to ${invite.email}.` });
  };

  const handleAction = (member: Member, action: string) => {
    if (action === "role") {
      setNextRole(member.role);
      setRoleTarget(member);
    } else if (action === "resend") {
      addToast({ tone: "success", message: `Invite re-sent to ${member.email}.` });
    } else if (action === "remove") {
      setRemoveTarget(member);
    }
  };

  const confirmRole = () => {
    if (!roleTarget) return;
    const target = roleTarget;
    setPeople((prev) => prev.map((p) => (p.id === target.id ? { ...p, role: nextRole } : p)));
    addToast({ tone: "success", message: `${target.name} is now ${nextRole}.` });
    setRoleTarget(null);
  };

  const confirmRemove = () => {
    if (!removeTarget) return;
    const target = removeTarget;
    setPeople((prev) => prev.filter((p) => p.id !== target.id));
    addToast({ tone: "info", message: `${target.name} was removed from the team.` });
    setRemoveTarget(null);
  };

  return (
    <Column as="main" fillWidth horizontal="center" paddingY="48" paddingX="16">
      <Column maxWidth="l" fillWidth gap="24">
        <Row
          fillWidth
          horizontal="between"
          vertical="end"
          gap="16"
          s={{ direction: "column", horizontal: "start", vertical: "start" }}
        >
          <Column gap="8">
            <Text textVariant="label-default-s" onBackground="brand-medium">
              {PRODUCT.name} · {PRODUCT.workspace}
            </Text>
            <Heading as="h1" textVariant="display-strong-xs">
              Team
            </Heading>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              Manage who has access to your workspace and what they can do.
            </Text>
          </Column>
          <Button prefixIcon="plus" onClick={() => setInviteOpen(true)}>
            Invite member
          </Button>
        </Row>

        <Row fillWidth gap="12" s={{ direction: "column" }}>
          <Row flex={1} fillWidth>
            <Input
              id="member-search"
              label="Search members"
              placeholder="Search by name, email or status"
              type="search"
              value={query}
              onValueChange={setQuery}
              size="s"
              prefix={<IconButton icon="search" variant="ghost" size="s" tooltip="Search" aria-hidden tabIndex={-1} />}
            />
          </Row>
          <Row minWidth={14} s={{ fillWidth: true }}>
            <Select
              id="role-filter"
              label="Role"
              value={roleFilter}
              size="s"
              onValueChange={(value) =>
                setRoleFilter(Array.isArray(value) ? (value[0] ?? ALL) : value)
              }
              options={[
                { value: ALL, label: "All roles" },
                ...ROLES.map((role) => ({ value: role, label: role })),
              ]}
            />
          </Row>
        </Row>

        <Text
          textVariant="body-default-s"
          onBackground="neutral-weak"
          role="status"
          aria-live="polite"
        >
          {visible.length} {visible.length === 1 ? "member" : "members"}
          {filtering ? " match your filters" : ""}
        </Text>

        <Column background="surface" border radius="l" overflow="hidden" fillWidth>
          <div style={{ overflowX: "auto" }}>
            <table
              aria-label="Team members"
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "42rem",
                textAlign: "left",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid var(--neutral-alpha-medium)" }}>
                  {["Member", "Role", "Status"].map((heading) => (
                    <th key={heading} scope="col" style={{ padding: "0.75rem 1rem" }}>
                      <Text textVariant="label-default-s" onBackground="neutral-weak">
                        {heading}
                      </Text>
                    </th>
                  ))}
                  <th scope="col" style={{ padding: "0.75rem 1rem", width: "3.5rem" }}>
                    <Text as="span" textVariant="label-default-s">
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
                    </Text>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((member) => (
                  <tr
                    key={member.id}
                    style={{ borderBottom: "1px solid var(--neutral-alpha-weak)" }}
                  >
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <Row gap="12" vertical="center">
                        <Avatar size="m" value={getInitials(member.name)} />
                        <Column gap="2" minWidth={0}>
                          <SmartLink href={`/members/${member.id}`}>
                            <Text textVariant="label-strong-m">{member.name}</Text>
                          </SmartLink>
                          <Text textVariant="body-default-xs" onBackground="neutral-weak">
                            {member.email}
                          </Text>
                        </Column>
                      </Row>
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <RoleBadge role={member.role} />
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <StatusBadge status={member.status} />
                    </td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                      <Dropdown
                        placement="bottom-end"
                        minWidth={12}
                        onSelect={(value) => handleAction(member, value)}
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
                        <Option value="role" label="Change role" />
                        {member.status === "Invited" && (
                          <Option value="resend" label="Resend invite" />
                        )}
                        <Option value="remove" label="Remove" danger />
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {visible.length === 0 && (
            <Column center gap="12" padding="40">
              <Text textVariant="heading-strong-s">No members found</Text>
              <Text textVariant="body-default-s" onBackground="neutral-weak" align="center">
                Nobody matches your search or role filter.
              </Text>
              <Button size="s" variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            </Column>
          )}
        </Column>
      </Column>

      <InviteDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvite={handleInvite}
      />

      <Dialog
        open={roleTarget !== null}
        onClose={() => setRoleTarget(null)}
        title="Change role"
        description={roleTarget ? `Choose a new role for ${roleTarget.name}.` : undefined}
        footer={
          <Row gap="12" horizontal="end" fillWidth>
            <Button variant="secondary" onClick={() => setRoleTarget(null)}>
              Cancel
            </Button>
            <Button onClick={confirmRole}>Save role</Button>
          </Row>
        }
      >
        <Select
          id="change-role"
          label="Role"
          value={nextRole}
          onValueChange={(value) => {
            const picked = Array.isArray(value) ? value[0] : value;
            if (picked) setNextRole(picked as Role);
          }}
          options={ROLES.map((role) => ({ value: role, label: role }))}
        />
      </Dialog>

      <Dialog
        open={removeTarget !== null}
        onClose={() => setRemoveTarget(null)}
        title="Remove member"
        description={
          removeTarget
            ? `${removeTarget.name} will lose access to ${PRODUCT.workspace} immediately.`
            : undefined
        }
        footer={
          <Row gap="12" horizontal="end" fillWidth>
            <Button variant="secondary" onClick={() => setRemoveTarget(null)}>
              Cancel
            </Button>
            <Button tone="danger" onClick={confirmRemove}>
              Remove
            </Button>
          </Row>
        }
      >
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          This can’t be undone, but you can invite them again at any time.
        </Text>
      </Dialog>
    </Column>
  );
}
```

```tsx app/page.tsx
import { TeamTable } from "@/components/TeamTable";

export default function Page() {
  return <TeamTable />;
}
```

```tsx app/members/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Avatar, Button, Column, Grid, Heading, Row, Text } from "@once-ui-system/core";
import { RoleBadge, StatusBadge } from "@/components/Badges";
import { formatDate, getActivity, getInitials, getMember, members } from "@/lib/data";

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return members.map((member) => ({ id: member.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const member = getMember(id);
  return { title: member ? `${member.name} · Team · Lumen` : "Member not found · Lumen" };
}

export default async function MemberPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const member = getMember(id);
  if (!member) notFound();

  const activity = getActivity(member.id);

  return (
    <Column as="main" fillWidth horizontal="center" paddingY="48" paddingX="16">
      <Column maxWidth="m" fillWidth gap="32">
        <Row>
          <Button href="/" variant="tertiary" size="s" prefixIcon="chevronLeft">
            Back to team
          </Button>
        </Row>

        <Row
          fillWidth
          gap="24"
          vertical="center"
          s={{ direction: "column", horizontal: "start", vertical: "start" }}
        >
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

        <Column background="surface" border radius="l" padding="24" gap="16" as="section" aria-labelledby="profile-heading">
          <Heading as="h2" id="profile-heading" textVariant="heading-strong-m">
            Profile
          </Heading>
          <Grid as="dl" columns="2" s={{ columns: 1 }} gap="24" margin="0">
            <Column gap="4">
              <Text as="dt" textVariant="label-default-s" onBackground="neutral-weak">
                Role
              </Text>
              <Text as="dd" textVariant="body-default-m" style={{ margin: 0 }}>
                {member.role}
              </Text>
            </Column>
            <Column gap="4">
              <Text as="dt" textVariant="label-default-s" onBackground="neutral-weak">
                Status
              </Text>
              <Text as="dd" textVariant="body-default-m" style={{ margin: 0 }}>
                {member.status}
              </Text>
            </Column>
            <Column gap="4">
              <Text as="dt" textVariant="label-default-s" onBackground="neutral-weak">
                Joined
              </Text>
              <Text as="dd" textVariant="body-default-m" style={{ margin: 0 }}>
                {member.joined ? formatDate(member.joined) : "Invitation pending"}
              </Text>
            </Column>
            <Column gap="4">
              <Text as="dt" textVariant="label-default-s" onBackground="neutral-weak">
                Email
              </Text>
              <Text as="dd" textVariant="body-default-m" style={{ margin: 0 }}>
                {member.email}
              </Text>
            </Column>
          </Grid>
        </Column>

        <Column background="surface" border radius="l" padding="24" gap="16" as="section" aria-labelledby="activity-heading">
          <Heading as="h2" id="activity-heading" textVariant="heading-strong-m">
            Recent activity
          </Heading>
          {activity.length === 0 ? (
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              No activity yet. Activity will appear here once {member.name.split(" ")[0]} joins the
              workspace.
            </Text>
          ) : (
            <Column as="ul" gap="16" margin="0" padding="0">
              {activity.map((item) => (
                <Row
                  as="li"
                  key={item.id}
                  gap="16"
                  horizontal="between"
                  vertical="start"
                  borderBottom
                  paddingBottom="16"
                  s={{ direction: "column", gap: "4" }}
                >
                  <Column gap="4">
                    <Text textVariant="label-strong-m">{item.summary}</Text>
                    <Text textVariant="body-default-s" onBackground="neutral-weak">
                      {item.detail}
                    </Text>
                  </Column>
                  <Text textVariant="body-default-xs" onBackground="neutral-weak">
                    {item.when}
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