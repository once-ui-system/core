import "./globals.css";

import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: { default: "Pawpoint | Hillside Veterinary Clinic", template: "%s | Pawpoint" },
  description: "Front-desk and records software for Hillside Veterinary Clinic.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0f766e" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:shadow-lg"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
