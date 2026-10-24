import { redirect } from "next/navigation";
import { currentViewer } from "@/lib/app-context";
import { listMyOrgs } from "@/lib/orgs/queries";

export default async function AppIndex() {
  const viewer = await currentViewer();
  if (!viewer) redirect("/auth?next=/app");
  const orgs = await listMyOrgs(viewer.id);
  if (orgs.length === 0) redirect("/app/new");
  redirect(`/app/${orgs[0].org.slug}`);
}
