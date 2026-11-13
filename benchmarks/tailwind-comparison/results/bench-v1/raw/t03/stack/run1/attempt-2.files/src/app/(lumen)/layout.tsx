import { LumenShell } from "@/components/lumen/LumenShell";

export default function LumenLayout({ children }: { children: React.ReactNode }) {
  return <LumenShell>{children}</LumenShell>;
}
