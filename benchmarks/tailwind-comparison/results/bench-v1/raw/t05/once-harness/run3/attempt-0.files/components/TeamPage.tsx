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
