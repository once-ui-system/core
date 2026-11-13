"use client";

import { useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, TriangleAlert } from "lucide-react";
import { OWNERS, PATIENTS, getOwner } from "@/lib/data";

export function PatientSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return PATIENTS.filter((p) => {
      const owner = getOwner(p.owner);
      return p.name.toLowerCase().includes(q) || (owner?.name.toLowerCase().includes(q) ?? false);
    });
  }, [query]);

  const showList = open && query.trim().length > 0;

  function go(id: string) {
    setOpen(false);
    setQuery("");
    router.push(`/patients/${id}`);
  }

  return (
    <div
      ref={wrapRef}
      className="relative w-full"
      onBlur={(e) => {
        if (!wrapRef.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <label htmlFor="patient-search" className="sr-only">
        Search patients or owners
      </label>
      <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-slate-500" />
      <input
        id="patient-search"
        type="search"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        placeholder="Find a patient or owner"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((i) => Math.min(i + 1, results.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
          } else if (e.key === "Enter" && results[active]) {
            e.preventDefault();
            go(results[active].id);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-3 text-base text-slate-900 placeholder:text-slate-500 shadow-sm"
      />
      {showList && (
        <ul
          id={listId}
          aria-label="Search results"
          className="absolute left-0 right-0 top-full z-30 mt-2 max-h-96 overflow-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl"
        >
          {results.length === 0 && (
            <li className="px-3 py-3 text-sm text-slate-600">
              No patient or owner matches &ldquo;{query.trim()}&rdquo;.
            </li>
          )}
          {results.map((p, i) => {
            const owner = OWNERS.find((o) => o.id === p.owner);
            return (
              <li key={p.id}>
                <Link
                  href={`/patients/${p.id}`}
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`flex min-h-14 items-center justify-between gap-3 rounded-lg px-3 py-2 ${
                    i === active ? "bg-brand-50" : "hover:bg-slate-50"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-slate-900">{p.name}</span>
                    <span className="block truncate text-sm text-slate-600">
                      {p.species} &middot; {p.breed} &middot; {owner?.name}
                    </span>
                  </span>
                  {p.alerts.length > 0 && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-red-700 px-2 py-0.5 text-xs font-semibold text-white">
                      <TriangleAlert aria-hidden className="size-3.5" />
                      {p.alerts.length} alert{p.alerts.length > 1 ? "s" : ""}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
