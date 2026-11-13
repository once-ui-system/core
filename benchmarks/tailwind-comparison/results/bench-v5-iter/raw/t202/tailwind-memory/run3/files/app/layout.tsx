import "./globals.css";

import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { PlanProvider } from "@/components/PlanProvider";
import { Toast } from "@/components/Toast";

export const metadata: Metadata = {
  title: "Seatwise",
  description: "Seating planner for wedding and event planners",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow"
        >
          Skip to content
        </a>
        <PlanProvider>
          <Header />
          <main id="main" className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-6 sm:py-5">
            {children}
          </main>
          <Toast />
        </PlanProvider>
      </body>
    </html>
  );
}
