"use client";

import { Button, Column, Heading, Input, Row, Text } from "@once-ui-system/core";
import { useState } from "react";

async function call(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data;
}

export function NewOrgForm({ demo }: { demo: boolean }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const org = await call("/api/orgs", "POST", { name });
      window.location.assign(`/app/${org.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      setBusy(false);
    }
  }
  return (
    <Column as="main" fillWidth horizontal="center" paddingX="16" paddingY="64">
      <Column maxWidth={28} fillWidth background="surface" border radius="l" padding="32" gap="24">
        <Heading as="h1" variant="heading-strong-xl">
          Create an organization
        </Heading>
        <form onSubmit={submit}>
          <Column gap="16">
            <Input id="org-name" label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            {error && <Text role="alert" onBackground="danger-strong">{error}</Text>}
            <Button type="submit" loading={busy} disabled={demo} label="Create" />
            {demo && <Text variant="body-default-s" onBackground="neutral-weak">Not available in demo mode.</Text>}
          </Column>
        </form>
      </Column>
    </Column>
  );
}

export function InviteForm({ org, demo }: { org: string; demo: boolean }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "admin">("member");
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setLink("");
    try {
      const inv = await call(`/api/orgs/${org}/invitations`, "POST", { email: email || undefined, role });
      setLink(inv.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
    setBusy(false);
  }
  return (
    <form onSubmit={submit}>
      <Column gap="16" background="surface" border radius="l" padding="24">
        <Heading as="h2" variant="heading-strong-l">
          Invite someone
        </Heading>
        <Row gap="16" wrap vertical="end">
          <Input id="invite-email" type="email" label="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Row gap="8">
            <Button type="button" size="s" variant={role === "member" ? "primary" : "secondary"} label="Member" onClick={() => setRole("member")} />
            <Button type="button" size="s" variant={role === "admin" ? "primary" : "secondary"} label="Admin" onClick={() => setRole("admin")} />
          </Row>
          <Button type="submit" loading={busy} disabled={demo} label="Create invite link" />
        </Row>
        {demo && <Text variant="body-default-s" onBackground="neutral-weak">Not available in demo mode.</Text>}
        {error && <Text role="alert" onBackground="danger-strong">{error}</Text>}
        {link && (
          <Column gap="4">
            <Text variant="label-default-s">Share this link (valid for 7 days)</Text>
            <Text as="code" variant="code-default-s" style={{ wordBreak: "break-all" }}>{link}</Text>
          </Column>
        )}
      </Column>
    </form>
  );
}

export function SettingsForms({
  org,
  name,
  plan,
  canManage,
  demo,
}: {
  org: string;
  name: string;
  plan: string;
  canManage: boolean;
  demo: boolean;
}) {
  const [value, setValue] = useState(name);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function rename(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMsg("");
    try {
      await call(`/api/orgs/${org}`, "PATCH", { name: value });
      setMsg("Saved");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
    setBusy(false);
  }
  async function upgrade() {
    setBusy(true);
    setError("");
    try {
      const { url } = await call(`/api/orgs/${org}/billing/checkout`, "POST");
      window.location.assign(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      setBusy(false);
    }
  }

  return (
    <Column gap="24">
      <form onSubmit={rename}>
        <Column gap="16" background="surface" border radius="l" padding="24">
          <Heading as="h2" variant="heading-strong-l">
            Organization name
          </Heading>
          <Input id="rename" label="Name" value={value} onChange={(e) => setValue(e.target.value)} disabled={!canManage || demo} required />
          {!canManage && <Text variant="body-default-s" onBackground="neutral-weak">Only admins and owners can rename the organization.</Text>}
          {canManage && !demo && <Row><Button type="submit" loading={busy} label="Save" /></Row>}
          {msg && <Text>{msg}</Text>}
        </Column>
      </form>
      <Column gap="16" background="surface" border radius="l" padding="24">
        <Heading as="h2" variant="heading-strong-l">
          Plan
        </Heading>
        <Text>
          Current plan: <strong>{plan === "team" ? "Team" : "Free"}</strong>
        </Text>
        {plan !== "team" && canManage && !demo && (
          <Row><Button onClick={upgrade} loading={busy} label="Upgrade to Team ($8 per member per month)" /></Row>
        )}
      </Column>
      {error && <Text role="alert" onBackground="danger-strong">{error}</Text>}
    </Column>
  );
}
