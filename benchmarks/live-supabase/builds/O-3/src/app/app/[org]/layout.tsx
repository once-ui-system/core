import { AppShell } from "@/components/AppShell";
import { loadContext } from "@/lib/context";

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ org: string }>;
}) {
  const ctx = await loadContext((await params).org);
  return (
    <AppShell demo={ctx.demo} user={ctx.user} orgs={ctx.orgs} current={ctx.current}>
      {children}
    </AppShell>
  );
}
