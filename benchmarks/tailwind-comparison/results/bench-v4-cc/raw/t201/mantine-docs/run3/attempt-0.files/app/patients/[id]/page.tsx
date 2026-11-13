import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PatientRecord } from "@/components/PatientRecord";
import { patientById, patients } from "@/lib/data";

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = patientById(id);
  return { title: p ? `${p.name} · Pawpoint` : "Patient · Pawpoint" };
}

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = patientById(id);
  if (!patient) notFound();
  return <PatientRecord patient={patient} />;
}
