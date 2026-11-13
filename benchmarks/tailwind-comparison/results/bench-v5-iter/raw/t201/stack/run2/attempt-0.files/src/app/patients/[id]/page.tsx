import { notFound } from "next/navigation";
import { DeskShell } from "@/components/desk/DeskShell";
import { PatientRecord } from "@/components/desk/PatientRecord";
import { getPatient, patients } from "@/lib/data";

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = getPatient(id);
  if (!patient) notFound();
  return (
    <DeskShell>
      <PatientRecord patient={patient} />
    </DeskShell>
  );
}
