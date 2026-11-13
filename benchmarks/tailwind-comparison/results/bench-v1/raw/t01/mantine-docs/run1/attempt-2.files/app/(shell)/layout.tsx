import { AppFrame } from "@/components/AppFrame";

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppFrame>{children}</AppFrame>;
}
