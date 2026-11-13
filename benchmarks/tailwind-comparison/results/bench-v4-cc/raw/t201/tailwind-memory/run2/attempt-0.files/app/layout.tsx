import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Header } from "@/components/Header";
import { ClinicProvider } from "@/lib/clinic-context";

export const metadata: Metadata = {
  title: "Pawpoint | Hillside Veterinary Clinic",
  description: "Pawpoint, front-desk and records software for Hillside Veterinary Clinic",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:shadow-lg"
        >
          Skip to content
        </a>
        <ClinicProvider>
          <Header />
          {children}
        </ClinicProvider>
      </body>
    </html>
  );
}
