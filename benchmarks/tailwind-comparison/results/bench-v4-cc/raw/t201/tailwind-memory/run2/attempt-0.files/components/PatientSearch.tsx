"use client";

import { useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, TriangleAlert } from "lucide-react";
import { getOwner, patients } from "@/lib/data";
import { cx } from "@/lib/cx";

export function PatientSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return patients
      .filter((p) => p.name.toLowerCase().includes(s) || getOwner(p.owner).name.toLowerCase().includes(s))
      .slice(0, 8);
  }, [q]);

  const showList = open && q.trim().length > 0;

  function go(id: string) {
    setOpen(false);
    setQ("");
    inputRef.current?.blur();
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
      if (showList && hit) {
        e.preventDefault();
        go(hit.id);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div
      className="relative"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <label htmlFor="patient-search" className="sr-only">
        Find a patient or owner
      </label>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-stone-500" aria-hidden />
      <input
        ref={inputRef}
        id="patient-search"
        type="search"
        role="combobox"
        autoComplete="off"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && results[active] ? `${listId}-${results[active].id}` : undefined}
        placeholder="Find a patient or owner"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className="h-11 w-full rounded-xl border border-stone-300 bg-stone-50 pl-11 pr-3 text-base placeholder:text-stone-500 focus:border-teal-600 focus:bg-white"
      />
      {showList && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Matching patients"
          onMouseDown={(e) => e.preventDefault()}
          className="absolute inset-x-0 top-full z-40 mt-2 max-h-[70dvh] overflow-auto rounded-xl border border-stone-200 bg-white p-1.5 shadow-xl"
        >
          {results.length === 0 && <li className="px-3 py-3 text-sm text-stone-600">No patient or owner matches &ldquo;{q.trim()}&rdquo;.</li>}
          {results.map((p, i) => {
            const owner = getOwner(p.owner);
            return (
              <li
                key={p.id}
                id={`${listId}-${p.id}`}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(p.id)}
                className={cx("cursor-pointer rounded-lg px-3 py-2.5", i === active && "bg-teal-50")}
              >
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-semibold">{p.name}</span>
                  <span className="text-sm text-stone-600">
                    {p.species}, {p.breed}
                  </span>
                </div>
                <div className="text-sm text-stone-600">Owner: {owner.name}</div>
                {p.alerts.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {p.alerts.map((a) => (
                      <span key={a} className="inline-flex items-center gap-1 rounded bg-red-700 px-1.5 py-0.5 text-xs font-bold text-white">
                        <TriangleAlert className="size-3" aria-hidden />
                        <span className="sr-only">Medical alert: </span>
                        {a}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
