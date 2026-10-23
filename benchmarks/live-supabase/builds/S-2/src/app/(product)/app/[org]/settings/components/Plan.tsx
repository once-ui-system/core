"use client";

import { useOrg } from "@/components/OrgProvider";
import { apiErrorMessage } from "@/lib/api-error-message";
import { DEMO_ORG_SLUG } from "@/lib/orgs/types";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { Button, Column, Heading, Row, Text, useToast } from "@once-ui-system/core";
import { useState } from "react";

/** The organization's plan, and the upgrade to Team for owners and admins. */
export function Plan() {
  const configured = isSupabaseConfigured();
  const { slug, selected } = useOrg();
  const { addToast } = useToast();
  const org = slug ?? DEMO_ORG_SLUG;
  const [busy, setBusy] = useState(false);

  const plan = selected?.plan ?? "free";
  const role = configured ? (selected?.role ?? "member") : "owner";
  const canManage = role === "owner" || role === "admin";

  const upgrade = async () => {
    if (!configured) {
      addToast({ variant: "info", message: "Connect Supabase and Stripe to upgrade." });
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/orgs/${encodeURIComponent(org)}/billing/checkout`, {
      method: "POST",
      credentials: "include",
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || typeof (body as { url?: unknown }).url !== "string") {
      setBusy(false);
      addToast({ variant: "danger", message: apiErrorMessage(body, "Couldn't start the checkout") });
      return;
    }
    window.location.assign((body as { url: string }).url);
  };

  return (
    <Row
      id="plan"
      fillWidth
      gap="20"
      padding="24"
      radius="l"
      border="neutral-alpha-medium"
      background="surface"
      s={{ direction: "column" }}
    >
      <Column fillWidth gap="2" vertical="center">
        <Heading as="h2" variant="heading-strong-xs">
          Plan: {plan === "team" ? "Team" : "Free"}
        </Heading>
        <Text variant="label-default-s" onBackground="neutral-weak">
          {plan === "team"
            ? "$8 per member per month."
            : canManage
              ? "Free includes up to 3 members. Team is $8 per member per month."
              : "Only owners and admins can change the plan."}
        </Text>
      </Column>
      {plan === "free" && canManage && (
        <Button size="s" loading={busy} onClick={() => void upgrade()}>
          Upgrade to Team
        </Button>
      )}
    </Row>
  );
}
