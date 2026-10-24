import { notFound, redirect } from "next/navigation";
import { AppNav } from "@/components/app/AppNav";
import { getOrgPageContext, getSessionUser } from "@/lib/orgs/access";

// Organization shell: sidebar (collapses to a sheet on mobile) for one organization.
// Signed-out visitors go to sign in; non-members get a 404.
export default async function OrgLayout({ children, params }: LayoutProps<"/app/[org]">) {
  const { org: slug } = await params;
  const context = await getOrgPageContext(slug);
  if (!context) {
    if (!(await getSessionUser())) redirect(`/auth?next=/app/${slug}`);
    notFound();
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col md:flex-row">
      <AppNav slug={context.org.slug} orgName={context.org.name} role={context.role} />
      <div className="min-w-0 flex-1 p-4 md:p-8">{children}</div>
    </div>
  );
}
