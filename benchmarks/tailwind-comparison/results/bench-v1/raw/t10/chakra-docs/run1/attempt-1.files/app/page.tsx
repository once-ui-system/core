import type { Metadata } from "next";
import SearchPage from "@/components/search-page";

export const metadata: Metadata = {
  title: "Haven · Homes for sale in Lisbon",
  description:
    "Search apartments, houses and studios for sale in Lisbon, on the list or on the map.",
};

export default function Page() {
  return <SearchPage />;
}
