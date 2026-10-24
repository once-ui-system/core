import { redirect } from "next/navigation";
import { getCurrentUser, listMyOrgs } from "@/lib/orgs/context";

// /app sends the user to their first organization.
export default async function AppIndex() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/app");
  const orgs = await listMyOrgs();
  if (orgs.length === 0) redirect("/app/new");
  redirect(`/app/${orgs[0].slug}`);
}
