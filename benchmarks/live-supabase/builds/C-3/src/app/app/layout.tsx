import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "App",
  description: "Your Acme Notes workspace.",
  robots: { index: false },
};

export default function AppLayout({ children }: LayoutProps<"/app">) {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading…</div>}>
      {children}
    </Suspense>
  );
}
