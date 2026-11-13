"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, PawPrint, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { AlertBadges } from "@/components/alert-badges";
import {
  CLINIC,
  TODAY,
  USER,
  formatLongDate,
  getOwner,
  patients,
} from "@/lib/data";

export function AppHeader() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const go = (id: string) => {
    setOpen(false);
    router.push(`/patients/${id}`);
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <PawPrint className="size-5" aria-hidden />
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-base font-semibold tracking-tight">
              {CLINIC.name}
            </span>
            <span className="block text-xs text-muted-foreground">
              {CLINIC.tagline}
            </span>
          </span>
          <span className="sr-only sm:hidden">Pawpoint home</span>
        </Link>

        <Button
          variant="outline"
          onClick={() => setOpen(true)}
          className="ml-auto h-11 min-w-0 flex-1 justify-start gap-2 px-3 font-normal text-muted-foreground sm:ml-4 sm:max-w-md"
          aria-label="Search patient or owner"
        >
          <Search aria-hidden />
          <span className="truncate">Search patient or owner</span>
          <Kbd className="ml-auto hidden lg:inline-flex">/</Kbd>
        </Button>

        <div className="hidden items-center gap-1 text-sm text-muted-foreground md:ml-auto md:flex">
          <CalendarDays className="size-4" aria-hidden />
          <time dateTime={TODAY}>{formatLongDate(TODAY)}</time>
        </div>

        <div className="flex shrink-0 items-center gap-2.5 md:border-l md:pl-4">
          <Avatar className="size-9">
            <AvatarFallback className="bg-accent text-sm font-semibold text-accent-foreground">
              RL
            </AvatarFallback>
          </Avatar>
          <div className="hidden leading-tight lg:block">
            <p className="text-sm font-medium">{USER.name}</p>
            <p className="text-xs text-muted-foreground">{USER.role}</p>
          </div>
        </div>
      </div>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search patients and owners"
        description="Type a patient or owner name, then choose a result to open the record."
      >
        <CommandInput placeholder="Patient or owner name..." />
        <CommandList className="max-h-[60vh]">
          <CommandEmpty>No patient or owner matches that name.</CommandEmpty>
          <CommandGroup heading="Patients">
            {patients.map((p) => {
              const owner = getOwner(p.owner);
              return (
                <CommandItem
                  key={p.id}
                  value={`${p.name} ${owner?.name ?? ""} ${p.species} ${p.breed}`}
                  onSelect={() => go(p.id)}
                  className="min-h-14 flex-col items-start gap-1"
                >
                  <span className="flex w-full items-baseline gap-2">
                    <span className="font-semibold">{p.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {p.species} · {p.breed}
                    </span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      Owner: {owner?.name}
                    </span>
                  </span>
                  <AlertBadges alerts={p.alerts} />
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
}
