import { redirect } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { getCurrentUser } from "@/lib/orgs/context";
import { isSupabaseConfigured } from "@/lib/env";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NewOrgForm } from "@/components/app/forms";
import { DemoBanner } from "@/components/app/demo-banner";

export const metadata = pageMetadata({ title: "New organization", description: "Create an organization in Acme Notes.", path: "/app/new" });

export default async function NewOrgPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/app/new");
  return (
    <div className="mx-auto max-w-lg">
      <DemoBanner />
      <Card>
        <CardHeader>
          <CardTitle>Create an organization</CardTitle>
          <CardDescription>You become its owner and can invite your team.</CardDescription>
        </CardHeader>
        <CardContent>
          {isSupabaseConfigured() ? <NewOrgForm /> : <p className="text-sm text-muted-foreground">Not available in demo mode.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
