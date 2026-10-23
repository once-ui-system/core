import { redirect } from "next/navigation";
import { orgsFor, requireSession } from "../../lib/appdata";

export const dynamic = "force-dynamic";

export default async function AppIndex() {
  const session = await requireSession();
  const orgs = await orgsFor(session);
  redirect(orgs[0] ? `/app/${orgs[0].slug}` : "/app/new");
}
