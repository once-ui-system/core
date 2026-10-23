"use client";

import { useOrg } from "@/components/OrgProvider";
import { apiErrorMessage } from "@/lib/api-error-message";
import { type TableQuery, queryInMemory } from "@/lib/data/query";
import { type TableSource, useServerTable } from "@/lib/data/useServerTable";
import {
  DEMO_ORG_SLUG,
  MEMBERS_QUERY_SPEC,
  type OrgInvitation,
  type OrgMemberRow,
  type OrgRole,
} from "@/lib/orgs/types";
import { isSupabaseConfigured } from "@/lib/sb/config";
import {
  Avatar,
  Button,
  Column,
  DataTable,
  DropdownWrapper,
  Icon,
  Option,
  type DataTableColumn,
  Dialog,
  Feedback,
  IconButton,
  Input,
  Row,
  Tag,
  Text,
  useLayout,
  useToast,
} from "@once-ui-system/core";
import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * The organization's members, as a DataTable in server mode: search, the role
 * filter, sort, page and page size are all answered by
 * `GET /api/orgs/[org]/members`, and live in the URL. Demo mode answers the
 * same queries from sample rows in memory, so the table behaves identically
 * with no database.
 */

const ROLE_LABEL: Record<OrgRole, string> = { owner: "Owner", admin: "Admin", member: "Member" };

const ELLIPSIS = { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } as const;

const ROLE_FILTERS = [
  { value: "all", label: "All roles" },
  { value: "owner", label: "Owners" },
  { value: "admin", label: "Admins" },
  { value: "member", label: "Members" },
];

const DEMO_MEMBERS: OrgMemberRow[] = [
  ["lorant", "Lorant One", "owner"],
  ["mia", "Mia Chen", "admin"],
  ["adam", "Adam Wright", "admin"],
  ["sofia", "Sofia Rossi", "member"],
  ["noah", "Noah Patel", "member"],
  ["ava", "Ava Martin", "member"],
  ["liam", "Liam Kim", "member"],
  ["olivia", "Olivia Brown", "member"],
  ["ethan", "Ethan Singh", "member"],
  ["isabella", "Isabella Garcia", "member"],
  ["ben", "Benjamin Lee", "member"],
  ["amelia", "Amelia Nguyen", "member"],
  ["lucas", "Lucas Wilson", "member"],
  ["harper", "Harper Davis", "member"],
].map(([username, name, role], i) => ({
  user_id: `demo-${username}`,
  role: role as OrgRole,
  email: `${username}@example.com`,
  created_at: new Date(Date.UTC(2025, 0, 4 + i)).toISOString(),
  username,
  full_name: name,
  avatar_url: null,
  you: i === 0,
}));

const demoSource: TableSource<OrgMemberRow> = {
  // A short pause, so the loading state is visible in demo mode too.
  load: (query: TableQuery) =>
    new Promise((resolve) =>
      setTimeout(
        () => resolve(queryInMemory(DEMO_MEMBERS, query, ["email", "full_name", "username"])),
        200,
      ),
    ),
};

function displayName(member: OrgMemberRow): string {
  return member.full_name || member.username || member.email || "Member";
}

