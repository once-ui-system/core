"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CircleCheck, PawPrint, Search, X } from "lucide-react";
import { CLINIC, OWNERS, PATIENTS, PRODUCT, USER, getOwner } from "@/lib/data";
import { useClinic } from "@/lib/store";
import { AlertChips } from "./AlertChips";

function PatientSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return PATIENTS.filter((p) => {
      const owner = OWNERS.find((o) => o.id === p.owner);
      return p.name.toLowerCase().includes(term) || (owner?.name.toLowerCase().includes(term) ?? false);
    });
  }, [q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT");
      if (e.key === "/" && !typing) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (id: string) => {
    setQ("");
    setOpen(false);
    router.push(`/patients/${id}`);
  };
  const showPanel = open && q.trim().length > 0;

  return (
    <div
      ref={wrap}
      role="search"
      className="relative w-full"
      onBlur={(e) => {
        if (!wrap.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <label htmlFor={`${listId}-input`} className="sr-only">
        Find a patient or owner
      </label>
      <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
      <input
        ref={input}
        id={`${listId}-input`}
        type="search"
        value={q}
        autoComplete="off"
        placeholder="Find a patient or owner"
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setQ("");
            setOpen(false);
          }
          if (e.key === "Enter" && results[0]) go(results[0].id);
        }}
        className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 pl-11 pr-14 text-base text-slate-900 placeholder:text-slate-500 hover:border-slate-400 focus:border-teal-700 focus:bg-white md:h-11"
      />
      <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-slate-300 bg-white px-1.5 text-xs font-medium text-slate-500 lg:block">/</kbd>
      <div id={listId} className={showPanel ? "absolute inset-x-0 top-full z-40 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10" : "hidden"}>
        {showPanel && (
          <>
            <p className="sr-only" role="status">
              {results.length} {results.length === 1 ? "match" : "matches"}
            </p>
            {results.length === 0 ? (
              <p className="px-4 py-3 text-sm text-slate-600">No patient or owner matches “{q.trim()}”.</p>
            ) : (
              <ul className="max-h-[60vh] divide-y divide-slate-100 overflow-y-auto">
                {results.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/patients/${p.id}`}
                      onClick={() => {
                        setQ("");
                        setOpen(false);
                      }}
                      className="block px-4 py-3 hover:bg-teal-50 focus-visible:bg-teal-50"
                    >
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="text-base font-semibold text-slate-900">{p.name}</span>
                        <span className="text-sm text-slate-600">{p.species} · {p.breed}</span>
                      </span>
                      <span className="block text-sm text-slate-600">Owner: {getOwner(p.owner).name}</span>
                      <AlertChips alerts={p.alerts} className="mt-1.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Toast() {
  const { notice, dismissNotice } = useClinic();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4" role="status" aria-live="polite">
      {notice && (
        <div className="pointer-events-auto flex items-center gap-3 rounded-xl bg-slate-900 py-3 pl-4 pr-2 text-sm font-medium text-white shadow-xl">
          <CircleCheck aria-hidden className="size-5 shrink-0 text-emerald-400" />
          <span>{notice}</span>
          <button type="button" onClick={dismissNotice} aria-label="Dismiss message" className="grid size-9 place-items-center rounded-lg hover:bg-white/10">
            <X aria-hidden className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const onSchedule = path === "/";
  const initials = USER.name.split(" ").map((s) => s[0]).join("");
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:shadow-lg">
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 md:flex-nowrap md:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2.5 rounded-lg pr-1">
            <span className="grid size-10 place-items-center rounded-xl bg-teal-700 text-white">
              <PawPrint aria-hidden className="size-6" />
            </span>
            <span className="leading-tight">
              <span className="block text-lg font-bold tracking-tight text-slate-900">{PRODUCT}</span>
              <span className="hidden text-xs text-slate-600 sm:block">{CLINIC}</span>
            </span>
          </Link>
          <nav aria-label="Main" className="ml-1 hidden md:block">
            <Link
              href="/"
              aria-current={onSchedule ? "page" : undefined}
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${onSchedule ? "bg-teal-50 text-teal-800" : "text-slate-600 hover:bg-slate-100"}`}
            >
              Schedule
            </Link>
          </nav>
          <div className="order-last w-full md:order-none md:mx-auto md:max-w-md md:flex-1">
            <PatientSearch />
          </div>
          <div className="ml-auto flex items-center gap-3 md:ml-0">
            <div className="hidden text-right leading-tight lg:block">
              <p className="text-sm font-semibold text-slate-900">{USER.name}</p>
              <p className="text-xs text-slate-600">{USER.role}</p>
            </div>
            <span aria-hidden className="grid size-10 place-items-center rounded-full bg-slate-800 text-sm font-semibold text-white">
              {initials}
            </span>
            <span className="sr-only">{USER.name}, {USER.role}</span>
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-7xl px-4 pb-24 pt-5 md:px-6 md:pt-7">
        {children}
      </main>
      <Toast />
    </>
  );
}
