import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PatientRecord } from "@/components/PatientRecord";
import { Shell } from "@/components/Shell";
import { getPatient, patients } from "@/lib/data";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const patient = getPatient(id);
  return { title: patient ? `${patient.name} | Pawpoint` : "Patient | Pawpoint" };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const patient = getPatient(id);
  if (!patient) notFound();
  return (
    <Shell>
      <PatientRecord patient={patient} />
    </Shell>
  );
}
