import { redirect } from "next/navigation";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { getCurrentUser, listMyOrgs } from "@/lib/orgs/context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { signOut } from "@/app/auth/actions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DemoBanner } from "@/components/app/demo-banner";

export const metadata = pageMetadata({ title: "Profile", description: "Your Acme Notes account.", path: "/profile" });

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/profile");
  const orgs = await listMyOrgs();
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-12">
        <DemoBanner />
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <h2 className="mb-2 text-sm font-medium">Organizations</h2>
              <ul className="flex flex-col gap-2 text-sm">
                {orgs.map((org) => (
                  <li key={org.id} className="flex items-center justify-between gap-2">
                    <Link href={`/app/${org.slug}`} className="hover:underline">{org.name}</Link>
                    <Badge variant="secondary" className="capitalize">{org.role}</Badge>
                  </li>
                ))}
                {orgs.length === 0 && <li className="text-muted-foreground">No organizations yet.</li>}
              </ul>
            </div>
            <form action={signOut}>
              <button type="submit" className={buttonVariants({ variant: "outline" })}>Sign out</button>
            </form>
          </CardContent>
        </Card>
        <Link href="/app" className={buttonVariants({ variant: "ghost", className: "self-start" })}>Back to the app</Link>
      </main>
      <SiteFooter />
    </>
  );
}
