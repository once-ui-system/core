"use client";

import { apiErrorMessage } from "@/lib/api-error-message";
import type { OrgInvitation, OrgMember } from "@/lib/orgs/types";
import {
  Button,
  Column,
  Feedback,
  Heading,
  Input,
  Row,
  SegmentedControl,
  Tag,
  Text,
  useToast,
} from "@once-ui-system/core";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Member = Pick<OrgMember, "user_id" | "email" | "role">;

export default function MembersClient({
  org,
  demo,
  canInvite,
  members,
  invitations,
}: {
  org: string;
  demo: boolean;
  canInvite: boolean;
  members: Member[];
  invitations: OrgInvitation[];
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "admin">("member");
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState<string | null>(null);

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (demo) {
      addToast({ variant: "info", message: "Supabase is not configured, so invitations are off." });
      return;
    }
    setBusy(true);
    setLink(null);
    const res = await fetch(`/api/orgs/${encodeURIComponent(org)}/invitations`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, ...(email.trim() ? { email: email.trim() } : {}) }),
    });
    const body = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      addToast({ variant: "danger", message: apiErrorMessage(body, "Couldn't create the invitation") });
      return;
    }
    setLink((body as { url: string }).url);
    setEmail("");
    router.refresh();
  };

  const revoke = async (id: string) => {
    const res = await fetch(`/api/orgs/${encodeURIComponent(org)}/invitations?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) router.refresh();
    else addToast({ variant: "danger", message: "Couldn't revoke the invitation" });
  };

  return (
    <Column fillWidth gap="24">
      <Heading as="h1" variant="display-strong-s" paddingLeft="16">
        Members
      </Heading>

      <Column fillWidth radius="l" border="neutral-alpha-medium" background="surface" overflow="hidden">
        {members.map((member, index) => (
          <Row
            key={member.user_id}
            fillWidth
            horizontal="between"
            vertical="center"
            gap="16"
            padding="16"
            borderTop={index === 0 ? undefined : "neutral-alpha-weak"}
          >
            <Text variant="body-default-m">{member.email ?? member.user_id}</Text>
            <Tag size="s" label={member.role} />
          </Row>
        ))}
        {members.length === 0 && (
          <Text padding="16" onBackground="neutral-weak">
            No members yet.
          </Text>
        )}
      </Column>

      {canInvite ? (
        <Column fillWidth gap="16" padding="24" radius="l" border="neutral-alpha-medium" background="surface">
          <Heading as="h2" variant="heading-strong-m">
            Invite people
          </Heading>
          <Text variant="body-default-s" onBackground="neutral-weak">
            Create an invitation link and send it yourself. It works for 7 days. Add an email to
            limit it to one person.
          </Text>
          <form onSubmit={(e) => void invite(e)}>
            <Column gap="16">
              <Input
                id="invite-email"
                label="Email (optional)"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <SegmentedControl
                compact
                value={role}
                onChange={(value) => setRole(value as "member" | "admin")}
                buttons={[
                  { value: "member", label: "Member" },
                  { value: "admin", label: "Admin" },
                ]}
              />
              <Row>
                <Button type="submit" loading={busy}>
                  Create invitation link
                </Button>
              </Row>
            </Column>
          </form>
          {link && <Feedback variant="success" title="Invitation link" description={link} />}
          {invitations.length > 0 && (
            <Column gap="8">
              <Text variant="label-default-s" onBackground="neutral-weak">
                Open invitations
              </Text>
              {invitations.map((invitation) => (
                <Row key={invitation.id} horizontal="between" vertical="center" gap="16">
                  <Text variant="body-default-s">
                    {invitation.email ?? "Anyone with the link"} · {invitation.role}
                  </Text>
                  <Button size="s" variant="tertiary" onClick={() => void revoke(invitation.id)}>
                    Revoke
                  </Button>
                </Row>
              ))}
            </Column>
          )}
        </Column>
      ) : (
        <Text variant="body-default-s" onBackground="neutral-weak" paddingLeft="16">
          Only owners and admins can invite people.
        </Text>
      )}
    </Column>
  );
}
