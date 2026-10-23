import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateOrgForm } from "@/components/app/forms";
import { PageShell } from "@/components/site/header";
import { getAppUser } from "@/lib/orgs/context";

export const metadata: Metadata = {
  title: "New organization",
  description: "Create an organization for your team.",
};

export default async function NewOrg() {
  await getAppUser();
  return (
    <PageShell>
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">New organization</CardTitle>
          <CardDescription>You will be its owner.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateOrgForm />
        </CardContent>
      </Card>
    </PageShell>
  );
}
