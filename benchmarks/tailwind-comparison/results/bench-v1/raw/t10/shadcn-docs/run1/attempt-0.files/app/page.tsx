import { SiteHeader } from "@/components/haven/site-header";
import { SearchView } from "@/components/haven/search-view";

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col lg:h-svh">
      <SiteHeader />
      <main className="flex min-h-0 flex-1 flex-col">
        <SearchView />
      </main>
    </div>
  );
}
