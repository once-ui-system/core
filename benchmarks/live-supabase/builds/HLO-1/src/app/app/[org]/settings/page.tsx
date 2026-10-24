import { Button, Column, Heading, Input, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { ActionForm } from "../../../../components/ActionForm";
import { renameOrgAction, startCheckoutAction } from "../../../../lib/actions/orgs";
import { canManage, FREE_MEMBER_LIMIT, orgPageAccess } from "../../../../lib/orgs";
import { pageMetadata } from "../../../../lib/seo";

type Params = { params: Promise<{ org: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { org } = await params;
  return pageMetadata({ title: `Settings · ${org}`, description: "Rename the organization and manage its plan.", path: `/app/${org}/settings` });
}

export default async function Settings({
  params,
  searchParams,
}: Params & { searchParams: Promise<{ billing?: string }> }) {
  const { org: slug } = await params;
  const { billing } = await searchParams;
  const { org } = await orgPageAccess(slug);
  const manage = canManage(org.role);

  return (
    <Column gap="24" maxWidth="s">
      <Heading as="h1" variant="display-strong-xs">
        Settings
      </Heading>

      <Column background="surface" border radius="l" padding="24" gap="16">
        <Heading as="h2" variant="heading-strong-m">
          Organization name
        </Heading>
        {manage ? (
          <ActionForm action={renameOrgAction} submitLabel="Save name">
            <input type="hidden" name="slug" value={org.slug} />
            <Input id="org-name" name="name" label="Name" defaultValue={org.name} required maxLength={80} />
          </ActionForm>
        ) : (
          <Text variant="body-default-m">{org.name}</Text>
        )}
      </Column>

      <Column background="surface" border radius="l" padding="24" gap="16">
        <Heading as="h2" variant="heading-strong-m">
          Plan
        </Heading>
        <Text as="p" variant="body-default-m" onBackground="neutral-medium">
          {org.plan === "team"
            ? "You are on the Team plan: $8 per member per month."
            : `You are on the Free plan: up to ${FREE_MEMBER_LIMIT} members.`}
        </Text>
        {billing === "success" && (
          <Text as="p" variant="body-default-s" onBackground="success-strong" role="status">
            Thanks. Your plan updates as soon as Stripe confirms the payment.
          </Text>
        )}
        {billing === "cancelled" && (
          <Text as="p" variant="body-default-s" onBackground="neutral-weak" role="status">
            Checkout was cancelled. Your plan has not changed.
          </Text>
        )}
        {manage && org.plan === "free" && (
          <ActionForm action={startCheckoutAction} submitLabel="Upgrade to Team">
            <input type="hidden" name="slug" value={org.slug} />
          </ActionForm>
        )}
        {!manage && <Button variant="tertiary" label="Only owners and admins can change the plan" disabled />}
      </Column>
    </Column>
  );
}
