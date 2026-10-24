import type { Metadata } from "next";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

const description = "The terms that apply when you use Acme Notes.";

export const metadata: Metadata = {
  title: "Terms",
  description,
  alternates: { canonical: "/terms" },
};

export default function Terms() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-16">
        <h1 className="text-4xl font-semibold tracking-tight">Terms</h1>
        <p className="mt-6 leading-7 text-muted-foreground">
          By using Acme Notes you agree to use it for lawful purposes and to keep your sign-in details
          private. Your team is responsible for the content it adds and for the people it invites.
          The service is provided as is, and either party may end the agreement at any time by
          deleting the organization or closing the account.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
