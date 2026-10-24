import { site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Terms",
  description: `The terms for using ${site.name}.`,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Terms</h1>
      <p className="mt-6 leading-7 text-muted-foreground">
        By using {site.name} you agree to use it lawfully and to keep your sign-in details to yourself. Organization
        owners and admins are responsible for who they invite and what their members do in the workspace.
      </p>
      <p className="mt-4 leading-7 text-muted-foreground">
        The service is provided as is, and either side may end the agreement by closing the account.
      </p>
    </section>
  );
}
