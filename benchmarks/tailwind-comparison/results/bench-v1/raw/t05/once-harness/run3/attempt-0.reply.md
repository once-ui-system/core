The `@/*` alias maps to the project root, so those imports work. Here is every file.

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
  date: string;
};

export const PRODUCT = "Lumen";
export const PRODUCT_DESCRIPTION =
  "Lumen is a product-analytics and issue-tracking app for small software teams.";

export const ROLES: Role[] = ["Owner", "Admin", "Member", "Viewer"];
export const ASSIGNABLE_ROLES: Role[] = ["Admin", "Member", "Viewer"];

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
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

export const activity: Record<string, Activity[]> = {
  "m-01": [
    {
      id: "a-01-1",
      summary: "Updated the workspace billing plan",
      detail: "Switched Acme Labs to the Team plan, billed annually.",
      date: "2026-03-12",
    },
    {
      id: "a-01-2",
      summary: "Invited Ines Duarte as Viewer",
      detail: "Invitation sent to ines@acmelabs.io.",
      date: "2026-03-09",
    },
    {
      id: "a-01-3",
      summary: "Created the “Q2 retention” dashboard",
      detail: "Added 6 charts covering weekly active teams and churn.",
      date: "2026-03-02",
    },
  ],
  "m-02": [
    {
      id: "a-02-1",
      summary: "Closed 4 issues in Checkout flow",
      detail: "Resolved LUM-482, LUM-487, LUM-491 and LUM-495 after the payment retry fix.",
      date: "2026-03-14",
    },
    {
      id: "a-02-2",
      summary: "Changed Leo Brandt's access to Suspended",
      detail: "Access paused pending a contractor agreement renewal.",
      date: "2026-03-11",
    },
    {
      id: "a-02-3",
      summary: "Connected the GitHub integration",
      detail: "Linked the acme-labs/web repository to the issue tracker.",
      date: "2026-03-05",
    },
    {
      id: "a-02-4",
      summary: "Saved a funnel report: Signup to first event",
      detail: "Conversion is 61% over the last 30 days.",
      date: "2026-02-27",
    },
  ],
  "m-03": [
    {
      id: "a-03-1",
      summary: "Commented on LUM-503",
      detail: "Suggested grouping crash events by app version.",
      date: "2026-03-13",
    },
    {
      id: "a-03-2",
      summary: "Opened 2 issues in Onboarding",
      detail: "LUM-510 and LUM-511 cover the empty-state copy.",
      date: "2026-03-08",
    },
  ],
  "m-04": [
    {
      id: "a-04-1",
      summary: "Shipped the session replay filter",
      detail: "Merged the filter by country and browser into the replay list.",
      date: "2026-03-10",
    },
    {
      id: "a-04-2",
      summary: "Assigned LUM-498 to Priya Natarajan",
      detail: "Bug: chart tooltips clip on narrow screens.",
      date: "2026-03-04",
    },
  ],
  "m-05": [],
  "m-06": [
    {
      id: "a-06-1",
      summary: "Viewed the “Weekly product health” dashboard",
      detail: "Opened from a shared link sent by Maya Okafor.",
      date: "2026-03-12",
    },
  ],
  "m-07": [
    {
      id: "a-07-1",
      summary: "Last active: updated LUM-455",
      detail: "Moved the issue from In progress to In review.",
      date: "2026-02-18",
    },
  ],
  "m-08": [],
};

