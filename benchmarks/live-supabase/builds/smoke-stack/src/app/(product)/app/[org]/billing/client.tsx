"use client";

import { useOrg } from "@/components/OrgProvider";
import { apiErrorMessage } from "@/lib/api-error-message";
import {
  type CatalogPlan,
  type Interval,
  catalog,
  describeUsage,
  formatAmount,
  isMetered,
  meteredPrices,
  primaryPrice,
} from "@/lib/billing/catalog";
import { DEMO_ORG_SLUG } from "@/lib/orgs/types";
import { isSupabaseConfigured } from "@/lib/sb/config";
import {
  Button,
  Column,
  Feedback,
  Heading,
  Icon,
  Row,
  SegmentedControl,
  Skeleton,
  Tag,
  Text,
  useToast,
} from "@once-ui-system/core";
import { useCallback, useEffect, useState } from "react";

/** What GET /api/orgs/[org]/billing answers — OrgBilling in src/lib/billing/server.ts. */
type Billing = {
  mode: "stripe" | "mock" | "off";
  plan: { key: string; name: string; features: string[] };
  subscription: {
    status: string;
    price_key: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
    entitled: boolean;
  } | null;
  canManage: boolean;
  hasCustomer: boolean;
};

const FEATURE_LABEL: Record<string, string> = {
  members: "Unlimited members",
  invitations: "Invitations by link",
  analytics: "Analytics",
  api: "API access",
  "priority-support": "Priority support",
};

const STATUS: Record<string, { label: string; scheme: "success" | "warning" | "danger" | "neutral" }> = {
  active: { label: "Active", scheme: "success" },
  trialing: { label: "Trial", scheme: "success" },
  past_due: { label: "Payment failed", scheme: "danger" },
  unpaid: { label: "Unpaid", scheme: "danger" },
  incomplete: { label: "Awaiting payment", scheme: "warning" },
  paused: { label: "Paused", scheme: "neutral" },
};

const DEMO_BILLING: Billing = {
  mode: "mock",
  plan: { key: catalog.free.key, name: catalog.free.name, features: catalog.free.features },
  subscription: null,
  canManage: true,
  hasCustomer: false,
};

