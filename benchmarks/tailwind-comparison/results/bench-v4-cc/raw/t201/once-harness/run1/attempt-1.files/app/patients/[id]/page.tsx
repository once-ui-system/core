import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Column } from "@once-ui-system/core";
import { AppHeader } from "@/components/AppHeader";
import { PatientRecord } from "@/components/PatientRecord";
import { patients } from "@/lib/data";

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const patient = patients.find((p) => p.id === id);
  return { title: patient ? `${patient.name} | Pawpoint` : "Patient | Pawpoint" };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!patients.some((p) => p.id === id)) notFound();
  return (
    <Column fillWidth minHeight="100vh">
      <AppHeader />
      <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="24">
        <Column fillWidth maxWidth="64rem">
          <PatientRecord id={id} />
        </Column>
      </Column>
    </Column>
  );
}
