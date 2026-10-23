import type { Metadata } from "next";
import { NewOrgForm } from "../../../components/OrgForms";
import { isSupabaseConfigured } from "../../../lib/env";
import { requireSession } from "../../../lib/appdata";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "New organization", description: "Create an organization for your team." };

export default async function NewOrg() {
  await requireSession();
  return <NewOrgForm demo={!isSupabaseConfigured()} />;
}
