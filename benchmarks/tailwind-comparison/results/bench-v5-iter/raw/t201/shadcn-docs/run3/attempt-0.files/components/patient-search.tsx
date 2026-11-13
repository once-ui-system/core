"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { getOwner, patients } from "@/lib/data";

export function PatientSearch() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function go(id: string) {
    setOpen(false);
    router.push(`/patients/${id}`);
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-11 min-w-0 flex-1 justify-start gap-2 px-3 font-normal text-muted-foreground sm:max-w-md"
      >
        <Search aria-hidden />
        <span className="truncate">Search patient or owner</span>
        <kbd className="pointer-events-none ml-auto hidden rounded border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground md:inline">
          Ctrl K
        </kbd>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search patients and owners"
        description="Type a pet or owner name, then choose a result to open the record."
      >
        <CommandInput placeholder="Pet or owner name" />
        <CommandList className="max-h-[min(60vh,420px)]">
          <CommandEmpty>No patient or owner matches that name.</CommandEmpty>
          <CommandGroup heading="Patients">
            {patients.map((p) => {
              const owner = getOwner(p.owner);
              return (
                <CommandItem
                  key={p.id}
                  value={`${p.name} ${owner.name} ${p.id}`}
                  keywords={[p.species, p.breed, owner.phone]}
                  onSelect={() => go(p.id)}
                  className="items-start gap-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {p.name}
                      <span className="ml-2 font-normal text-muted-foreground">
                        {p.species} · {p.breed}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">Owner: {owner.name}</p>
                  </div>
                  {p.alerts.length > 0 && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-red-700 px-2 py-1 text-xs font-semibold text-white">
                      <TriangleAlert aria-hidden className="size-3.5 !text-white" />
                      {p.alerts.length === 1 ? "1 alert" : `${p.alerts.length} alerts`}
                    </span>
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
