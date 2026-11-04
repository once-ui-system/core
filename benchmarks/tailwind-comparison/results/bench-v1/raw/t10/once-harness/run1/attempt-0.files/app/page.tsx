import type { Metadata } from "next";
import { SearchApp } from "@/components/SearchApp";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Haven — homes for sale in Lisbon",
  description: "Search homes in Lisbon by type, price and bedrooms, and compare them on the map.",
};

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <SearchApp />
      </main>
    </>
  );
}
