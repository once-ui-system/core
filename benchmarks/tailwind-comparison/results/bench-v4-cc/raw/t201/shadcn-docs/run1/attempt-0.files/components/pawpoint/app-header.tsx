"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PawPrint, Search, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CLINIC_NAME, PATIENTS, USER, ownerById } from "@/lib/data";

export function AppHeader() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const initials = USER.name
    .split(" ")
    .map((p) => p[0])
    .join("");

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <PawPrint className="size-5" aria-hidden="true" />
          </span>
          <span className="leading-tight">
            <span className="block text-base font-semibold tracking-tight">Pawpoint</span>
            <span className="hidden text-xs text-muted-foreground sm:block">{CLINIC_NAME}</span>
          </span>
        </Link>

        <div className="ml-auto flex min-w-0 flex-1 justify-end sm:justify-center">
          <Button
            variant="outline"
            onClick={() => setOpen(true)}
            className="h-11 w-11 justify-center gap-2 px-0 text-muted-foreground sm:w-full sm:max-w-md sm:justify-start sm:px-3"
            aria-label="Search patients or owners"
          >
            <Search aria-hidden="true" />
            <span className="hidden sm:inline">Search patient or owner</span>
            <kbd className="ml-auto hidden rounded border bg-muted px-1.5 py-0.5 font-sans text-[11px] md:inline">Ctrl K</kbd>
          </Button>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden text-right leading-tight md:block">
            <p className="text-sm font-medium">{USER.name}</p>
            <p className="text-xs text-muted-foreground">{USER.role}</p>
          </div>
          <span
            className="flex size-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground"
            role="img"
            aria-label={`${USER.name}, ${USER.role}`}
          >
            {initials}
          </span>
        </div>
      </div>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Find a patient"
        description="Search by patient name or owner name, then open the record."
      >
        <CommandInput placeholder="Patient or owner name" />
        <CommandList>
          <CommandEmpty>No patient or owner found.</CommandEmpty>
          <CommandGroup heading="Patients">
            {PATIENTS.map((p) => {
              const owner = ownerById(p.owner);
              return (
                <CommandItem
                  key={p.id}
                  value={`${p.name} ${owner.name} ${p.species} ${p.breed} ${p.id}`}
                  onSelect={() => {
                    setOpen(false);
                    router.push(`/patients/${p.id}`);
                  }}
                  className="items-start"
                >
                  <PawPrint aria-hidden="true" className="mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {p.name}{" "}
                      <span className="font-normal text-muted-foreground">
                        {p.species}, {p.breed}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">Owner: {owner.name}</p>
                    {p.alerts.length > 0 && (
                      <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-red-700">
                        <TriangleAlert className="size-3.5 !text-red-600" aria-hidden="true" />
                        <span className="sr-only">Medical alert: </span>
                        {p.alerts.join(" / ")}
                      </p>
                    )}
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
}
