import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import PatientRecord from "@/components/PatientRecord";
import { patientById, patients } from "@/lib/data";

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = patientById(id);
  if (!patient) notFound();
  return (
    <AppShell>
      <PatientRecord patientId={patient.id} />
    </AppShell>
  );
}
