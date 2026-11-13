import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { patientById, patients } from "@/lib/data";
import { PatientRecord } from "@/components/PatientRecord";

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const patient = patientById[id];
  return { title: patient ? `${patient.name} | Pawpoint` : "Patient | Pawpoint" };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!patientById[id]) notFound();
  return <PatientRecord id={id} />;
}
