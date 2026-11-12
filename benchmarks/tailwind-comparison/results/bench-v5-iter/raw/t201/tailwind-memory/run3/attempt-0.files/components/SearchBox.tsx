"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { getOwner, searchPatients } from "@/lib/data";
import { AlertChips, SpeciesIcon } from "@/components/Alerts";

export function SearchBox() {
  const router = useRouter();
  const uid = useId();
  const listId = `${uid}-results`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const results = useMemo(() => searchPatients(query), [query]);
  const showPanel = open && query.trim().length > 0;

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function go(id: string) {
    setOpen(false);
    setQuery("");
    router.push(`/patients/${id}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results.length > 0) {
      e.preventDefault();
      go(results[Math.min(active, results.length - 1)].id);
    }
  }

  return (
    <div ref={rootRef} role="search" className="relative">
      <label htmlFor={`${uid}-input`} className="sr-only">
        Search patients or owners by name
      </label>
      <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-slate-500" />
      <input
        id={`${uid}-input`}
        type="text"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showPanel && results.length > 0 ? `${uid}-opt-${active}` : undefined}
        autoComplete="off"
        value={query}
        placeholder="Find a patient or owner"
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 pl-11 pr-10 text-base placeholder:text-slate-500 focus:border-teal-700 focus:bg-white"
      />
      {query && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setQuery("");
            setOpen(false);
          }}
          className="absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-slate-600 hover:bg-slate-200"
        >
          <X aria-hidden className="size-4" />
        </button>
      )}

      <div
        id={listId}
        role="listbox"
        aria-label="Matching patients"
        hidden={!showPanel}
        className="absolute left-0 right-0 top-full z-40 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl"
      >
        {results.map((p, i) => {
          const owner = getOwner(p.owner);
          return (
            <Link
              key={p.id}
              id={`${uid}-opt-${i}`}
              role="option"
              aria-selected={i === active}
              href={`/patients/${p.id}`}
              onClick={() => {
                setOpen(false);
                setQuery("");
              }}
              onMouseEnter={() => setActive(i)}
              className={`flex items-start gap-3 rounded-xl px-3 py-2.5 ${i === active ? "bg-teal-50" : ""}`}
            >
              <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-teal-100 text-teal-900">
                <SpeciesIcon species={p.species} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-bold">{p.name}</span>
                  <span className="text-sm text-slate-600">
                    {p.species}, {p.breed}
                  </span>
                </span>
                <span className="block text-sm text-slate-600">Owner: {owner.name}</span>
                <AlertChips alerts={p.alerts} className="mt-1.5" />
              </span>
            </Link>
          );
        })}
        {results.length === 0 && (
          <p role="status" className="px-3 py-4 text-sm text-slate-600">
            No patient or owner matches &ldquo;{query.trim()}&rdquo;.
          </p>
        )}
      </div>
    </div>
  );
}
