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
