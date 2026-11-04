import type { Metadata } from "next";
import { MembersView } from "@/components/lumen/MembersView";

export const metadata: Metadata = {
  title: "Members · Lumen",
  description: "People with access to your Lumen workspace.",
};

export default function MembersPage() {
  return <MembersView />;
}
