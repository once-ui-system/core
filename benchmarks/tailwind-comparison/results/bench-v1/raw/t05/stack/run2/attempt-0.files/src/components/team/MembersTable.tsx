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
