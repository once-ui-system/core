import { AppShell } from "@/components/lumen/AppShell";

export default function LumenLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
