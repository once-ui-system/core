import { Column, Heading, Row, Tag, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { BillingButton } from "./BillingButton";
import { RenameForm } from "./RenameForm";
import { canManage, requireOrgAccess } from "@/lib/orgs";

export const metadata: Metadata = {
  title: "Settings",
  description: "Rename the organization and manage its plan.",
};

export default async function SettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ org: string }>;
  searchParams: Promise<{ billing?: string }>;
}) {
  const { org } = await params;
  const { billing } = await searchParams;
  const { access } = await requireOrgAccess(org);
  const manage = canManage(access);

  return (
    <Column gap="24">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-s">
          Settings
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {access.name}
        </Text>
      </Column>

      {billing === "success" ? (
        <Text variant="body-default-s" onBackground="success-medium" role="status">
          Thanks. Your plan updates as soon as Stripe confirms the payment.
        </Text>
      ) : null}
      {billing === "cancelled" ? (
        <Text variant="body-default-s" onBackground="neutral-weak" role="status">
          Checkout was cancelled. Your plan has not changed.
        </Text>
      ) : null}

      <Column as="section" gap="16" background="surface" border radius="l" padding="24">
        <Heading as="h2" variant="heading-strong-m">
          Organization name
        </Heading>
        {manage ? (
          <RenameForm slug={access.slug} name={access.name} />
        ) : (
          <Text variant="body-default-m" onBackground="neutral-weak">
            Only owners and admins can rename the organization.
          </Text>
        )}
      </Column>

      <Column as="section" gap="16" background="surface" border radius="l" padding="24">
        <Row horizontal="between" vertical="center" wrap gap="16">
          <Heading as="h2" variant="heading-strong-m">
            Plan
          </Heading>
          <Tag label={access.plan === "team" ? "Team" : "Free"} scheme={access.plan === "team" ? "brand" : "neutral"} />
        </Row>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {access.plan === "team"
            ? "Unlimited members, billed per member per month."
            : "Free includes up to 3 members. Team is $8 per member per month."}
        </Text>
        {manage && access.plan !== "team" ? <BillingButton slug={access.slug} /> : null}
      </Column>
    </Column>
  );
}
