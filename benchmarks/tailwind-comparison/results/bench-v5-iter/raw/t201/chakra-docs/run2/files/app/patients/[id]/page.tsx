import { notFound } from "next/navigation"
import { AppShell } from "@/components/AppShell"
import { PatientView } from "@/components/PatientView"
import { PATIENTS, patientById } from "@/lib/data"

export function generateStaticParams() {
  return PATIENTS.map((p) => ({ id: p.id }))
}

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const patient = patientById(id)
  if (!patient) notFound()
  return (
    <AppShell>
      <PatientView id={id} />
    </AppShell>
  )
}
