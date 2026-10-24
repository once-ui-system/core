import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CreateOrgForm } from "@/components/app/CreateOrgForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listMyOrgs } from "@/lib/orgs/access";

export const metadata: Metadata = {
  title: "Your organizations",
  description: "Choose an organization or create a new one.",
  robots: { index: false, follow: false },
};

// Sends the user to their first organization. Without one, or with ?new=1, shows the create form.
export default async function AppIndex({ searchParams }: PageProps<"/app">) {
  const { new: wantsNew } = await searchParams;
  const memberships = await listMyOrgs();
  if (memberships.length > 0 && wantsNew === undefined) {
    redirect(`/app/${memberships[0].org.slug}`);
  }

  return (
    <main className="flex-1 p-4 md:p-8">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>{memberships.length > 0 ? "Create an organization" : "Create your first organization"}</CardTitle>
          <CardDescription>
            Organizations hold a team&apos;s notebooks and members. You become its owner.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateOrgForm />
        </CardContent>
      </Card>
    </main>
  );
}
