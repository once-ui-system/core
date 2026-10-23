import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Acme Notes stores the notes and account details you give us to run the service. We do not sell your data, and you can ask us to delete it at any time.",
};

export default function Page() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-bold">Privacy</h1>
      <p className="mt-4 text-muted-foreground">Acme Notes stores the notes and account details you give us to run the service. We do not sell your data, and you can ask us to delete it at any time.</p>
    </div>
  );
}
