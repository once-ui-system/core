import { Header } from "@/components/Header";
import { SearchView } from "@/components/SearchView";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900">
      <Header />
      <main className="flex min-h-0 flex-1 flex-col">
        <SearchView />
      </main>
    </div>
  );
}
