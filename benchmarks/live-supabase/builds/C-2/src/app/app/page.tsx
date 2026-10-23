import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser, listUserOrgs } from "@/lib/orgs";

export const metadata: Metadata = {
  title: "Your organizations",
  description: "Open your first organization in Acme Notes.",
};

export default async function AppIndex() {
  const user = await getSessionUser();
  if (!user) redirect("/auth?next=/app");
  const orgs = await listUserOrgs(user.id);
  if (orgs.length === 0) redirect("/app/new");
  redirect(`/app/${orgs[0].org.slug}`);
}
