import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app/AppHeader";
import { getSessionUser, listMyOrgs } from "@/lib/orgs/access";

// Signed-in shell: header with the organization switcher and the user menu.
export default async function AppLayout({ children }: LayoutProps<"/app">) {
  const user = await getSessionUser();
  if (!user) redirect("/auth?next=/app");
  const memberships = await listMyOrgs();
  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <AppHeader
        email={user.email}
        orgs={memberships.map(({ org }) => ({ slug: org.slug, name: org.name }))}
      />
      <div className="flex flex-1 flex-col md:flex-row">{children}</div>
    </div>
  );
}
