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
