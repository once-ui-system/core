import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { SearchView } from "@/components/SearchView";

export const metadata: Metadata = {
  title: "Haven · Homes for sale in Lisbon",
  description: "Search apartments, houses and studios across Lisbon.",
};

export default function Page() {
  return (
    <div className="flex min-h-dvh flex-col bg-stone-50 text-stone-900">
      <Header />
      <main className="flex min-h-0 flex-1 flex-col">
        <SearchView />
      </main>
    </div>
  );
}
