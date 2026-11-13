import type { Metadata } from "next";
import { AppFrame } from "@/components/seatwise/AppFrame";
import { GuestsView } from "@/components/seatwise/GuestsView";

export const metadata: Metadata = {
  title: "Guest list · Seatwise",
  description: "Search and filter the guest list, see each guest's table and the meal counts for the caterer.",
};

export default function Page() {
  return (
    <AppFrame>
      <GuestsView />
    </AppFrame>
  );
}
