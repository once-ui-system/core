import { notFound } from "next/navigation";
import PatientRecord from "@/components/PatientRecord";
import { patients } from "@/lib/data";

export const dynamicParams = false;

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!patients.some((p) => p.id === id)) notFound();
  return <PatientRecord id={id} />;
}
