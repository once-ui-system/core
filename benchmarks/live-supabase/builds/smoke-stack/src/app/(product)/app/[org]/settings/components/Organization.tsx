"use client";

import { useOrg } from "@/components/OrgProvider";
import { apiErrorMessage } from "@/lib/api-error-message";
import { DEMO_ORG_SLUG } from "@/lib/orgs/types";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { Button, Column, Dialog, Heading, Input, Row, Text, useToast } from "@once-ui-system/core";
import { useEffect, useState } from "react";

/**
 * Settings about the tenant: its name, its address, and the two exits —
 * deleting it (owners, never a personal one) and leaving it. Both exits are
 * enforced server-side; the controls only hide what the server would refuse.
 */
function Organization() {
  const configured = isSupabaseConfigured();
  const { slug, selected, refresh } = useOrg();
  const { addToast } = useToast();
  const org = slug ?? DEMO_ORG_SLUG;

  const role = configured ? (selected?.role ?? "member") : "owner";
  const personal = selected?.personal ?? false;
  const [name, setName] = useState(selected?.name ?? "Demo workspace");
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState<"delete" | "leave" | null>(null);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (selected) setName(selected.name);
  }, [selected]);

  const demoOnly = () =>
    addToast({ variant: "info", message: "Connect Supabase to change organization settings." });

  const save = async () => {
    if (!configured) return demoOnly();
    setSaving(true);
    const res = await fetch(`/api/orgs/${encodeURIComponent(org)}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const body = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      addToast({ variant: "danger", message: apiErrorMessage(body, "Couldn't rename the organization") });
      return;
    }
    addToast({ variant: "success", message: "Organization renamed" });
    await refresh();
  };

  const exit = async () => {
    if (!configured) return demoOnly();
    const res = await fetch(
      confirm === "delete"
        ? `/api/orgs/${encodeURIComponent(org)}`
        : `/api/orgs/${encodeURIComponent(org)}/members?userId=me`,
      { method: "DELETE", credentials: "include" },
    );
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setConfirm(null);
      addToast({ variant: "danger", message: apiErrorMessage(body, "That didn't work") });
      return;
    }
    window.location.assign("/app");
  };

  const canAdmin = role === "owner" || role === "admin";

  return (
    <Column fillWidth gap="-1">
      <Row fillWidth gap="20" paddingY="24" paddingLeft="16" paddingRight="24" topRadius="l" border="neutral-alpha-medium" background="surface" s={{ direction: "column" }}>
        <Column fillWidth gap="2" vertical="center" paddingLeft="12">
          <Heading as="h2" variant="heading-strong-xs">Name</Heading>
          <Text variant="label-default-s" onBackground="neutral-weak">
            {canAdmin ? "Shown in the workspace switcher" : "Only owners and admins can rename it"}
          </Text>
        </Column>
        <Row maxWidth={22} vertical="center" gap="8">
          <Input id="org-name" size="s" value={name} disabled={!canAdmin} onChange={(e) => setName(e.target.value)} maxLength={64} />
          {canAdmin && <Button size="s" label="Save" loading={saving} disabled={!name.trim() || name === selected?.name} onClick={() => void save()} />}
        </Row>
      </Row>
      <Row fillWidth gap="20" paddingY="24" paddingLeft="16" paddingRight="24" border="neutral-alpha-medium" background="surface" s={{ direction: "column" }}>
        <Column fillWidth gap="2" vertical="center" paddingLeft="12">
          <Heading as="h2" variant="heading-strong-xs">Address</Heading>
          <Text variant="label-default-s" onBackground="neutral-weak">Part of every link to this organization, so it never changes</Text>
        </Column>
        <Text variant="code-default-s" onBackground="neutral-weak" wrap="nowrap">/app/{org}</Text>
      </Row>
      <Row fillWidth gap="20" paddingY="24" paddingLeft="16" paddingRight="24" bottomRadius="l" border="danger-alpha-medium" background="danger-medium" s={{ direction: "column" }}>
        <Column fillWidth gap="2" vertical="center" paddingLeft="12">
          <Heading as="h2" variant="heading-strong-xs">{role === "owner" ? "Delete organization" : "Leave organization"}</Heading>
          <Text variant="label-default-s" onBackground="danger-weak">
            {personal
              ? "Your personal organization stays with your account"
              : role === "owner"
                ? "Removes it for every member. A live subscription has to be cancelled first."
                : "You'll lose access until someone invites you again"}
          </Text>
        </Column>
        <Row gap="8">
          {role === "owner" && !personal && (
            <Button size="s" variant="secondary" label="Leave" onClick={() => setConfirm("leave")} />
          )}
          <Button
            size="s"
            variant="danger"
            disabled={personal}
            label={role === "owner" ? "Delete" : "Leave"}
            onClick={() => setConfirm(role === "owner" ? "delete" : "leave")}
          />
        </Row>
      </Row>

      <Dialog
        open={confirm !== null}
        onClose={() => {
          setConfirm(null);
          setTyped("");
        }}
        title={confirm === "delete" ? `Delete ${selected?.name ?? org}?` : `Leave ${selected?.name ?? org}?`}
        description={
          confirm === "delete"
            ? "Its members and invitations go with it. This can't be undone."
            : "If you're the last owner, make someone else an owner first."
        }
        footer={
          <Row gap="8" horizontal="end" fillWidth>
            <Button variant="secondary" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button variant="danger" disabled={confirm === "delete" && typed !== org} onClick={() => void exit()}>
              {confirm === "delete" ? "Delete organization" : "Leave"}
            </Button>
          </Row>
        }
      >
        {confirm === "delete" && (
          <Input id="confirm-delete" label={`Type ${org} to confirm`} value={typed} onChange={(e) => setTyped(e.target.value)} />
        )}
      </Dialog>
    </Column>
  );
}

export { Organization };
