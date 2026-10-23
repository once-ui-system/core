import { requireOrg } from "@/lib/orgs/server";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { notFound, redirect } from "next/navigation";

/**
 * The tenancy gate for everything under `/app/[org]`.
 *
 * The proxy already sends a signed-out visitor to `/auth`, but it only knows
 * whether there is a session — not whether this session belongs in THIS
 * organization. That question can only be answered against the database, so
 * it is answered here, once, for every page in the segment.
 *
 * A non-member gets a 404 rather than a 403: see the NOT_FOUND note in
 * src/lib/orgs/server.ts.
 */
export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ org: string }>;
}) {
  // Demo mode: no Supabase at all, so there is no membership to check and
  // nothing to leak. Every composition has to run with zero environment
  // variables, and the product shell renders its sample data for any slug.
  //
  // Configured-but-incomplete is NOT this case: the guard below answers 503
  // and the segment 404s, which is the direction a tenancy gate should fail.
  if (!isSupabaseConfigured()) return <>{children}</>;

  const { org } = await params;
  const guard = await requireOrg(org);

  if (!guard.ok) {
    if (guard.status === 401) redirect("/auth");
    notFound();
  }

  return <>{children}</>;
}
