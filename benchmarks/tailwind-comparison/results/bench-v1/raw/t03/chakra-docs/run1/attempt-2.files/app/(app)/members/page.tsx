import type { Metadata } from "next";
import { MembersView } from "@/components/members-view";

export const metadata: Metadata = { title: "Members · Lumen" };

export default function MembersPage() {
  return <MembersView />;
}
