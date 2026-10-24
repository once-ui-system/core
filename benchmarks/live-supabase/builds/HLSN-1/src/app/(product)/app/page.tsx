import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CreateOrgForm } from "@/components/product/CreateOrgForm";
import { listOrgsForUser } from "@/lib/orgs/data";
import { getCurrentUser } from "@/lib/orgs/guard";
import { DEMO_ORG } from "@/lib/orgs/demo";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { baseURL, product } from "@/resources";

// Depends on the environment at request time (demo mode or live Supabase).
export const dynamic = "force-dynamic";

const seo = product.dashboard;

export const metadata: Metadata = {
  metadataBase: new URL(baseURL),
  title: seo.title,
  description: seo.description,
  robots: seo.robots,
};

/** Sends the user to their first organization, or asks them to create one. */
export default async function AppIndex() {
  if (!isSupabaseConfigured()) redirect(`/app/${DEMO_ORG.slug}`);

  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=%2Fapp");

  const orgs = await listOrgsForUser(user.id);
  if (orgs.length > 0) redirect(`/app/${orgs[0].slug}`);

  return <CreateOrgForm demo={false} />;
}
