import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppFrame } from "@/components/AppFrame";
import { PatientRecord } from "@/components/PatientRecord";
import { getPatient, patients } from "@/lib/data";

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const patient = getPatient(id);
  return { title: patient ? `${patient.name} | Pawpoint` : "Patient | Pawpoint" };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getPatient(id)) notFound();
  return (
    <AppFrame>
      <PatientRecord patientId={id} />
    </AppFrame>
  );
}
