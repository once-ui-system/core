import "./globals.css";

import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { ClinicProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "Pawpoint · Hillside Veterinary Clinic",
  description: "Front-desk and records software for Hillside Veterinary Clinic",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-slate-100 font-sans text-slate-900 antialiased">
        <ClinicProvider>
          <AppShell>{children}</AppShell>
        </ClinicProvider>
      </body>
    </html>
  );
}
