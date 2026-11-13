import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import PatientRecord from "@/components/PatientRecord";
import { patients } from "@/lib/data";

export const metadata: Metadata = { title: "Patient record | Pawpoint" };

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!patients.some((p) => p.id === id)) notFound();
  return (
    <AppShell>
      <PatientRecord id={id} />
    </AppShell>
  );
}
