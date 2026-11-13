import type { Metadata } from "next";

import GuestList from "@/components/GuestList";

export const metadata: Metadata = { title: "Guest list" };

export default function Page() {
  return <GuestList />;
}
