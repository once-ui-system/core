"use client";

import { useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, TriangleAlert } from "lucide-react";
import { getOwner, patients } from "@/lib/data";

export function PatientSearch() {
  const router = useRouter();
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return patients
      .filter((p) => {
        const owner = getOwner(p.owner);
        return p.name.toLowerCase().includes(q) || (owner?.name.toLowerCase().includes(q) ?? false);
      })
      .slice(0, 6);
  }, [query]);

  const showList = open && query.trim().length > 0;

  function go(id: string) {
    setOpen(false);
    setQuery("");
    router.push(`/patients/${id}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      const hit = results[active];
      if (hit) {
        e.preventDefault();
        go(hit.id);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
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
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400"
      />
      <input
        id="patient-search"
        type="search"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && results[active] ? `${listId}-${results[active].id}` : undefined}
        autoComplete="off"
        placeholder="Find a patient or owner"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-3 text-base text-slate-900 placeholder:text-slate-500 focus:bg-white"
      />
      {showList && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Matching patients"
          className="absolute left-0 right-0 top-full z-40 mt-2 max-h-96 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl"
          onMouseDown={(e) => e.preventDefault()}
        >
          {results.length === 0 && (
            <li role="presentation" className="px-3 py-3 text-sm text-slate-600">
              No patient or owner matches &ldquo;{query.trim()}&rdquo;.
            </li>
          )}
          {results.map((p, i) => {
            const owner = getOwner(p.owner);
            return (
              <li
                key={p.id}
                id={`${listId}-${p.id}`}
                role="option"
                aria-selected={i === active}
                onClick={() => go(p.id)}
                onMouseEnter={() => setActive(i)}
                className={`flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 ${
                  i === active ? "bg-teal-50" : ""
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-slate-900">{p.name}</span>
                  <span className="block truncate text-sm text-slate-600">
                    {p.species}, {p.breed} &middot; {owner?.name}
                  </span>
                </span>
                {p.alerts.length > 0 && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                    <TriangleAlert aria-hidden="true" className="size-3.5" />
                    {p.alerts.length} {p.alerts.length === 1 ? "alert" : "alerts"}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
