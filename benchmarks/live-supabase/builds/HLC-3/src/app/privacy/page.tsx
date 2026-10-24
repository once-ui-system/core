import type { Metadata } from "next";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

const description = "How Acme Notes handles the information you give us.";

export const metadata: Metadata = {
  title: "Privacy",
  description,
  alternates: { canonical: "/privacy" },
};

export default function Privacy() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-16">
        <h1 className="text-4xl font-semibold tracking-tight">Privacy</h1>
        <p className="mt-6 leading-7 text-muted-foreground">
          Acme Notes stores the email address and password you use to sign in, the organizations you
          create or join, and the notes and settings your team keeps in them. We use this information
          only to run the service, keep your workspace separate from other teams and contact you about
          your account. We do not sell it.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
