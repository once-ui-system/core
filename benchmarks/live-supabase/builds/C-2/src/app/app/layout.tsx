import { Suspense } from "react";
import { DemoNotice } from "@/components/site/demo-notice";

export default function AppRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DemoNotice />
      <Suspense fallback={<p className="p-6 text-sm text-muted-foreground">Loading…</p>}>{children}</Suspense>
    </>
  );
}
