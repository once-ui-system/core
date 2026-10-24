import { notFound } from "next/navigation";
import { orgAccessFor } from "@/lib/app-context";

// Every org-scoped page passes through here: non-members get a 404, never the data.
export default async function OrgLayout({ children, params }: LayoutProps<"/app/[org]">) {
  const { org } = await params;
  const access = await orgAccessFor(org);
  if (!access) notFound();
  return children;
}
