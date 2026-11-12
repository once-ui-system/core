import Link from "next/link";
import { PawPrint } from "lucide-react";
import { clinic, user } from "@/lib/data";
import { PatientSearch } from "@/components/PatientSearch";

export function Header() {
  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("");
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6 md:flex-nowrap">
        <Link href="/" className="flex min-h-11 items-center gap-2.5 rounded-lg pr-2" aria-label="Pawpoint, today's schedule">
          <span className="grid size-9 place-items-center rounded-xl bg-teal-700 text-white">
            <PawPrint className="size-5" aria-hidden />
          </span>
          <span className="leading-tight">
            <span className="block text-base font-bold tracking-tight">{clinic.name}</span>
            <span className="hidden text-xs text-stone-500 sm:block">{clinic.tagline}</span>
          </span>
        </Link>

        <div className="order-last w-full md:order-none md:max-w-xl md:flex-1">
          <PatientSearch />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden text-right leading-tight md:block">
            <p className="text-sm font-semibold">{user.name}</p>
            <p className="text-xs text-stone-500">{user.role}</p>
          </div>
          <span
            className="grid size-10 place-items-center rounded-full bg-stone-800 text-sm font-semibold text-white"
            role="img"
            aria-label={`${user.name}, ${user.role}`}
          >
            {initials}
          </span>
        </div>
      </div>
    </header>
  );
}
