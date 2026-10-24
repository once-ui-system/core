import { redirect } from "next/navigation";
import { Shell, type OrgOption } from "@/components/product/Shell";
import { listOrgsForUser } from "@/lib/orgs/data";
import { getCurrentUser } from "@/lib/orgs/guard";
import { DEMO_ORG } from "@/lib/orgs/demo";
import { isSupabaseConfigured } from "@/lib/sb/config";

// Depends on the environment at request time (demo mode or live Supabase).
export const dynamic = "force-dynamic";

/** The signed-in layout. Sign-in is enforced by the proxy; this re-checks it. */
export default async function ProductLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!isSupabaseConfigured()) {
    const demoOrgs: OrgOption[] = [{ slug: DEMO_ORG.slug, name: DEMO_ORG.name }];
    return (
      <Shell email="" demo orgs={demoOrgs}>
        {children}
      </Shell>
    );
  }

  const user = await getCurrentUser();
  if (!user) redirect("/auth");

  const orgs = await listOrgsForUser(user.id);
  return (
    <Shell email={user.email ?? ""} demo={false} orgs={orgs.map((org) => ({ slug: org.slug, name: org.name }))}>
      {children}
    </Shell>
  );
}
