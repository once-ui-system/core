"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PawPrint, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AlertBadges } from "@/components/alert-badges";
import { clinic, clinicTagline, getOwner, patients, user } from "@/lib/data";

function PatientSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();

  const results = useMemo(() => {
    if (!term) return [];
    return patients.filter((p) => {
      const owner = getOwner(p.owner);
      return p.name.toLowerCase().includes(term) || (owner?.name.toLowerCase().includes(term) ?? false);
    });
  }, [term]);

  return (
    <div
      className="relative w-full sm:max-w-md"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setQ("");
      }}
    >
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (results[0]) {
            router.push(`/patients/${results[0].id}`);
            setQ("");
          }
        }}
      >
        <label htmlFor="patient-search" className="sr-only">
          Find a patient or owner by name
        </label>
        <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="patient-search"
          type="search"
          autoComplete="off"
          placeholder="Find a patient or owner"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setQ("");
          }}
          className="h-11 bg-background pr-10 pl-9 text-base"
        />
        {q && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setQ("")}
            className="absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
          >
            <X aria-hidden className="size-4" />
          </button>
        )}
      </form>
      <p className="sr-only" role="status">
        {term ? `${results.length} ${results.length === 1 ? "match" : "matches"}` : ""}
      </p>
      {term && (
        <div className="absolute inset-x-0 top-full z-40 mt-1.5 overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">No patient or owner matches “{q.trim()}”.</p>
          ) : (
            <ul className="max-h-[60vh] divide-y overflow-y-auto">
              {results.map((p) => {
                const owner = getOwner(p.owner);
                return (
                  <li key={p.id}>
                    <Link
                      href={`/patients/${p.id}`}
                      onClick={() => setQ("")}
                      className="flex flex-col gap-1.5 px-4 py-3 outline-none hover:bg-accent focus-visible:bg-accent"
                    >
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="font-medium">{p.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {p.species} · {p.breed}
                        </span>
                      </span>
                      <span className="text-sm text-muted-foreground">Owner: {owner?.name}</span>
                      <AlertBadges alerts={p.alerts} />
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

export function AppShell({ children }: { children: React.ReactNode }) {
  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("");
  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
            <span className="flex size-10 items-center justify-center rounded-xl bg-teal-700 text-white">
              <PawPrint aria-hidden className="size-5" />
            </span>
            <span className="leading-tight">
              <span className="block text-base font-semibold tracking-tight">{clinic}</span>
              <span className="block text-xs text-muted-foreground">{clinicTagline}</span>
            </span>
          </Link>
          <div className="order-last w-full sm:order-none sm:ml-auto sm:w-auto sm:flex-1 sm:max-w-md">
            <PatientSearch />
          </div>
          <div className="ml-auto flex items-center gap-3 sm:ml-0">
            <div className="hidden text-right leading-tight md:block">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
            <span
              aria-label={`${user.name}, ${user.role}`}
              role="img"
              className="flex size-10 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-900 dark:bg-teal-900 dark:text-teal-100"
            >
              {initials}
            </span>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7">{children}</main>
    </div>
  );
}
