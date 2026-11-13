"use client";

import { useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, TriangleAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ownerById, patients } from "@/lib/data";
import { cn } from "@/lib/utils";

export function PatientSearch({ className }: { className?: string }) {
  const router = useRouter();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return patients
      .map((p) => ({ patient: p, owner: ownerById(p.owner) }))
      .filter(({ patient, owner }) =>
        [patient.name, owner.name, patient.species, patient.breed].some((s) => s.toLowerCase().includes(q)),
      );
  }, [query]);

  const showList = open && query.trim().length > 0;

  function go(id: string) {
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
    router.push(`/patients/${id}`);
  }

  return (
    <div
      className={cn("relative", className)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Input
        ref={inputRef}
        type="search"
        role="combobox"
        aria-label="Search patients or owners"
        aria-expanded={showList}
        aria-controls={showList ? listId : undefined}
        aria-autocomplete="list"
        aria-activedescendant={showList && results[active] ? `${listId}-${results[active].patient.id}` : undefined}
        placeholder="Search patient or owner"
        autoComplete="off"
        className="h-11 bg-card pl-9 text-base md:text-sm"
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
            setOpen(true);
            setActive((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
          } else if (e.key === "Enter" && showList && results[active]) {
            e.preventDefault();
            go(results[active].patient.id);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {showList && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Matching patients"
          className="absolute top-full right-0 left-0 z-50 mt-1.5 max-h-[60vh] overflow-auto rounded-xl border bg-popover p-1 shadow-lg"
        >
          {results.length === 0 && (
            <li role="presentation" className="px-3 py-4 text-sm text-muted-foreground">
              No patient or owner matches “{query.trim()}”.
            </li>
          )}
          {results.map(({ patient, owner }, i) => (
            <li
              key={patient.id}
              id={`${listId}-${patient.id}`}
              role="option"
              aria-selected={i === active}
              tabIndex={-1}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => go(patient.id)}
              className={cn(
                "flex min-h-12 cursor-pointer items-center gap-3 rounded-lg px-3 py-2",
                i === active && "bg-accent",
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2">
                  <span className="font-semibold">{patient.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {patient.species} · {patient.breed}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">Owner: {owner.name}</div>
              </div>
              {patient.alerts.length > 0 && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-red-700 px-2 py-0.5 text-xs font-semibold text-white">
                  <TriangleAlert className="size-3.5" aria-hidden />
                  {patient.alerts.length === 1 ? "Alert" : `${patient.alerts.length} alerts`}
                  <span className="sr-only">: {patient.alerts.join("; ")}</span>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
