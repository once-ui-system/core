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
