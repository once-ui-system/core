import { Column, Feedback, Heading, Meta, Row, Text } from "@once-ui-system/core";
import { notFound } from "next/navigation";
import { baseURL, product } from "@/resources";
import { requireOrg } from "@/lib/orgs/server";
import { orgPath, roleAtLeast } from "@/lib/orgs/types";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { RenameForm, UpgradeButton } from "./SettingsForms";

type PageProps = {
  params: Promise<{ org: string }>;
  searchParams: Promise<{ upgraded?: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  return Meta.generate({
    title: product.settings.title,
    description: product.settings.description,
    baseURL: baseURL,
    path: orgPath(org, "/settings"),
    robots: product.settings.robots,
    alternates: product.settings.alternates,
  });
}

/**
 * Organization settings: the name (owners and admins), and the plan with the
 * upgrade to Team (owners and admins).
 */
export default async function Settings({ params, searchParams }: PageProps) {
  const { org } = await params;
  const { upgraded } = await searchParams;

  if (!isSupabaseConfigured()) {
    return (
      <Column fillWidth gap="24" paddingY="16">
        <Heading as="h1" variant="display-strong-s">Settings</Heading>
        <Feedback variant="info" description="Supabase is not configured, so settings cannot be changed. Add the Supabase variables from .env.example." />
      </Column>
    );
  }

  const guard = await requireOrg(org);
  if (!guard.ok) notFound();
  const canAdmin = roleAtLeast(guard.role, "admin");
  const onFree = guard.org.plan === "free";

  return (
    <Column fillWidth gap="32" paddingY="16" maxWidth="s">
      <Heading as="h1" variant="display-strong-s">Settings</Heading>

      <Column gap="16">
        <Heading as="h2" variant="heading-strong-m">Organization</Heading>
        {canAdmin ? (
          <RenameForm slug={guard.org.slug} name={guard.org.name} />
        ) : (
          <Text variant="body-default-m">{guard.org.name}</Text>
        )}
      </Column>

      <Column gap="16">
        <Heading as="h2" variant="heading-strong-m">Plan</Heading>
        <Row gap="8" vertical="center">
          <Text variant="body-default-m">{onFree ? "Free: up to 3 members" : "Team: $8 per member per month"}</Text>
        </Row>
        {upgraded === "1" && (
          <Feedback variant="success" description="Thanks. Your organization moves to the Team plan once payment is confirmed." />
        )}
        {onFree && canAdmin && <UpgradeButton slug={guard.org.slug} />}
        {onFree && !canAdmin && (
          <Text variant="body-default-s" onBackground="neutral-weak">
            Ask an owner or admin to upgrade to the Team plan.
          </Text>
        )}
      </Column>
    </Column>
  );
}
