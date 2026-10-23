import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser, listUserOrgs } from "@/lib/orgs";

export const metadata: Metadata = {
  title: "App",
  description: "Your Acme Notes workspace.",
};

export default async function AppIndex() {
  const user = await getUser();
  if (!user) redirect("/auth");
  const orgs = await listUserOrgs(user.id);
  redirect(orgs[0] ? `/app/${orgs[0].slug}` : "/app/new");
}
