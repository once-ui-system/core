import { notFound } from "next/navigation";
import { Shell } from "@/components/pawpoint/Shell";
import { PatientRecordView } from "@/components/pawpoint/PatientRecord";
import { getPatient, patients } from "@/lib/data";

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = getPatient(id);
  return { title: `${patient?.name ?? "Patient"} · Pawpoint` };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = getPatient(id);
  if (!patient) notFound();
  return (
    <Shell>
      <PatientRecordView patient={patient} />
    </Shell>
  );
}
