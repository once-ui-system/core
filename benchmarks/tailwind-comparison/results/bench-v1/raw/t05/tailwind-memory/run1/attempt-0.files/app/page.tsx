import { TeamTable } from "@/components/team-table";

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3 sm:px-6">
          <span
            aria-hidden="true"
            className="inline-flex size-7 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white"
          >
            L
          </span>
          <span className="text-base font-semibold">Lumen</span>
          <span className="text-sm text-slate-500">/ Acme Labs</span>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <TeamTable />
      </main>
    </div>
  );
}
