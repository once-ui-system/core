import { AppShell } from "@/components/AppShell";

export default function LumenLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
