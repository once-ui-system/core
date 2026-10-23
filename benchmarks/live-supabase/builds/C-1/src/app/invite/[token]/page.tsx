import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/orgs";
import { AcceptInvite } from "@/components/accept-invite";

export const metadata: Metadata = {
  title: "Accept invitation",
  description: "Join an organization on Acme Notes.",
};

async function Gate({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const user = await getUser();
  if (!user) redirect("/auth");
  return <AcceptInvite token={token} />;
}

export default function Page({ params }: PageProps<"/invite/[token]">) {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 items-center px-4 py-16">
      <Suspense fallback={<p className="text-muted-foreground">Loading...</p>}>
        <Gate params={params} />
      </Suspense>
    </main>
  );
}
