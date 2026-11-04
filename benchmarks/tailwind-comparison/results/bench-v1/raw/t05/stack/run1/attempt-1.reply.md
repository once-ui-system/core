`src/lib/data/` is an existing directory with no `index.ts`, so `@/lib/data` can't resolve to it. I won't touch it. Instead I'll move my data to a unique path, `src/lib/team.ts`, and update all imports. The `MemberBadges` import errors were a knock-on effect of the same path problem, so keeping every file in a distinct, non-conflicting location fixes them.

```ts src/lib/team.ts
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
  when: string;
};

export const product =
  "Lumen, a product-analytics and issue-tracking app for small software teams";

export const roles: Role[] = ["Owner", "Admin", "Member", "Viewer"];

/** Roles that can be assigned through an invitation (there is only one owner). */
export const invitableRoles: Role[] = ["Admin", "Member", "Viewer"];

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

const activity: Record<string, ActivityItem[]> = {
  "m-01": [
    { id: "a1", text: "Updated billing details for the workspace", when: "2 hours ago" },
    { id: "a2", text: "Changed Daniel Reyes's role to Admin", when: "Yesterday" },
    { id: "a3", text: "Created the “Onboarding funnel” dashboard", when: "3 days ago" },
  ],
  "m-02": [
    { id: "a1", text: "Closed issue LUM-212 “Checkout events missing user id”", when: "35 minutes ago" },
    { id: "a2", text: "Invited Hana Sato as a Member", when: "Yesterday" },
    { id: "a3", text: "Shared the “Weekly retention” report with the team", when: "3 days ago" },
    { id: "a4", text: "Connected the GitHub integration", when: "Last week" },
  ],
  "m-03": [
    { id: "a1", text: "Commented on LUM-231 “Funnel drop-off at step 3”", when: "1 hour ago" },
    { id: "a2", text: "Opened issue LUM-236 “Export CSV truncates long names”", when: "Yesterday" },
    { id: "a3", text: "Saved the “Trial conversions” segment", when: "4 days ago" },
  ],
  "m-04": [
    { id: "a1", text: "Moved LUM-228 to In review", when: "Yesterday" },
    { id: "a2", text: "Added a new event property: plan_tier", when: "2 days ago" },
  ],
  "m-05": [],
  "m-06": [
    { id: "a1", text: "Viewed the “Weekly retention” report", when: "Today" },
    { id: "a2", text: "Viewed the “Onboarding funnel” dashboard", when: "2 days ago" },
  ],
  "m-07": [
    { id: "a1", text: "Account suspended by Maya Okafor", when: "2 weeks ago" },
    { id: "a2", text: "Resolved issue LUM-190 “Session replay stalls on Safari”", when: "3 weeks ago" },
  ],
  "m-08": [],
};

export function getMember(id: string): Member | undefined {
  return members.find((m) => m.id === id);
}

export function getActivity(id: string): ActivityItem[] {
  return activity[id] ?? [];
}

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Formats an ISO date (YYYY-MM-DD) in a locale-independent way, to avoid hydration mismatches. */
export function formatDate(iso: string | null): string {
  if (!iso) return "Not joined yet";
  const [y, m, d] = iso.split("-").map(Number);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[(m ?? 1) - 1]} ${d}, ${y}`;
}

export const statusScheme: Record<Status, "success" | "warning" | "danger"> = {
  Active: "success",
  Invited: "warning",
  Suspended: "danger",
};

export const roleScheme: Record<Role, "brand" | "accent" | "neutral" | "info"> = {
  Owner: "brand",
  Admin: "accent",
  Member: "neutral",
  Viewer: "info",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}
```

```tsx src/components/MemberBadges.tsx
import { Badge } from "@once-ui-system/core";
import { type Role, type Status, roleScheme, statusScheme } from "@/lib/team";

/**
 * Badge has no colour scheme prop, so the scheme is applied through
 * background / on-background tokens on the badge itself.
 */
