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