export default function TableClient() {
  const configured = isSupabaseConfigured();
  const { slug, selected } = useOrg();
  const org = slug ?? DEMO_ORG_SLUG;
  const { addToast } = useToast();
  // On a phone the table keeps the member, role and actions; Joined goes.
  const { maxWidth } = useLayout();
  const narrow = maxWidth("s");

  // In demo mode the viewer plays the owner, so every control is visible.
  const myRole: OrgRole = configured ? (selected?.role ?? "member") : "owner";
  const canManage = myRole === "owner" || myRole === "admin";

  const source = useMemo<TableSource<OrgMemberRow>>(
    () => (configured ? { url: `/api/orgs/${encodeURIComponent(org)}/members` } : demoSource),
    [configured, org],
  );
  const table = useServerTable(source, MEMBERS_QUERY_SPEC);

  const [invitations, setInvitations] = useState<OrgInvitation[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [removing, setRemoving] = useState<OrgMemberRow | null>(null);

  const loadInvitations = useCallback(async () => {
    if (!configured || !canManage) return;
    const res = await fetch(`/api/orgs/${encodeURIComponent(org)}/invitations`, {
      credentials: "include",
      cache: "no-store",
    });
    if (res.ok)
      setInvitations(((await res.json()) as { invitations: OrgInvitation[] }).invitations);
  }, [configured, canManage, org]);

  useEffect(() => {
    void loadInvitations();
  }, [loadInvitations]);

  const demoOnly = () =>
    addToast({
      variant: "info",
      message: "Connect Supabase to manage members. This is sample data.",
    });

  const call = async (input: string, init: RequestInit, success: string) => {
    const res = await fetch(input, { credentials: "include", ...init });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      addToast({ variant: "danger", message: apiErrorMessage(body, "Something went wrong") });
      return false;
    }
    addToast({ variant: "success", message: success });
    return true;
  };

  const changeRole = async (member: OrgMemberRow, role: OrgRole) => {
    if (!configured) return demoOnly();
    if (role === member.role) return;
    const ok = await call(
      `/api/orgs/${encodeURIComponent(org)}/members`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: member.user_id, role }),
      },
      `${displayName(member)} is now ${ROLE_LABEL[role].toLowerCase()}`,
    );
    if (ok) table.refresh();
  };

  const remove = async (member: OrgMemberRow) => {
    if (!configured) return demoOnly();
    const userId = member.you ? "me" : member.user_id;
    const ok = await call(
      `/api/orgs/${encodeURIComponent(org)}/members?userId=${encodeURIComponent(userId)}`,
      { method: "DELETE" },
      member.you ? "You left the organization" : `${displayName(member)} was removed`,
    );
    setRemoving(null);
    if (ok && member.you) window.location.assign("/app");
    else if (ok) table.refresh();
  };

  const revoke = async (invitation: OrgInvitation) => {
    const ok = await call(
      `/api/orgs/${encodeURIComponent(org)}/invitations?id=${encodeURIComponent(invitation.id)}`,
      { method: "DELETE" },
      `Invitation for ${invitation.email} revoked`,
    );
    if (ok) void loadInvitations();
  };

  // Roles an actor may hand out: owners anything, admins below owner.
  const assignable: OrgRole[] =
    myRole === "owner" ? ["owner", "admin", "member"] : ["admin", "member"];

  // Only an owner may act on an owner; nobody changes their own role here.
  const canEditRole = (member: OrgMemberRow) =>
    canManage && !member.you && (member.role !== "owner" || myRole === "owner");
  const canRemove = (member: OrgMemberRow) =>
    member.you || (canManage && (member.role !== "owner" || myRole === "owner"));

  const columns = ([
    {
      key: "email",
      header: "Member",
      sortable: true,
      cell: (member) => (
        <Row gap="12" vertical="center">
          <Avatar
            size="s"
            src={member.avatar_url ?? undefined}
            value={displayName(member).charAt(0).toUpperCase()}
          />
          <Column gap="2" style={narrow ? { maxWidth: "6rem" } : undefined}>
            <Row gap="8" vertical="center">
              <Text variant="label-default-s" style={narrow ? ELLIPSIS : undefined}>
                {displayName(member)}
              </Text>
              {member.you && <Tag size="s" scheme="brand" label="You" />}
            </Row>
            {(member.full_name || member.username) && member.email && (
              <Text
                variant="body-default-xs"
                onBackground="neutral-weak"
                style={narrow ? ELLIPSIS : undefined}
              >
                {member.email}
              </Text>
            )}
          </Column>
        </Row>
      ),
    },
    !narrow && {
      key: "created_at",
      header: "Joined",
      sortable: true,
      width: "9rem",
      cell: (member) => (
        <Text variant="label-default-s" onBackground="neutral-weak">
          {member.created_at.slice(0, 10)}
        </Text>
      ),
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      align: "right",
      width: narrow ? "7rem" : "9rem",
      cell: (member) => {
        const trigger = (disabled: boolean) => (
          <Button
            size="s"
            variant="secondary"
            suffixIcon="chevronDown"
            disabled={disabled}
            style={{ width: "6.5rem", justifyContent: "space-between" }}
            aria-label={`Role of ${displayName(member)}`}
          >
            {ROLE_LABEL[member.role]}
          </Button>
        );
        // A role nobody here may change shows the same control, disabled, so
        // the column reads as one list.
        if (!canEditRole(member)) return trigger(true);
        return (
          <DropdownWrapper
            placement="bottom-end"
            selectedOption={member.role}
            closeAfterClick
            onSelect={(value) => void changeRole(member, value as OrgRole)}
            trigger={trigger(false)}
            dropdown={
              <Column padding="4" gap="2" minWidth={8}>
                {assignable.map((role) => (
                  <Option
                    key={role}
                    value={role}
                    label={ROLE_LABEL[role]}
                    selected={role === member.role}
                  />
                ))}
              </Column>
            }
          />
        );
      },
    },
    {
      key: "actions",
      header: "",
      align: "right",
      width: narrow ? "3rem" : "4rem",
      cell: (member) => {
        const label = member.you ? "Leave organization" : "Remove from organization";
        const trigger = (disabled: boolean) => (
          <IconButton
            variant="secondary"
            size="s"
            icon="moreHorizontal"
            disabled={disabled}
            aria-label={`Actions for ${displayName(member)}`}
          />
        );
        if (!canRemove(member)) return trigger(true);
        return (
          <DropdownWrapper
            placement="bottom-end"
            closeAfterClick
            onSelect={() => (configured ? setRemoving(member) : demoOnly())}
            trigger={trigger(false)}
            dropdown={
              <Column padding="4" gap="2" minWidth={12}>
                <Option
                  value="remove"
                  label={label}
                  danger
                  prefix={<Icon name={member.you ? "logout" : "personRemove"} size="xs" />}
                />
              </Column>
            }
          />
        );
      },
    },
  ] as (DataTableColumn<OrgMemberRow> | false)[]).filter(
    (column): column is DataTableColumn<OrgMemberRow> => column !== false,
  );

  const roleFilter = table.query.filters.role ?? "all";

  return (
    <Column fillWidth gap="16" paddingX="16">
      <Row
        fillWidth
        gap="12"
        vertical="center"
        horizontal="between"
        s={{ direction: "column", horizontal: "start" }}
      >
        <Column fillWidth maxWidth={24}>
          <Input
            id="members-search"
            size="xs"
            placeholder="Search by email"
            prefix={<Icon name="search" size="xs" onBackground="neutral-weak" />}
            defaultValue={table.query.q}
            onChange={(e) => table.setSearch(e.target.value)}
          />
        </Column>
        <Row gap="12" vertical="center">
          <DropdownWrapper
            placement="bottom-end"
            selectedOption={roleFilter}
            closeAfterClick
            onSelect={(value) => table.setFilter("role", value === "all" ? null : value)}
            trigger={
              <Button size="m" variant="secondary" suffixIcon="chevronDown">
                {ROLE_FILTERS.find((f) => f.value === roleFilter)?.label ?? "All roles"}
              </Button>
            }
            dropdown={
              <Column padding="4" gap="2" minWidth={8}>
                {ROLE_FILTERS.map((f) => (
                  <Option
                    key={f.value}
                    value={f.value}
                    label={f.label}
                    selected={f.value === roleFilter}
                  />
                ))}
              </Column>
            }
          />
          {canManage && (
            <Button
              size="m"
              prefixIcon="plus"
              onClick={() => (configured ? setInviteOpen(true) : demoOnly())}
            >
              Invite
            </Button>
          )}
        </Row>
      </Row>

      {!configured && (
        <Feedback
          variant="info"
          description="Sample members. Connect Supabase to see this organization's own."
        />
      )}
      {table.error && <Feedback variant="danger" description={table.error} />}

      <DataTable
        {...table.tableProps}
        columns={columns}
        getRowId={(member) => member.user_id}
        perPageOptions={[10, 25, 50]}
        hoverable
        emptyState={
          <Column center gap="8" paddingY="32">
            <Text variant="label-default-m">No members match</Text>
            <Text variant="body-default-s" onBackground="neutral-weak">
              {table.query.q || table.query.filters.role
                ? "Try another search or role."
                : "Invite someone to get started."}
            </Text>
          </Column>
        }
      />

      {canManage && invitations.length > 0 && (
        <Column fillWidth gap="8" paddingTop="16">
          <Text variant="label-strong-s">Pending invitations</Text>
          {invitations.map((invitation) => (
            <Row
              key={invitation.id}
              fillWidth
              vertical="center"
              horizontal="between"
              paddingX="16"
              paddingY="8"
              radius="m"
              border="neutral-alpha-weak"
            >
              <Row gap="12" vertical="center">
                <Text variant="label-default-s">{invitation.email}</Text>
                <Tag size="s" scheme="neutral" label={ROLE_LABEL[invitation.role]} />
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  expires {invitation.expires_at.slice(0, 10)}
                </Text>
              </Row>
              <Button size="s" variant="tertiary" onClick={() => void revoke(invitation)}>
                Revoke
              </Button>
            </Row>
          ))}
        </Column>
      )}

      <InviteDialog
        open={inviteOpen}
        org={org}
        onClose={() => setInviteOpen(false)}
        onInvited={() => void loadInvitations()}
      />

      <Dialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        title={
          removing?.you
            ? "Leave this organization?"
            : `Remove ${removing ? displayName(removing) : ""}?`
        }
        description={
          removing?.you
            ? "You'll lose access to everything in it until someone invites you again."
            : "They'll lose access straight away. You can invite them again later."
        }
        footer={
          <Row gap="8" horizontal="end" fillWidth>
            <Button variant="secondary" onClick={() => setRemoving(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => removing && void remove(removing)}>
              {removing?.you ? "Leave" : "Remove"}
            </Button>
          </Row>
        }
      />
    </Column>
  );
}

