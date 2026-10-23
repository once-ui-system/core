import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { canManage, getMembership, getUser } from "@/lib/orgs";
import { SettingsForms } from "@/components/settings-forms";

export const metadata: Metadata = {
  title: "Settings",
  description: "Organization settings and billing.",
};

export default async function SettingsPage({ params }: PageProps<"/app/[org]/settings">) {
  const { org: slug } = await params;
  const user = await getUser();
  const org = user && (await getMembership(user.id, slug));
  if (!org) notFound();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <SettingsForms org={org.slug} name={org.name} plan={org.plan} canManage={canManage(org.role)} />
    </div>
  );
}
