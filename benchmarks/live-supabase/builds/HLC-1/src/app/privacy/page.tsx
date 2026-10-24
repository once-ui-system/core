import { pageMetadata } from "@/lib/seo";
import { site } from "@/config/site";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata = pageMetadata({
  title: "Privacy",
  description: `How ${site.name} handles your personal information.`,
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16">
        <h1 className="text-4xl font-semibold tracking-tight">Privacy</h1>
        <p className="mt-6 leading-7 text-muted-foreground">
          {site.name} stores the account details you give us, such as your email address, and the notes and
          organization data your team adds. We use this information only to run the service, keep your
          organization&apos;s data separate from other organizations, and contact you about your account. We do
          not sell personal information.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
