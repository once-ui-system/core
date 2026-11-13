import type { Metadata } from "next";
import { SearchPage } from "@/components/SearchPage";

export const metadata: Metadata = {
  title: "Haven | Homes for sale in Lisbon",
  description: "Search apartments, houses and studios for sale in Lisbon, with prices on an interactive map.",
};

export default function Page() {
  return <SearchPage />;
}
