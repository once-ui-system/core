import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/orgs";

async function Gate({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/auth");
  return <>{children}</>;
}

export default function AppRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="p-6 text-muted-foreground">Loading...</div>}>
      <Gate>{children}</Gate>
    </Suspense>
  );
}