export function RoleBadge({ role }: { role: Role }) {
  const scheme = roleScheme[role];
  return (
    <Badge
      effect={false}
      background={`${scheme}-alpha-weak`}
      onBackground={`${scheme}-strong`}
      border={`${scheme}-alpha-medium`}
      paddingX="8"
      paddingY="4"
      textVariant="label-default-xs"
    >
      {role}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  const scheme = statusScheme[status];
  return (
    <Badge
      effect={false}
      icon={status === "Active" ? "check" : status === "Invited" ? "mail" : "lock"}
      background={`${scheme}-alpha-weak`}
      onBackground={`${scheme}-strong`}
      border={`${scheme}-alpha-medium`}
      paddingX="8"
      paddingY="4"
      textVariant="label-default-xs"
    >
      {status}
    </Badge>
  );
}
```

```tsx src/components/TeamClient.tsx
"use client";

import {
  Avatar,
  Button,
  Column,
  Dialog,
  DropdownWrapper,
  Heading,
  IconButton,
  Input,
  Option,
  Row,
  Select,
  Text,
  Textarea,
  VisuallyHidden,
  useToast,
} from "@once-ui-system/core";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  type Member,
  type Role,
  getInitials,
  invitableRoles,
  isValidEmail,
  members as initialMembers,
  roles,
} from "@/lib/team";
import { RoleBadge, StatusBadge } from "./MemberBadges";

type InviteErrors = { email?: string; role?: string };

const roleFilterOptions = [
  { value: "all", label: "All roles" },
  ...roles.map((r) => ({ value: r, label: r })),
];

const inviteRoleOptions = invitableRoles.map((r) => ({ value: r, label: r }));
const allRoleOptions = roles.map((r) => ({ value: r, label: r }));

const cellStyle: React.CSSProperties = {
  padding: "var(--static-space-12) var(--static-space-16)",
  verticalAlign: "middle",
};

const headCellStyle: React.CSSProperties = {
  ...cellStyle,
  textAlign: "left",
  borderBottom: "1px solid var(--neutral-alpha-medium)",
};

function single(value: string | string[], fallback: string): string {
  return Array.isArray(value) ? (value[0] ?? fallback) : value;
}

