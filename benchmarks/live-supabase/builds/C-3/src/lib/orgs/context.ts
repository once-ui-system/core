import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { getUser } from "@/lib/sb/server";
import { listUserOrgs, type OrgInfo } from "./server";
import { DEMO_ORG } from "./types";

export type AppUser = { id: string; email: string };

export const getAppUser = cache(async (): Promise<AppUser> => {
  if (!isSupabaseConfigured()) return { id: DEMO_ORG.id, email: "demo@acme-notes.example" };
  const user = await getUser();
  if (!user) redirect("/auth");
  return { id: user.id, email: user.email ?? "" };
});

export const getAppOrgs = cache(async (): Promise<OrgInfo[]> => {
  const user = await getAppUser();
  if (!isSupabaseConfigured()) return [DEMO_ORG];
  return listUserOrgs(user.id);
});

export async function getAppContext(slug: string) {
  const user = await getAppUser();
  const orgs = await getAppOrgs();
  const org = orgs.find((o) => o.slug === slug);
  if (!org) notFound();
  return { user, orgs, org };
}
