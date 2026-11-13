import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { PatientRecordView } from "@/components/PatientRecordView"
import { PATIENTS, getPatient } from "@/lib/data"

export function generateStaticParams() {
  return PATIENTS.map((p) => ({ id: p.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const patient = getPatient(id)
  return { title: patient ? `${patient.name} | Pawpoint` : "Patient not found | Pawpoint" }
}

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const patient = getPatient(id)
  if (!patient) notFound()
  return <PatientRecordView patientId={patient.id} />
}
