"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Command as CommandPrimitive } from "cmdk";
import { SearchIcon } from "lucide-react";
import { AlertChips } from "@/components/alerts";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { getOwner, searchPatients } from "@/lib/data";

export function PatientSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const results = useMemo(() => searchPatients(query), [query]);
  const showResults = open && query.trim().length > 0;

  function openRecord(id: string) {
    setOpen(false);
    setQuery("");
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    router.push(`/patients/${id}`);
  }

  return (
    <div
      className="relative"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setOpen(false);
          setQuery("");
        }
      }}
    >
      <Command shouldFilter={false} loop className="h-auto overflow-visible bg-transparent">
        <div className="relative">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <CommandPrimitive.Input
            value={query}
            onValueChange={(v) => {
              setQuery(v);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            aria-label="Search patients or owners"
            placeholder="Search patient or owner"
            className="h-11 w-full rounded-lg border border-input bg-card pr-3 pl-11 text-base shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>
        {showResults && (
          <div
            className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-xl border bg-popover shadow-lg"
            onMouseDown={(e) => e.preventDefault()}
          >
            {results.length === 0 ? (
              <p role="status" className="px-4 py-6 text-center text-sm text-muted-foreground">
                No patient or owner matches &ldquo;{query.trim()}&rdquo;.
              </p>
            ) : (
              <CommandList className="max-h-[60dvh]">
                <CommandGroup heading={`Patients (${results.length})`}>
                  {results.map((p) => {
                    const owner = getOwner(p.owner);
                    return (
                      <CommandItem
                        key={p.id}
                        value={p.id}
                        onSelect={() => openRecord(p.id)}
                        className="min-h-14 flex-col items-start gap-1 py-2.5"
                      >
                        <span className="flex w-full items-baseline gap-2">
                          <span className="text-base font-semibold">{p.name}</span>
                          <span className="truncate text-sm text-muted-foreground">
                            {p.species} &middot; {p.breed}
                          </span>
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Owner: {owner?.name ?? "Unknown"}
                        </span>
                        <AlertChips alerts={p.alerts} />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            )}
          </div>
        )}
      </Command>
    </div>
  );
}
