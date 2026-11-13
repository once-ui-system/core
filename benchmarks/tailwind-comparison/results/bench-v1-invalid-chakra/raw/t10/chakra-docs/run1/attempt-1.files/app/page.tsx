import type { Metadata } from "next";
import { SearchView } from "@/components/search-view";

export const metadata: Metadata = {
  title: "Haven | Homes for sale in Lisbon",
  description:
    "Search apartments, houses and studios in Lisbon by type, price and bedrooms, with every home on the map.",
};

export default function Page() {
  return <SearchView />;
}
