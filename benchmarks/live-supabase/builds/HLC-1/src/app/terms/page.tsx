import { pageMetadata } from "@/lib/seo";
import { site } from "@/config/site";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata = pageMetadata({
  title: "Terms",
  description: `The terms for using ${site.name}.`,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16">
        <h1 className="text-4xl font-semibold tracking-tight">Terms</h1>
        <p className="mt-6 leading-7 text-muted-foreground">
          By creating an account you agree to use {site.name} for lawful purposes, to keep your sign-in details
          private, and to make sure that the people you invite to your organization are allowed to see its
          notes. The service is provided as is, and either side may end the agreement by closing the account.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
