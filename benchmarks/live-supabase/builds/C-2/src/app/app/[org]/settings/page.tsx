import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SettingsForms } from "@/components/app/settings-forms";
import { canManage, getOrgContext, getSessionUser } from "@/lib/orgs";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "Settings",
  description: "Organization settings and billing.",
};

export default async function SettingsPage({ params }: { params: Promise<{ org: string }> }) {
  const user = await getSessionUser();
  const ctx = user && (await getOrgContext((await params).org, user.id));
  if (!ctx) notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      <SettingsForms
        slug={ctx.org.slug}
        name={ctx.org.name}
        plan={ctx.org.plan}
        canManage={canManage(ctx.role)}
        live={isSupabaseConfigured()}
      />
    </div>
  );
}