export default function BillingClient() {
  const configured = isSupabaseConfigured();
  const { slug } = useOrg();
  const org = slug ?? DEMO_ORG_SLUG;
  const { addToast } = useToast();

  const [billing, setBilling] = useState<Billing | null>(configured ? null : DEMO_BILLING);
  const [error, setError] = useState<string | null>(null);
  const [interval, setInterval] = useState<Interval>("month");
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!configured) return;
    const res = await fetch(`/api/orgs/${encodeURIComponent(org)}/billing`, { credentials: "include", cache: "no-store" });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(apiErrorMessage(body, "Couldn't load billing"));
      return;
    }
    setBilling(body as Billing);
  }, [configured, org]);

  useEffect(() => {
    void load();
    // Back from Stripe: say so once, then drop the parameter so a refresh is quiet.
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    const portal = params.get("portal");
    if (checkout === "success") addToast({ variant: "success", message: "You're subscribed. Thank you!" });
    if (checkout === "cancelled") addToast({ variant: "info", message: "Checkout cancelled. Nothing was charged." });
    if (portal === "cancelled") addToast({ variant: "info", message: "Plan cancelled. You're on Free." });
    if (checkout || portal) window.history.replaceState(window.history.state, "", window.location.pathname);
  }, [load, addToast]);

  const go = async (action: "checkout" | "portal", price?: string) => {
    if (!configured) {
      addToast({ variant: "info", message: "Connect Supabase to try checkout. No Stripe key is needed: billing runs in mock mode." });
      return;
    }
    setBusy(price ?? action);
    const res = await fetch(`/api/orgs/${encodeURIComponent(org)}/billing/${action}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(price ? { price } : {}),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setBusy(null);
      addToast({ variant: "danger", message: apiErrorMessage(body, "That didn't work") });
      return;
    }
    window.location.assign((body as { url: string }).url);
  };

  const sub = billing?.subscription ?? null;
  const status = sub ? (STATUS[sub.status] ?? { label: sub.status, scheme: "neutral" as const }) : null;
  const onPaidPlan = Boolean(sub?.entitled);

  return (
    <Column fillWidth horizontal="center" paddingX="16">
      <Column maxWidth="l" fillWidth gap="24">
        <Heading variant="display-strong-s">Billing</Heading>

        {!configured && (
          <Feedback variant="info" description="Sample billing. With Supabase connected and no Stripe key, checkout runs in mock mode, so the whole flow works locally." />
        )}
        {billing?.mode === "mock" && configured && (
          <Feedback variant="warning" description="Mock mode: no STRIPE_SECRET_KEY is set, so plans activate without payment. Production refuses to run like this." />
        )}
        {billing?.mode === "off" && (
          <Feedback variant="warning" description="Billing is off: set STRIPE_SECRET_KEY to take payments." />
        )}
        {error && <Feedback variant="danger" description={error} />}

        <Row fillWidth gap="20" padding="24" radius="l" border="neutral-alpha-medium" background="surface" vertical="center" s={{ direction: "column", horizontal: "start" }}>
          <Column flex={1} gap="8">
            <Text variant="label-default-s" onBackground="neutral-weak">Current plan</Text>
            {billing ? (
              <Row gap="12" vertical="center">
                <Heading variant="heading-strong-l">{billing.plan.name}</Heading>
                {status && <Tag size="s" scheme={status.scheme} label={status.label} />}
              </Row>
            ) : (
              <Skeleton shape="line" size="xl" width={12} />
            )}
            {sub?.current_period_end && (
              <Text variant="body-default-s" onBackground="neutral-weak">
                {sub.cancel_at_period_end ? "Ends" : "Renews"} on {sub.current_period_end.slice(0, 10)}
              </Text>
            )}
            {sub && !sub.entitled && (
              <Text variant="body-default-s" onBackground="danger-weak">
                The last payment didn't go through, so paid features are paused. Update the card to restore them.
              </Text>
            )}
          </Column>
          {billing?.canManage && sub && (
            <Button variant="secondary" loading={busy === "portal"} onClick={() => void go("portal")}>
              {billing.mode === "mock" ? "Cancel plan (mock)" : "Manage billing"}
            </Button>
          )}
        </Row>

        <Row fillWidth horizontal="between" vertical="center" gap="16">
          <Heading as="h2" variant="heading-strong-m">Plans</Heading>
          <Row maxWidth={14} fillWidth>
            <SegmentedControl
              compact
              fillWidth
              value={interval}
              onChange={(value) => setInterval(value as Interval)}
              buttons={[
                { value: "month", label: "Monthly" },
                { value: "year", label: "Yearly" },
              ]}
            />
          </Row>
        </Row>

        <Row fillWidth gap="16" s={{ direction: "column" }}>
          <PlanCard
            name={catalog.free.name}
            description={catalog.free.description}
            features={catalog.free.features}
            price={`${formatAmount(0)} / ${interval}`}
            current={billing !== null && !onPaidPlan}
          />
          {catalog.plans.map((plan) => (
            <PaidPlanCard
              key={plan.key}
              plan={plan}
              interval={interval}
              current={onPaidPlan && billing?.plan.key === plan.key}
              disabled={!billing?.canManage || onPaidPlan || billing?.mode === "off"}
              busy={busy}
              onChoose={(price) => void go("checkout", price)}
            />
          ))}
        </Row>
        {onPaidPlan && billing?.canManage && (
          <Text variant="body-default-s" onBackground="neutral-weak">
            To switch plans, use {billing.mode === "mock" ? "Cancel plan, then pick another" : "Manage billing"}.
          </Text>
        )}
        {billing && !billing.canManage && (
          <Text variant="body-default-s" onBackground="neutral-weak">Only owners and admins can change the plan.</Text>
        )}
      </Column>
    </Column>
  );
}

function PaidPlanCard({
  plan,
  interval,
  current,
  disabled,
  busy,
  onChoose,
}: {
  plan: CatalogPlan;
  interval: Interval;
  current: boolean;
  disabled: boolean;
  busy: string | null;
  onChoose: (price: string) => void;
}) {
  const price = primaryPrice(plan, interval);
  const usage = isMetered(price) ? [price] : meteredPrices(plan, price.interval);
  return (
    <PlanCard
      name={plan.name}
      description={plan.description}
      features={plan.features}
      price={isMetered(price) ? "Pay as you go" : `${formatAmount(price.amount)} / ${price.interval ?? "once"}`}
      usage={usage.map(describeUsage)}
      current={current}
      action={
        <Button fillWidth disabled={disabled || current} loading={busy === price.key} onClick={() => onChoose(price.key)}>
          {current ? "Current plan" : `Choose ${plan.name}`}
        </Button>
      }
    />
  );
}

function PlanCard({
  name,
  description,
  features,
  price,
  current,
  usage = [],
  action,
}: {
  name: string;
  description?: string;
  features: string[];
  price: string;
  current: boolean;
  usage?: string[];
  action?: React.ReactNode;
}) {
  return (
    <Column flex={1} fillWidth gap="16" padding="24" radius="l" background="surface" border={current ? "brand-alpha-strong" : "neutral-alpha-medium"}>
      <Column gap="4">
        <Row gap="8" vertical="center">
          <Heading as="h3" variant="heading-strong-s">{name}</Heading>
          {current && <Tag size="s" scheme="brand" label="Current" />}
        </Row>
        {description && <Text variant="body-default-s" onBackground="neutral-weak">{description}</Text>}
      </Column>
      <Column gap="4">
        <Text variant="heading-default-m">{price}</Text>
        {usage.map((line) => (
          <Text key={line} variant="body-default-s" onBackground="neutral-weak">
            {line}
          </Text>
        ))}
      </Column>
      <Column gap="8" flex={1}>
        {features.map((feature) => (
          <Row key={feature} gap="8" vertical="center">
            <Icon name="check" size="xs" onBackground="brand-medium" />
            <Text variant="body-default-s">{FEATURE_LABEL[feature] ?? feature}</Text>
          </Row>
        ))}
      </Column>
      {action}
    </Column>
  );
}
