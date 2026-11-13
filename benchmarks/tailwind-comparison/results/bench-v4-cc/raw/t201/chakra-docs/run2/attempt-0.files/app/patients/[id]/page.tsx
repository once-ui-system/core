import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { PatientRecord } from "@/components/patient-record"
import { PATIENTS, findPatient } from "@/lib/data"

export function generateStaticParams() {
  return PATIENTS.map((p) => ({ id: p.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const patient = findPatient(id)
  return { title: patient ? `${patient.name} | Pawpoint` : "Patient | Pawpoint" }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!findPatient(id)) notFound()
  return (
    <AppShell>
      <PatientRecord patientId={id} />
    </AppShell>
  )
}
