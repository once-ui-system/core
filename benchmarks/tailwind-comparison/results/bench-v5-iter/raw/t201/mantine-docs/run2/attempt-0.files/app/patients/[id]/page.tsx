import { notFound } from "next/navigation";
import { PatientView } from "@/components/PatientView";
import { getPatient, patients } from "@/lib/data";

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getPatient(id)) notFound();
  return <PatientView id={id} />;
}
