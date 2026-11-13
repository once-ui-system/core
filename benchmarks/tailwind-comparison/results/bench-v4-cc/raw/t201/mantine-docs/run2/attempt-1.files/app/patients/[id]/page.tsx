import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Frame } from "@/components/Frame";
import { PatientRecord } from "@/components/PatientRecord";
import { patientById, patients } from "@/lib/data";

export const metadata: Metadata = { title: "Patient record · Pawpoint" };

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!patientById(id)) notFound();
  return (
    <Frame>
      <PatientRecord patientId={id} />
    </Frame>
  );
}
