import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PatientRecord } from "@/components/patient-record";
import { getPatient, patients } from "@/lib/data";

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const patient = getPatient(id);
  return { title: patient ? `${patient.name}'s record` : "Patient not found" };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getPatient(id)) notFound();
  return <PatientRecord patientId={id} />;
}
