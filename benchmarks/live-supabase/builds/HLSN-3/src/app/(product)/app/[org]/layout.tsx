import { notFound, redirect } from "next/navigation";
import { checkOrgAccessOrDemo } from "@/lib/orgs/guard";
import { getViewer } from "@/lib/session";

/** Every page under /app/[org] is for members of that organization only. */
export default async function OrgLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ org: string }> }>) {
  const { org } = await params;
  const viewer = await getViewer();
  const check = await checkOrgAccessOrDemo(org, viewer?.id ?? null);
  if (!check.ok) {
    if (check.status === 401) redirect(`/auth?next=${encodeURIComponent(`/app/${org}`)}`);
    notFound();
  }
  return children;
}
