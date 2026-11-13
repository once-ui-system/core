import type { Metadata } from "next";
import { SearchPage } from "@/components/haven/SearchPage";

export const metadata: Metadata = {
  title: "Haven: homes for sale in Lisbon",
  description:
    "Search apartments, houses and studios for sale in Lisbon. Filter by type, price and bedrooms, and see every home on the map.",
};

export default function Page() {
  return <SearchPage />;
}
