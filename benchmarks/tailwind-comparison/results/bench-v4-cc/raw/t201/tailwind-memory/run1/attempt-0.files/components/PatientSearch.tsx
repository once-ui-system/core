"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { getOwner, patients } from "@/lib/data";
import { AlertBadges } from "@/components/AlertBadges";

export default function PatientSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const listId = useId();

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    const digits = term.replace(/\D/g, "");
    return patients.filter((p) => {
      const owner = getOwner(p.owner);
      const phoneMatch = digits.length >= 3 && owner.phone.replace(/\D/g, "").includes(digits);
      return p.name.toLowerCase().includes(term) || owner.name.toLowerCase().includes(term) || phoneMatch;
    });
  }, [query]);

  const showPanel = open && query.trim().length > 0;

  function go(id: string) {
    setOpen(false);
    setQuery("");
    router.push(`/patients/${id}`);
  }

  return (
    <div
      className="relative w-full"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (results.length > 0) go(results[0].id);
        }}
      >
        <label htmlFor="patient-search" className="sr-only">
          Search patients or owners by name
        </label>
        <div className="relative">
          <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-slate-500" />
          <input
            id="patient-search"
            type="search"
            autoComplete="off"
            value={query}
            placeholder="Find a patient or owner"
            aria-controls={listId}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setOpen(false);
                setQuery("");
              }
            }}
            className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 pl-11 pr-4 text-base text-slate-900 placeholder:text-slate-500 focus:border-teal-600 focus:bg-white"
          />
        </div>
      </form>

      <div role="status" className="sr-only">
        {showPanel ? `${results.length} ${results.length === 1 ? "match" : "matches"}` : ""}
      </div>

      {showPanel && (
        <div
          id={listId}
          className="absolute inset-x-0 top-full z-40 mt-2 max-h-[70vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
        >
          {results.length === 0 ? (
            <p className="px-3 py-4 text-sm text-slate-600">No patient or owner matches &ldquo;{query.trim()}&rdquo;.</p>
          ) : (
            <ul>
              {results.map((p) => {
                const owner = getOwner(p.owner);
                return (
                  <li key={p.id}>
                    <Link
                      href={`/patients/${p.id}`}
                      onClick={() => {
                        setOpen(false);
                        setQuery("");
                      }}
                      className="block rounded-lg px-3 py-2.5 hover:bg-teal-50 focus-visible:bg-teal-50"
                    >
                      <span className="flex flex-wrap items-baseline gap-x-2">
                        <span className="font-semibold text-slate-900">{p.name}</span>
                        <span className="text-sm text-slate-600">
                          {p.species}, {p.breed}
                        </span>
                      </span>
                      <span className="block text-sm text-slate-600">
                        {owner.name} &middot; {owner.phone}
                      </span>
                      <AlertBadges alerts={p.alerts} className="mt-1.5" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
