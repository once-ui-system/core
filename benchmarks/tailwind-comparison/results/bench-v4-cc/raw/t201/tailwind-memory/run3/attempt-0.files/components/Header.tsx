import Link from "next/link";
import { PawPrint } from "lucide-react";
import { PatientSearch } from "@/components/PatientSearch";
import { user } from "@/lib/data";

export function Header() {
  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("");
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Pawpoint, today's schedule">
          <span className="flex size-10 items-center justify-center rounded-xl bg-teal-700 text-white">
            <PawPrint aria-hidden="true" className="size-6" />
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-extrabold tracking-tight text-slate-900">Pawpoint</span>
            <span className="block text-xs text-slate-600">Hillside Veterinary Clinic</span>
          </span>
        </Link>

        <div className="order-3 w-full sm:order-2 sm:w-auto sm:min-w-0 sm:flex-1 sm:max-w-md sm:mx-auto">
          <PatientSearch />
        </div>

        <div className="order-2 ml-auto flex items-center gap-3 sm:order-3 sm:ml-0">
          <div className="hidden text-right leading-tight md:block">
            <p className="text-sm font-semibold text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-600">{user.role}</p>
          </div>
          <span
            role="img"
            aria-label={`${user.name}, ${user.role}`}
            className="flex size-10 items-center justify-center rounded-full bg-slate-800 text-sm font-bold text-white"
          >
            {initials}
          </span>
        </div>
      </div>
    </header>
  );
}