export function TeamClient() {
  const { addToast } = useToast();
  const [people, setPeople] = useState<Member[]>(initialMembers);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<InviteErrors>({});

  const [roleTarget, setRoleTarget] = useState<Member | null>(null);
  const [newRole, setNewRole] = useState("");
  const [removeTarget, setRemoveTarget] = useState<Member | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return people.filter((p) => {
      if (roleFilter !== "all" && p.role !== roleFilter) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
    });
  }, [people, query, roleFilter]);

  const filtersActive = query.trim() !== "" || roleFilter !== "all";

  function closeInvite() {
    setInviteOpen(false);
    setEmail("");
    setInviteRole("");
    setMessage("");
    setErrors({});
  }

  function submitInvite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: InviteErrors = {};
    const trimmed = email.trim();
    if (!trimmed) next.email = "Enter an email address.";
    else if (!isValidEmail(trimmed)) next.email = "Enter a valid email address, like name@company.com.";
    else if (people.some((p) => p.email.toLowerCase() === trimmed.toLowerCase())) {
      next.email = "This person is already on the team.";
    }
    if (!inviteRole) next.role = "Choose a role for the new member.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const local = trimmed.split("@")[0] ?? trimmed;
    const name = local
      .split(/[._-]+/)
      .filter(Boolean)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");

    const created: Member = {
      id: `m-${String(people.length + 1).padStart(2, "0")}`,
      name: name || trimmed,
      email: trimmed,
      role: inviteRole as Role,
      status: "Invited",
      joined: null,
    };
    setPeople((prev) => [...prev, created]);
    addToast({ variant: "success", message: `Invitation sent to ${trimmed}.` });
    closeInvite();
  }

  function confirmRole() {
    if (!roleTarget || !newRole) return;
    setPeople((prev) =>
      prev.map((p) => (p.id === roleTarget.id ? { ...p, role: newRole as Role } : p)),
    );
    addToast({ variant: "success", message: `${roleTarget.name} is now ${newRole}.` });
    setRoleTarget(null);
  }

  function confirmRemove() {
    if (!removeTarget) return;
    setPeople((prev) => prev.filter((p) => p.id !== removeTarget.id));
    addToast({ variant: "success", message: `${removeTarget.name} was removed from the team.` });
    setRemoveTarget(null);
  }

  function handleAction(member: Member, action: string) {
    if (action === "role") {
      setNewRole(member.role);
      setRoleTarget(member);
    } else if (action === "resend") {
      addToast({ variant: "success", message: `Invitation re-sent to ${member.email}.` });
    } else if (action === "remove") {
      setRemoveTarget(member);
    }
  }

  return (
    <Column
      as="main"
      id="main"
      fillWidth
      horizontal="center"
      paddingY="48"
      paddingX="24"
      s={{ paddingX: "16", paddingY: "24" }}
    >
      <Column maxWidth="l" gap="24">
        <Row
          fillWidth
          horizontal="between"
          vertical="end"
          gap="16"
          s={{ direction: "column", horizontal: "start", vertical: "start" }}
        >
          <Column gap="8">
            <Text variant="label-default-s" onBackground="brand-medium">
              Lumen · Acme Labs
            </Text>
            <Heading as="h1" variant="display-strong-xs">
              Team
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Manage who can view dashboards, triage issues and change settings in this workspace.
            </Text>
          </Column>
          <Button prefixIcon="plus" onClick={() => setInviteOpen(true)}>
            Invite member
          </Button>
        </Row>

        <Row fillWidth gap="12" s={{ direction: "column" }}>
          <Column flex={2} fillWidth>
            <Input
              id="member-search"
              label="Search members"
              placeholder="Search by name or email"
              type="search"
              size="s"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </Column>
          <Column flex={1} fillWidth>
            <Select
              id="role-filter"
              label="Filter by role"
              size="s"
              options={roleFilterOptions}
              value={roleFilter}
              onSelect={(value) => setRoleFilter(single(value, "all"))}
            />
          </Column>
        </Row>

        <Text variant="body-default-xs" onBackground="neutral-weak" role="status" aria-live="polite">
          {visible.length} of {people.length} {people.length === 1 ? "member" : "members"} shown
        </Text>

        <Column background="surface" border radius="l" overflow="hidden">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "40rem" }}>
              <caption>
                <VisuallyHidden>Team members with their role and status</VisuallyHidden>
              </caption>
              <thead>
                <tr>
                  <th scope="col" style={headCellStyle}>
                    <Text variant="label-default-xs" onBackground="neutral-weak">Member</Text>
                  </th>
                  <th scope="col" style={headCellStyle}>
                    <Text variant="label-default-xs" onBackground="neutral-weak">Role</Text>
                  </th>
                  <th scope="col" style={headCellStyle}>
                    <Text variant="label-default-xs" onBackground="neutral-weak">Status</Text>
                  </th>
                  <th scope="col" style={{ ...headCellStyle, textAlign: "right" }}>
                    <VisuallyHidden>Actions</VisuallyHidden>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((member) => (
                  <tr key={member.id} style={{ borderBottom: "1px solid var(--neutral-alpha-weak)" }}>
                    <td style={cellStyle}>
                      <Row gap="12" vertical="center">
                        <Avatar size="m" value={getInitials(member.name)} />
                        <Column gap="4">
                          <Link
                            href={`/members/${member.id}`}
                            style={{ color: "inherit", textDecoration: "none" }}
                          >
                            <Text variant="label-strong-s">{member.name}</Text>
                          </Link>
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
                      <Row horizontal="end">
                        <DropdownWrapper
                          placement="bottom-end"
                          onSelect={(value) => handleAction(member, value)}
                          trigger={
                            <IconButton
                              icon="moreHorizontal"
                              variant="tertiary"
                              size="s"
                              ariaLabel={`Actions for ${member.name}`}
                            />
                          }
                          dropdown={
                            <Column padding="4" gap="2" minWidth={12}>
                              <Option value="role" label="Change role" />
                              {member.status === "Invited" && (
                                <Option value="resend" label="Resend invite" />
                              )}
                              <Option
                                value="remove"
                                label="Remove"
                                danger
                                disabled={member.role === "Owner"}
                              />
                            </Column>
                          }
                        />
                      </Row>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {visible.length === 0 && (
            <Column center gap="12" padding="32">
              <Text variant="body-default-s" onBackground="neutral-weak">
                No members match your search.
              </Text>
              {filtersActive && (
                <Button
                  size="s"
                  variant="secondary"
                  onClick={() => {
                    setQuery("");
                    setRoleFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              )}
            </Column>
          )}
        </Column>
      </Column>

      <Dialog
        open={inviteOpen}
        onClose={closeInvite}
        title="Invite a member"
        description="They'll get an email with a link to join your Lumen workspace."
        footer={
          <Row gap="8" horizontal="end" fillWidth>
            <Button variant="tertiary" onClick={closeInvite}>
              Cancel
            </Button>
            <Button type="submit" form="invite-form" prefixIcon="send">
              Send invite
            </Button>
          </Row>
        }
      >
        <form id="invite-form" onSubmit={submitInvite} noValidate>
          <Column gap="16" paddingTop="8">
            <Input
              id="invite-email"
              label="Email address (required)"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={Boolean(errors.email)}
              errorMessage={errors.email}
              autoComplete="off"
            />
            <Select
              id="invite-role"
              label="Role (required)"
              options={inviteRoleOptions}
              value={inviteRole}
              onSelect={(value) => {
                setInviteRole(single(value, ""));
                setErrors((prev) => ({ ...prev, role: undefined }));
              }}
              error={Boolean(errors.role)}
              errorMessage={errors.role}
            />
            <Textarea
              id="invite-message"
              label="Message (optional)"
              lines={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              description="Add a short note, like which project they'll work on."
            />
          </Column>
        </form>
      </Dialog>

      <Dialog
        open={roleTarget !== null}
        onClose={() => setRoleTarget(null)}
        title="Change role"
        description={roleTarget ? `Choose a new role for ${roleTarget.name}.` : undefined}
        footer={
          <Row gap="8" horizontal="end" fillWidth>
            <Button variant="tertiary" onClick={() => setRoleTarget(null)}>
              Cancel
            </Button>
            <Button onClick={confirmRole}>Save role</Button>
          </Row>
        }
      >
        <Select
          id="change-role"
          label="Role"
          options={allRoleOptions}
          value={newRole}
          onSelect={(value) => setNewRole(single(value, ""))}
        />
      </Dialog>

      <Dialog
        open={removeTarget !== null}
        onClose={() => setRemoveTarget(null)}
        title="Remove member"
        description={
          removeTarget
            ? `${removeTarget.name} will lose access to this workspace immediately.`
            : undefined
        }
        footer={
          <Row gap="8" horizontal="end" fillWidth>
            <Button variant="tertiary" onClick={() => setRemoveTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmRemove}>
              Remove
            </Button>
          </Row>
        }
      >
        <Text variant="body-default-s" onBackground="neutral-weak">
          This can't be undone, but you can invite them again at any time.
        </Text>
      </Dialog>
    </Column>
  );
}
```

```tsx src/app/page.tsx
import type { Metadata } from "next";
import { TeamClient } from "@/components/TeamClient";

export const metadata: Metadata = {
  title: "Team · Lumen",
  description: "Manage members, roles and invitations for your Lumen workspace.",
};

export default function Page() {
  return <TeamClient />;
}
```

```tsx src/app/members/[id]/page.tsx
import {
  Avatar,
  Button,
  Column,
  Grid,
  Heading,
  Row,
  Text,
} from "@once-ui-system/core";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RoleBadge, StatusBadge } from "@/components/MemberBadges";
import {
  formatDate,
  getActivity,
  getInitials,
  getMember,
  members,
} from "@/lib/team";

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return members.map((m) => ({ id: m.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const member = getMember(id);
  return {
    title: member ? `${member.name} · Team · Lumen` : "Member not found · Lumen",
    description: member
      ? `${member.name}'s profile, role and recent activity in Lumen.`
      : undefined,
  };
}

export default async function MemberPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const member = getMember(id);
  if (!member) notFound();

  const activity = getActivity(member.id);

  return (
    <Column
      as="main"
      id="main"
      fillWidth
      horizontal="center"
      paddingY="48"
      paddingX="24"
      s={{ paddingX: "16", paddingY: "24" }}
    >
      <Column maxWidth="m" gap="24">
        <Row>
          <Button href="/" variant="tertiary" size="s" prefixIcon="arrowLeft">
            Back to team
          </Button>
        </Row>

        <Row
          gap="20"
          vertical="center"
          s={{ direction: "column", horizontal: "start", vertical: "start" }}
        >
          <Avatar size="xl" value={getInitials(member.name)} />
          <Column gap="8">
            <Heading as="h1" variant="display-strong-xs">
              {member.name}
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-weak">
              {member.email}
            </Text>
            <Row gap="8" wrap>
              <RoleBadge role={member.role} />
              <StatusBadge status={member.status} />
            </Row>
          </Column>
        </Row>

        <Column background="surface" border radius="l" padding="24" gap="16">
          <Heading as="h2" variant="heading-strong-m">
            Profile
          </Heading>
          <Grid columns="3" s={{ columns: "1" }} gap="16" as="dl" margin="0">
            <Column gap="4">
              <Text as="dt" variant="label-default-xs" onBackground="neutral-weak">
                Role
              </Text>
              <Text as="dd" variant="body-default-s" style={{ margin: 0 }}>
                {member.role}
              </Text>
            </Column>
            <Column gap="4">
              <Text as="dt" variant="label-default-xs" onBackground="neutral-weak">
                Status
              </Text>
              <Text as="dd" variant="body-default-s" style={{ margin: 0 }}>
                {member.status}
              </Text>
            </Column>
            <Column gap="4">
              <Text as="dt" variant="label-default-xs" onBackground="neutral-weak">
                Joined
              </Text>
              <Text as="dd" variant="body-default-s" style={{ margin: 0 }}>
                {member.joined ? formatDate(member.joined) : "Hasn't accepted the invite yet"}
              </Text>
            </Column>
          </Grid>
        </Column>

        <Column background="surface" border radius="l" padding="24" gap="16">
          <Heading as="h2" variant="heading-strong-m">
            Recent activity
          </Heading>
          {activity.length === 0 ? (
            <Text variant="body-default-s" onBackground="neutral-weak">
              No activity yet. Activity shows up here once {member.name.split(" ")[0]} starts
              using the workspace.
            </Text>
          ) : (
            <Column as="ul" gap="12" margin="0" padding="0" style={{ listStyle: "none" }}>
              {activity.map((item) => (
                <Row
                  as="li"
                  key={item.id}
                  horizontal="between"
                  vertical="start"
                  gap="16"
                  paddingBottom="12"
                  borderBottom="neutral-alpha-weak"
                  s={{ direction: "column", gap: "4" }}
                >
                  <Text variant="body-default-s">{item.text}</Text>
                  <Text variant="body-default-xs" onBackground="neutral-weak">
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