export function getMember(id: string): Member | undefined {
  return members.find((member) => member.id === id);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatDate(iso: string | null): string {
  if (!iso) return "Not joined yet";
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export const STATUS_TONE: Record<Status, "success" | "warning" | "danger"> = {
  Active: "success",
  Invited: "warning",
  Suspended: "danger",
};

export const ROLE_TONE: Record<Role, "brand" | "accent" | "neutral" | "info"> = {
  Owner: "brand",
  Admin: "accent",
  Member: "neutral",
  Viewer: "info",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}
```

```tsx components/MemberBadges.tsx
import { Tag } from "@once-ui-system/core";
import { ROLE_TONE, STATUS_TONE, type Role, type Status } from "@/lib/data";

export function RoleBadge({ role }: { role: Role }) {
  return <Tag as="span" size="s" tone={ROLE_TONE[role]} label={role} />;
}

export function StatusBadge({ status }: { status: Status }) {
  return <Tag as="span" size="s" tone={STATUS_TONE[status]} label={status} />;
}
```

```tsx components/InviteDialog.tsx
"use client";

import { useId, useState } from "react";
import { Button, Column, Dialog, Input, Row, Select, Textarea } from "@once-ui-system/core";
import { ASSIGNABLE_ROLES, ROLE_DESCRIPTIONS, isValidEmail } from "@/lib/data";

type Errors = { email?: string; role?: string };

export type InvitePayload = { email: string; role: string; message: string };

export function InviteDialog({
  open,
  onClose,
  onInvite,
}: {
  open: boolean;
  onClose: () => void;
  onInvite: (payload: InvitePayload) => void;
}) {
  const uid = useId();
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

  const validate = (nextEmail: string, nextRole: string): Errors => {
    const next: Errors = {};
    if (!nextEmail.trim()) next.email = "Enter an email address.";
    else if (!isValidEmail(nextEmail)) next.email = "Enter a valid email, like name@company.com.";
    if (!nextRole) next.role = "Choose a role for this person.";
    return next;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = validate(email, role);
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onInvite({ email: email.trim(), role, message: message.trim() });
    reset();
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Invite a member"
      description="They'll get an email with a link to join your Lumen workspace."
    >
      <Column as="form" gap="16" fillWidth onSubmit={handleSubmit} noValidate>
        <Input
          id={`${uid}-email`}
          label="Email address"
          type="email"
          autoComplete="off"
          value={email}
          onValueChange={(value) => {
            setEmail(value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          error={Boolean(errors.email)}
          errorMessage={errors.email}
          aria-required="true"
        />
        <Select
          id={`${uid}-role`}
          label="Role"
          value={role}
          onValueChange={(value) => {
            setRole(Array.isArray(value) ? (value[0] ?? "") : value);
            if (errors.role) setErrors((prev) => ({ ...prev, role: undefined }));
          }}
          options={ASSIGNABLE_ROLES.map((item) => ({
            value: item,
            label: item,
            description: ROLE_DESCRIPTIONS[item],
          }))}
          error={Boolean(errors.role)}
          errorMessage={errors.role}
          aria-required="true"
        />
        <Textarea
          id={`${uid}-message`}
          label="Message (optional)"
          lines={3}
          value={message}
          onValueChange={setMessage}
          description="Add a short note, like which project they'll work on."
        />
        <Row gap="8" horizontal="end" fillWidth s={{ direction: "column-reverse" }}>
          <Button type="button" variant="tertiary" onClick={close}>
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

```tsx components/TeamPage.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Button,
  Column,
  Dropdown,
  Heading,
  IconButton,
  Input,
  Option,
  Row,
  Select,
  Text,
  useToast,
  Dialog,
} from "@once-ui-system/core";
import { InviteDialog, type InvitePayload } from "@/components/InviteDialog";
import { RoleBadge, StatusBadge } from "@/components/MemberBadges";
import { MemberAvatar } from "@/components/MemberAvatar";
import {
  ASSIGNABLE_ROLES,
  PRODUCT,
  ROLES,
  members as initialMembers,
  type Member,
  type Role,
} from "@/lib/data";

const ALL = "all";

export function TeamPage() {
  const { addToast } = useToast();
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>(ALL);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [roleTarget, setRoleTarget] = useState<Member | null>(null);
  const [nextRole, setNextRole] = useState<string>("");
  const [removeTarget, setRemoveTarget] = useState<Member | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((member) => {
      if (roleFilter !== ALL && member.role !== roleFilter) return false;
      if (!q) return true;
      return (
        member.name.toLowerCase().includes(q) ||
        member.email.toLowerCase().includes(q) ||
        member.role.toLowerCase().includes(q) ||
        member.status.toLowerCase().includes(q)
      );
    });
  }, [members, query, roleFilter]);

  const filtered = query.trim() !== "" || roleFilter !== ALL;

  const clearFilters = () => {
    setQuery("");
    setRoleFilter(ALL);
  };

  const handleInvite = (payload: InvitePayload) => {
    const id = `m-${String(members.length + 1).padStart(2, "0")}`;
    const name = payload.email
      .split("@")[0]
      .split(/[._-]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
    setMembers((prev) => [
      ...prev,
      {
        id,
        name: name || payload.email,
        email: payload.email,
        role: payload.role as Role,
        status: "Invited",
        joined: null,
      },
    ]);
    setInviteOpen(false);
    addToast({ tone: "success", message: `Invitation sent to ${payload.email}.` });
  };

  const openChangeRole = (member: Member) => {
    setRoleTarget(member);
    setNextRole(member.role);
  };

  const confirmChangeRole = () => {
    if (!roleTarget || !nextRole) return;
    setMembers((prev) =>
      prev.map((m) => (m.id === roleTarget.id ? { ...m, role: nextRole as Role } : m)),
    );
    addToast({ tone: "success", message: `${roleTarget.name} is now ${nextRole}.` });
    setRoleTarget(null);
  };

  const confirmRemove = () => {
    if (!removeTarget) return;
    setMembers((prev) => prev.filter((m) => m.id !== removeTarget.id));
    addToast({ tone: "neutral", message: `${removeTarget.name} was removed from the team.` });
    setRemoveTarget(null);
  };

  const resend = (member: Member) => {
    addToast({ tone: "success", message: `Invitation resent to ${member.email}.` });
  };

  const handleAction = (member: Member, value: string) => {
    if (value === "role") openChangeRole(member);
    else if (value === "resend") resend(member);
    else if (value === "remove") setRemoveTarget(member);
  };

  return (
    <Column as="main" id="main" fillWidth horizontal="center" paddingY="48" paddingX="24" s={{ paddingY: "24", paddingX: "16" }}>
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
              {PRODUCT} workspace
            </Text>
            <Heading as="h1" textVariant="display-strong-xs">
              Team
            </Heading>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              {members.length} people in Acme Labs. Manage who can see and edit your analytics and
              issues.
            </Text>
          </Column>
          <Button prefixIcon="plus" onClick={() => setInviteOpen(true)}>
            Invite member
          </Button>
        </Row>

        <Row
          as="section"
          aria-label="Filter members"
          fillWidth
          gap="12"
          vertical="end"
          s={{ direction: "column", vertical: "stretch" }}
        >
          <Column flex={1} fillWidth>
            <Input
              id="member-search"
              label="Search members"
              type="search"
              value={query}
              onValueChange={setQuery}
              prefix={<IconSearch />}
              size="s"
            />
          </Column>
          <Column width={240} s={{ width: "fit", fillWidth: true }}>
            <Select
              id="role-filter"
              label="Filter by role"
              size="s"
              value={roleFilter}
              onValueChange={(value) => setRoleFilter(Array.isArray(value) ? (value[0] ?? ALL) : value)}
              options={[
                { value: ALL, label: "All roles" },
                ...ROLES.map((role) => ({ value: role, label: role })),
              ]}
            />
          </Column>
        </Row>

        <Text as="p" textVariant="body-default-s" onBackground="neutral-weak" aria-live="polite">
          Showing {visible.length} of {members.length} members
        </Text>

        <Column background="surface" border radius="l" overflow="hidden" fillWidth>
          {visible.length === 0 ? (
            <Column center gap="12" padding="40">
              <Text textVariant="heading-strong-s">No members match</Text>
              <Text textVariant="body-default-s" onBackground="neutral-weak" align="center">
                {filtered
                  ? "Try a different name or email, or clear the filters."
                  : "Invite your first teammate to get started."}
              </Text>
              {filtered ? (
                <Button size="s" variant="secondary" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : null}
            </Column>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}
                aria-label="Team members"
              >
                <thead>
                  <tr>
                    <Th>Member</Th>
                    <Th hideOnPhone>Email</Th>
                    <Th>Role</Th>
                    <Th>Status</Th>
                    <Th align="right">
                      <VisuallyHiddenText>Actions</VisuallyHiddenText>
                    </Th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((member) => (
                    <tr key={member.id} style={{ borderTop: "1px solid var(--neutral-alpha-weak)" }}>
                      <Td>
                        <Row gap="12" vertical="center">
                          <MemberAvatar name={member.name} />
                          <Column gap="2" minWidth={0}>
                            <Link
                              href={`/members/${member.id}`}
                              style={{ color: "inherit", textDecoration: "none" }}
                            >
                              <Text textVariant="label-strong-m">{member.name}</Text>
                            </Link>
                            <span className="email-under-name">
                              <Text textVariant="body-default-xs" onBackground="neutral-weak">
                                {member.email}
                              </Text>
                            </span>
                          </Column>
                        </Row>
                      </Td>
                      <Td hideOnPhone>
                        <Text textVariant="body-default-s" onBackground="neutral-weak">
                          {member.email}
                        </Text>
                      </Td>
                      <Td>
                        <RoleBadge role={member.role} />
                      </Td>
                      <Td>
                        <StatusBadge status={member.status} />
                      </Td>
                      <Td align="right">
                        <Dropdown
                          placement="bottom-end"
                          closeAfterClick
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
                          <Column padding="4" gap="2" minWidth={176}>
                            <Option value="role" label="Change role" prefix={<IconEdit />} />
                            {member.status === "Invited" ? (
                              <Option value="resend" label="Resend invite" prefix={<IconMail />} />
                            ) : null}
                            <Option value="remove" label="Remove" danger prefix={<IconTrash />} />
                          </Column>
                        </Dropdown>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Column>
      </Column>

      <style>{`
        .email-under-name { display: none; }
        @media (max-width: 767px) {
          .email-under-name { display: block; }
          .hide-on-phone { display: none; }
        }
      `}</style>

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
          <Row gap="8" horizontal="end" fillWidth>
            <Button variant="tertiary" onClick={() => setRoleTarget(null)}>
              Cancel
            </Button>
            <Button onClick={confirmChangeRole} disabled={!nextRole || nextRole === roleTarget?.role}>
              Save role
            </Button>
          </Row>
        }
      >
        <Select
          id="change-role"
          label="Role"
          value={nextRole}
          onValueChange={(value) => setNextRole(Array.isArray(value) ? (value[0] ?? "") : value)}
          options={(roleTarget?.role === "Owner" ? ROLES : ASSIGNABLE_ROLES).map((role) => ({
            value: role,
            label: role,
          }))}
        />
      </Dialog>

      <Dialog
        open={removeTarget !== null}
        onClose={() => setRemoveTarget(null)}
        title="Remove member?"
        description={
          removeTarget
            ? `${removeTarget.name} will lose access to ${PRODUCT} right away. This can't be undone.`
            : undefined
        }
        footer={
          <Row gap="8" horizontal="end" fillWidth>
            <Button variant="tertiary" onClick={() => setRemoveTarget(null)}>
              Cancel
            </Button>
            <Button tone="danger" prefixIcon="trash" onClick={confirmRemove}>
              Remove
            </Button>
          </Row>
        }
      >
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          {removeTarget?.email}
        </Text>
      </Dialog>
    </Column>
  );
}

/* ---------- small local helpers ---------- */

function Th({
  children,
  align = "left",
  hideOnPhone = false,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  hideOnPhone?: boolean;
}) {
  return (
    <th
      scope="col"
      className={hideOnPhone ? "hide-on-phone" : undefined}
      style={{
        padding: "12px 16px",
        textAlign: align,
        font: "inherit",
        fontSize: "0.8125rem",
        fontWeight: 600,
        color: "var(--neutral-on-background-weak)",
        background: "var(--neutral-alpha-weak)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
  hideOnPhone = false,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  hideOnPhone?: boolean;
}) {
  return (
    <td
      className={hideOnPhone ? "hide-on-phone" : undefined}
      style={{ padding: "12px 16px", textAlign: align, verticalAlign: "middle" }}
    >
      {children}
    </td>
  );
}

function VisuallyHiddenText({ children }: { children: React.ReactNode }) {
  return (
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
      {children}
    </span>
  );
}

function IconSearch() {
  return <Icon name="search" size="s" />;
}
function IconEdit() {
  return <Icon name="edit" size="s" />;
}
function IconMail() {
  return <Icon name="mail" size="s" />;
}
function IconTrash() {
  return <Icon name="trash" size="s" />;
}
```

I used `Icon` in the helpers without importing it, so here is the corrected `TeamPage.tsx` import block and the final file in full.

```tsx components/TeamPage.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Button,
  Column,
  Dialog,
  Dropdown,
  Heading,
  Icon,
  IconButton,
  Input,
  Option,
  Row,
  Select,
  Text,
  VisuallyHidden,
  useToast,
} from "@once-ui-system/core";
import { InviteDialog, type InvitePayload } from "@/components/InviteDialog";
import { RoleBadge, StatusBadge } from "@/components/MemberBadges";
import { MemberAvatar } from "@/components/MemberAvatar";
import {
  ASSIGNABLE_ROLES,
  PRODUCT,
  ROLES,
  members as initialMembers,
  type Member,
  type Role,
} from "@/lib/data";

const ALL = "all";

export function TeamPage() {
  const { addToast } = useToast();
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>(ALL);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [roleTarget, setRoleTarget] = useState<Member | null>(null);
  const [nextRole, setNextRole] = useState<string>("");
  const [removeTarget, setRemoveTarget] = useState<Member | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((member) => {
      if (roleFilter !== ALL && member.role !== roleFilter) return false;
      if (!q) return true;
      return (
        member.name.toLowerCase().includes(q) ||
        member.email.toLowerCase().includes(q) ||
        member.role.toLowerCase().includes(q) ||
        member.status.toLowerCase().includes(q)
      );
    });
  }, [members, query, roleFilter]);

  const filtered = query.trim() !== "" || roleFilter !== ALL;

  const clearFilters = () => {
    setQuery("");
    setRoleFilter(ALL);
  };

  const handleInvite = (payload: InvitePayload) => {
    const id = `m-${String(members.length + 1).padStart(2, "0")}`;
    const name = payload.email
      .split("@")[0]
      .split(/[._-]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
    setMembers((prev) => [
      ...prev,
      {
        id,
        name: name || payload.email,
        email: payload.email,
        role: payload.role as Role,
        status: "Invited",
        joined: null,
      },
    ]);
    setInviteOpen(false);
    addToast({ tone: "success", message: `Invitation sent to ${payload.email}.` });
  };

  const openChangeRole = (member: Member) => {
    setRoleTarget(member);
    setNextRole(member.role);
  };

  const confirmChangeRole = () => {
    if (!roleTarget || !nextRole) return;
    setMembers((prev) =>
      prev.map((m) => (m.id === roleTarget.id ? { ...m, role: nextRole as Role } : m)),
    );
    addToast({ tone: "success", message: `${roleTarget.name} is now ${nextRole}.` });
    setRoleTarget(null);
  };

  const confirmRemove = () => {
    if (!removeTarget) return;
    setMembers((prev) => prev.filter((m) => m.id !== removeTarget.id));
    addToast({ tone: "neutral", message: `${removeTarget.name} was removed from the team.` });
    setRemoveTarget(null);
  };

  const handleAction = (member: Member, value: string) => {
    if (value === "role") openChangeRole(member);
    else if (value === "resend")
      addToast({ tone: "success", message: `Invitation resent to ${member.email}.` });
    else if (value === "remove") setRemoveTarget(member);
  };

  return (
    <Column
      as="main"
      id="main"
      fillWidth
      horizontal="center"
      paddingY="48"
      paddingX="24"
      s={{ paddingY: "24", paddingX: "16" }}
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
            <Text textVariant="label-default-s" onBackground="brand-medium">
              {PRODUCT} workspace
            </Text>
            <Heading as="h1" textVariant="display-strong-xs">
              Team
            </Heading>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              {members.length} people in Acme Labs. Manage who can see and edit your analytics and
              issues.
            </Text>
          </Column>
          <Button prefixIcon="plus" onClick={() => setInviteOpen(true)}>
            Invite member
          </Button>
        </Row>

        <Row
          as="section"
          aria-label="Filter members"
          fillWidth
          gap="12"
          vertical="end"
          s={{ direction: "column", vertical: "stretch" }}
        >
          <Column flex={1} fillWidth>
            <Input
              id="member-search"
              label="Search members"
              type="search"
              value={query}
              onValueChange={setQuery}
              prefix={<Icon name="search" size="s" />}
              size="s"
            />
          </Column>
          <Column width={240} s={{ fillWidth: true }}>
            <Select
              id="role-filter"
              label="Filter by role"
              size="s"
              value={roleFilter}
              onValueChange={(value) =>
                setRoleFilter(Array.isArray(value) ? (value[0] ?? ALL) : value)
              }
              options={[
                { value: ALL, label: "All roles" },
                ...ROLES.map((role) => ({ value: role, label: role })),
              ]}
            />
          </Column>
        </Row>

        <Text as="p" textVariant="body-default-s" onBackground="neutral-weak" aria-live="polite">
          Showing {visible.length} of {members.length} members
        </Text>

        <Column background="surface" border radius="l" overflow="hidden" fillWidth>
          {visible.length === 0 ? (
            <Column center gap="12" padding="40">
              <Text textVariant="heading-strong-s">No members match</Text>
              <Text textVariant="body-default-s" onBackground="neutral-weak" align="center">
                {filtered
                  ? "Try a different name or email, or clear the filters."
                  : "Invite your first teammate to get started."}
              </Text>
              {filtered ? (
                <Button size="s" variant="secondary" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : null}
            </Column>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}
                aria-label="Team members"
              >
                <thead>
                  <tr>
                    <Th>Member</Th>
                    <Th hideOnPhone>Email</Th>
                    <Th>Role</Th>
                    <Th>Status</Th>
                    <Th align="right">
                      <VisuallyHidden>Actions</VisuallyHidden>
                    </Th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((member) => (
                    <tr
                      key={member.id}
                      style={{ borderTop: "1px solid var(--neutral-alpha-weak)" }}
                    >
                      <Td>
                        <Row gap="12" vertical="center">
                          <MemberAvatar name={member.name} />
                          <Column gap="2">
                            <Link
                              href={`/members/${member.id}`}
                              style={{ color: "inherit", textDecoration: "none" }}
                            >
                              <Text textVariant="label-strong-m">{member.name}</Text>
                            </Link>
                            <span className="email-under-name">
                              <Text textVariant="body-default-xs" onBackground="neutral-weak">
                                {member.email}
                              </Text>
                            </span>
                          </Column>
                        </Row>
                      </Td>
                      <Td hideOnPhone>
                        <Text textVariant="body-default-s" onBackground="neutral-weak">
                          {member.email}
                        </Text>
                      </Td>
                      <Td>
                        <RoleBadge role={member.role} />
                      </Td>
                      <Td>
                        <StatusBadge status={member.status} />
                      </Td>
                      <Td align="right">
                        <Dropdown
                          placement="bottom-end"
                          closeAfterClick
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
                          <Column padding="4" gap="2" minWidth={176}>
                            <Option
                              value="role"
                              label="Change role"
                              prefix={<Icon name="edit" size="s" />}
                            />
                            {member.status === "Invited" ? (
                              <Option
                                value="resend"
                                label="Resend invite"
                                prefix={<Icon name="mail" size="s" />}
                              />
                            ) : null}
                            <Option
                              value="remove"
                              label="Remove"
                              danger
                              prefix={<Icon name="trash" size="s" />}
                            />
                          </Column>
                        </Dropdown>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Column>
      </Column>

      <style>{`
        .email-under-name { display: none; }
        @media (max-width: 767px) {
          .email-under-name { display: block; }
          .hide-on-phone { display: none; }
        }
      `}</style>

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
          <Row gap="8" horizontal="end" fillWidth>
            <Button variant="tertiary" onClick={() => setRoleTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={confirmChangeRole}
              disabled={!nextRole || nextRole === roleTarget?.role}
            >
              Save role
            </Button>
          </Row>
        }
      >
        <Select
          id="change-role"
          label="Role"
          value={nextRole}
          onValueChange={(value) => setNextRole(Array.isArray(value) ? (value[0] ?? "") : value)}
          options={(roleTarget?.role === "Owner" ? ROLES : ASSIGNABLE_ROLES).map((role) => ({
            value: role,
            label: role,
          }))}
        />
      </Dialog>

      <Dialog
        open={removeTarget !== null}
        onClose={() => setRemoveTarget(null)}
        title="Remove member?"
        description={
          removeTarget
            ? `${removeTarget.name} will lose access to ${PRODUCT} right away. This can't be undone.`
            : undefined
        }
        footer={
          <Row gap="8" horizontal="end" fillWidth>
            <Button variant="tertiary" onClick={() => setRemoveTarget(null)}>
              Cancel
            </Button>
            <Button tone="danger" prefixIcon="trash" onClick={confirmRemove}>
              Remove
            </Button>
          </Row>
        }
      >
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          {removeTarget?.email}
        </Text>
      </Dialog>
    </Column>
  );
}

function Th({
  children,
  align = "left",
  hideOnPhone = false,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  hideOnPhone?: boolean;
}) {
  return (
    <th
      scope="col"
      className={hideOnPhone ? "hide-on-phone" : undefined}
      style={{
        padding: "12px 16px",
        textAlign: align,
        fontSize: "0.8125rem",
        fontWeight: 600,
        color: "var(--neutral-on-background-weak)",
        background: "var(--neutral-alpha-weak)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
  hideOnPhone = false,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  hideOnPhone?: boolean;
}) {
  return (
    <td
      className={hideOnPhone ? "hide-on-phone" : undefined}
      style={{ padding: "12px 16px", textAlign: align, verticalAlign: "middle" }}
    >
      {children}
    </td>
  );
}
```

```tsx components/MemberAvatar.tsx
import { Avatar } from "@once-ui-system/core";
import { getInitials } from "@/lib/data";

export function MemberAvatar({
  name,
  size = "m",
}: {
  name: string;
  size?: "s" | "m" | "l" | "xl";
}) {
  return <Avatar size={size} value={getInitials(name)} />;
}
```

```tsx app/page.tsx
import { TeamPage } from "@/components/TeamPage";

export default function Page() {
  return <TeamPage />;
}
```

```tsx app/members/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Column, Heading, Row, Text } from "@once-ui-system/core";
import { Button } from "@once-ui-system/core/components/Button";
import { MemberAvatar } from "@/components/MemberAvatar";
import { RoleBadge, StatusBadge } from "@/components/MemberBadges";
import {
  ROLE_DESCRIPTIONS,
  activity,
  formatDate,
  getMember,
  members,
} from "@/lib/data";

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

  const recent = activity[member.id] ?? [];

  return (
    <Column
      as="main"
      id="main"
      fillWidth
      horizontal="center"
      paddingY="48"
      paddingX="24"
      s={{ paddingY: "24", paddingX: "16" }}
    >
      <Column maxWidth="m" gap="32">
        <Row>
          <Button href="/" variant="tertiary" size="s" prefixIcon="chevronLeft">
            Back to team
          </Button>
        </Row>

        <Row gap="24" vertical="center" s={{ direction: "column", vertical: "start" }}>
          <MemberAvatar name={member.name} size="xl" />
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

        <Column
          as="section"
          aria-labelledby="profile-heading"
          background="surface"
          border
          radius="l"
          padding="24"
          gap="16"
          s={{ padding: "16" }}
        >
          <Heading as="h2" id="profile-heading" textVariant="heading-strong-l">
            Profile
          </Heading>
          <dl
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))",
              gap: "1rem 1.5rem",
              margin: 0,
            }}
          >
            <DetailItem term="Role" value={member.role} />
            <DetailItem term="Status" value={member.status} />
            <DetailItem
              term="Joined"
              value={member.joined ? formatDate(member.joined) : "Invitation pending"}
            />
            <DetailItem term="Email" value={member.email} />
          </dl>
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            {member.role}: {ROLE_DESCRIPTIONS[member.role]}
          </Text>
        </Column>

        <Column
          as="section"
          aria-labelledby="activity-heading"
          background="surface"
          border
          radius="l"
          padding="24"
          gap="16"
          s={{ padding: "16" }}
        >
          <Heading as="h2" id="activity-heading" textVariant="heading-strong-l">
            Recent activity
          </Heading>
          {recent.length === 0 ? (
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              {member.status === "Invited"
                ? `${member.name} hasn't accepted the invitation yet, so there's no activity to show.`
                : "No recent activity."}
            </Text>
          ) : (
            <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "1rem" }}>
              {recent.map((item) => (
                <li
                  key={item.id}
                  style={{
                    display: "grid",
                    gap: "0.25rem",
                    paddingBottom: "1rem",
                    borderBottom: "1px solid var(--neutral-alpha-weak)",
                  }}
                >
                  <Text textVariant="label-strong-m">{item.summary}</Text>
                  <Text textVariant="body-default-s" onBackground="neutral-weak">
                    {item.detail}
                  </Text>
                  <Text as="time" textVariant="body-default-xs" onBackground="neutral-weak">
                    {formatDate(item.date)}
                  </Text>
                </li>
              ))}
            </ol>
          )}
        </Column>
      </Column>
    </Column>
  );
}

function DetailItem({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt style={{ fontSize: "0.8125rem", color: "var(--neutral-on-background-weak)" }}>{term}</dt>
      <dd style={{ margin: "0.25rem 0 0", fontWeight: 600 }}>{value}</dd>
    </div>
  );
}
```