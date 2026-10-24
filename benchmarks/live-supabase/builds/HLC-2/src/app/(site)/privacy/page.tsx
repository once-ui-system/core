import { site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy",
  description: `How ${site.name} handles your account and workspace data.`,
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Privacy</h1>
      <p className="mt-6 leading-7 text-muted-foreground">
        {site.name} stores the account details you give us, your email address and password, and the organizations,
        members, invitations and notes you create. We use this information only to run the service for you and your
        team. We do not sell it, and we share it only with the providers that run the service for us.
      </p>
      <p className="mt-4 leading-7 text-muted-foreground">
        Questions about your data can be sent to {site.email}.
      </p>
    </section>
  );
}
