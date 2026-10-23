import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CreateOrgForm } from "@/components/app/create-org-form";
import { getSessionUser } from "@/lib/orgs";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "Create an organization",
  description: "Create an organization for your team in Acme Notes.",
};

export default async function NewOrgPage() {
  const user = await getSessionUser();
  if (!user) redirect("/auth?next=/app/new");
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-4 px-4 py-16">
      <h1 className="text-2xl font-bold tracking-tight">Create an organization</h1>
      {isSupabaseConfigured() ? (
        <CreateOrgForm />
      ) : (
        <p className="text-muted-foreground">
          Supabase is not configured, so organizations can't be created in demo mode.{" "}
          <Link href="/app" className="text-primary underline">Back to the demo</Link>
        </p>
      )}
    </div>
  );
}
