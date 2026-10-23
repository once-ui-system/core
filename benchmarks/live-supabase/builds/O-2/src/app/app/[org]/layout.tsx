import { notFound } from "next/navigation";
import { AppFrame } from "../../../components/AppFrame";
import { orgsFor, requireSession } from "../../../lib/appdata";

export const dynamic = "force-dynamic";

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ org: string }>;
}) {
  const { org: slug } = await params;
  const session = await requireSession();
  const orgs = await orgsFor(session);
  const current = orgs.find((o) => o.slug === slug);
  if (!current) notFound();
  return (
    <AppFrame
      email={session.email}
      current={{ slug: current.slug, name: current.name }}
      orgs={orgs.map((o) => ({ slug: o.slug, name: o.name }))}
    >
      {children}
    </AppFrame>
  );
}
