import type { Metadata } from "next";
import { PageShell } from "@/components/site/header";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms for Acme Notes.",
};

export default function Page() {
  return (
    <PageShell>
      <h1 className="text-4xl font-bold tracking-tight">Terms</h1>
      <p className="mt-6 max-w-2xl leading-7 text-muted-foreground">
        By using Acme Notes you agree to use it lawfully and to keep your sign-in details safe. Your notes stay yours; we provide the service as is and may update these terms with notice.
      </p>
    </PageShell>
  );
}
