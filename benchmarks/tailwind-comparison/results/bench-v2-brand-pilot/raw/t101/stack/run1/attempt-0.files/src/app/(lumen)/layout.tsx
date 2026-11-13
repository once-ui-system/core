import { LumenShell } from "@/components/LumenShell";

export default function LumenLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <LumenShell>{children}</LumenShell>;
}
