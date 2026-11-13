import type { Metadata } from "next";
import { AppFrame } from "../../components/AppFrame";

export const metadata: Metadata = { title: "Members · Lumen" };

export default function MembersLayout({ children }: { children: React.ReactNode }) {
  return <AppFrame>{children}</AppFrame>;
}
