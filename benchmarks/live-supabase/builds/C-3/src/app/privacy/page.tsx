import type { Metadata } from "next";
import { PageShell } from "@/components/site/header";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy for Acme Notes.",
};

export default function Page() {
  return (
    <PageShell>
      <h1 className="text-4xl font-bold tracking-tight">Privacy</h1>
      <p className="mt-6 max-w-2xl leading-7 text-muted-foreground">
        We collect only the account details and notes you give us, use them to run Acme Notes, and never sell them. You can ask us to delete your data at any time.
      </p>
    </PageShell>
  );
}
