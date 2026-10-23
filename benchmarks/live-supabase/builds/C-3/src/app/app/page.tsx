import { redirect } from "next/navigation";
import { getAppOrgs, getAppUser } from "@/lib/orgs/context";

export default async function AppIndex() {
  await getAppUser();
  const orgs = await getAppOrgs();
  redirect(orgs[0] ? `/app/${orgs[0].slug}` : "/app/new");
}
