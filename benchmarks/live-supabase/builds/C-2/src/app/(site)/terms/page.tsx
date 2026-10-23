import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms policy for Acme Notes.",
};

export default function Page() {
  return (
    <article className="mx-auto w-full max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Terms</h1>
      <p className="mt-4 text-muted-foreground">By using Acme Notes you agree to use it lawfully and to keep your account secure. Your team owns its notes; we provide the service as is and may update these terms with notice.</p>
    </article>
  );
}