/**
 * Invite by email. The link is shown once, here: the database keeps only its
 * hash, and Stack sends no email of its own (see src/lib/orgs/invitations.ts).
 */
function InviteDialog({
  open,
  org,
  onClose,
  onInvited,
}: {
  open: boolean;
  org: string;
  onClose: () => void;
  onInvited: () => void;
}) {
  const { addToast } = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);

  const close = () => {
    setEmail("");
    setRole("member");
    setError(null);
    setLink(null);
    onClose();
  };

  const submit = async () => {
    if (sending) return;
    setSending(true);
    setError(null);
    const res = await fetch(`/api/orgs/${encodeURIComponent(org)}/invitations`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    const body = await res.json().catch(() => ({}));
    setSending(false);
    if (!res.ok) {
      setError(apiErrorMessage(body, "Couldn't create the invitation"));
      return;
    }
    setLink((body as { url: string }).url);
    onInvited();
  };

  const copy = async () => {
    if (!link) return;
    await navigator.clipboard?.writeText(link).catch(() => undefined);
    addToast({ variant: "success", message: "Invitation link copied" });
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      title={link ? "Invitation ready" : "Invite someone"}
      description={
        link
          ? `Send this link to ${email}. It works once, for that address, for 7 days.`
          : "They'll join with the role you pick once they accept."
      }
    >
      {link ? (
        <Column fillWidth gap="16">
          <Input
            id="invite-link"
            readOnly
            value={link}
            suffix={
              <IconButton
                variant="ghost"
                size="s"
                icon="copy"
                tooltip="Copy"
                onClick={() => void copy()}
              />
            }
          />
          <Row horizontal="end">
            <Button onClick={close}>Done</Button>
          </Row>
        </Column>
      ) : (
        // Not a <form>: the role menu's buttons would submit it. Enter in
        // the email field submits instead.
        <Column fillWidth gap="16">
          <Input
            id="invite-email"
            type="email"
            label="Email"
            required
            value={email}
            error={error ? true : undefined}
            errorMessage={error ?? undefined}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void submit();
            }}
            suffix={
              <DropdownWrapper
                placement="bottom-end"
                selectedOption={role}
                closeAfterClick
                onSelect={(value) => setRole(value as "admin" | "member")}
                trigger={
                  <Button size="s" variant="secondary" suffixIcon="chevronDown">
                    {ROLE_LABEL[role]}
                  </Button>
                }
                dropdown={
                  <Column padding="4" gap="2" minWidth={8}>
                    {(["member", "admin"] as const).map((value) => (
                      <Option
                        key={value}
                        value={value}
                        label={ROLE_LABEL[value]}
                        selected={value === role}
                      />
                    ))}
                  </Column>
                }
              />
            }
          />
          <Row horizontal="end" gap="8">
            <Button variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button loading={sending} disabled={!email.trim()} onClick={() => void submit()}>
              Create invitation
            </Button>
          </Row>
        </Column>
      )}
    </Dialog>
  );
}
