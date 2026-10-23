import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy policy for Acme Notes.",
};

export default function Page() {
  return (
    <article className="mx-auto w-full max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Privacy</h1>
      <p className="mt-4 text-muted-foreground">We collect only what we need to run your account: your email address and the notes your team creates. We never sell your data, and you can ask us to delete it at any time.</p>
    </article>
  );
}
