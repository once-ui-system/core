import type { Metadata } from "next";
import { Column, Feedback, Heading, Text } from "@once-ui-system/core";
import { RenameForm } from "@/components/product/RenameForm";
import { UpgradeButton } from "@/components/product/UpgradeButton";
import { canManage } from "@/lib/orgs/roles";
import { loadOrgPage } from "@/lib/orgs/guard";
import { baseURL, product } from "@/resources";

const seo = product.settings;

export const metadata: Metadata = {
  metadataBase: new URL(baseURL),
  title: seo.title,
  description: seo.description,
  robots: seo.robots,
};

export default async function SettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ org: string }>;
  searchParams: Promise<{ upgraded?: string }>;
}) {
  const { org: slug } = await params;
  const { upgraded } = await searchParams;
  const page = await loadOrgPage(slug);
  const manager = canManage(page.role);
  const onTeam = page.org.plan === "team";

  return (
    <Column gap="32" fillWidth maxWidth="m">
      <Heading as="h1" variant="display-strong-s">
        Settings
      </Heading>

      <Column gap="16" padding="24" radius="l" border="neutral-alpha-weak" background="surface">
        <Heading as="h2" variant="heading-strong-s">
          Organization
        </Heading>
        {manager ? (
          <RenameForm slug={page.org.slug} name={page.org.name} demo={page.demo} />
        ) : (
          <Text variant="body-default-m" onBackground="neutral-weak">
            {page.org.name}. Only owners and admins can change the name.
          </Text>
        )}
      </Column>

      <Column gap="16" padding="24" radius="l" border="neutral-alpha-weak" background="surface">
        <Heading as="h2" variant="heading-strong-s">
          Plan
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {onTeam
            ? "This organization is on Team: $8 per member per month."
            : "This organization is on Free, for up to 3 members. Team is $8 per member per month."}
        </Text>
        {upgraded === "1" && <Feedback variant="success" description="Thanks. Your plan updates once payment completes." />}
        {manager && !onTeam && <UpgradeButton slug={page.org.slug} demo={page.demo} />}
      </Column>
    </Column>
  );
}
