import Link from "next/link";
import { PawPrint } from "lucide-react";
import { CLINIC, USER } from "@/lib/data";
import { PatientSearch } from "./PatientSearch";

export function AppHeader() {
  const initials = USER.name
    .split(" ")
    .map((n) => n[0])
    .join("");
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-brand-600 text-white">
            <PawPrint aria-hidden className="size-6" />
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-bold tracking-tight text-slate-900">Pawpoint</span>
            <span className="block text-xs text-slate-600">{CLINIC.name}</span>
          </span>
        </Link>
        <div className="order-3 w-full md:order-none md:max-w-md md:flex-1 lg:max-w-lg">
          <PatientSearch />
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden text-right leading-tight sm:block">
            <p className="text-sm font-semibold text-slate-900">{USER.name}</p>
            <p className="text-xs text-slate-600">{USER.role}</p>
          </div>
          <span
            aria-hidden
            className="grid size-11 place-items-center rounded-full bg-slate-800 text-sm font-semibold text-white"
          >
            {initials}
          </span>
        </div>
      </div>
    </header>
  );
}
