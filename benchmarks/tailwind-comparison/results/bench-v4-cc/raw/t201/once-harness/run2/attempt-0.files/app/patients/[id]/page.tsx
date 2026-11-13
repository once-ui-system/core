import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PatientRecord } from "@/components/PatientRecord";
import { PATIENTS, patientById } from "@/lib/data";

export function generateStaticParams() {
  return PATIENTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const patient = patientById(id);
  return { title: patient ? `${patient.name} · Pawpoint` : "Patient · Pawpoint" };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = patientById(id);
  if (!patient) notFound();
  return <PatientRecord patient={patient} />;
}
