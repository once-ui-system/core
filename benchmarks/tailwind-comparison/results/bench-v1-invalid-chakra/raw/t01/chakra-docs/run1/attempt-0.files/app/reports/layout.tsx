import { AppShell } from "@/components/app-shell";

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
