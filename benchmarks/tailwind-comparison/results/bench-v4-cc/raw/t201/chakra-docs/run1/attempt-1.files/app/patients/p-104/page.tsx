import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { PatientRecord } from "@/components/patient-record";

export const metadata: Metadata = { title: "Olive's record" };

export default function Page() {
  return (
    <AppShell>
      <PatientRecord patientId="p-104" />
    </AppShell>
  );
}
