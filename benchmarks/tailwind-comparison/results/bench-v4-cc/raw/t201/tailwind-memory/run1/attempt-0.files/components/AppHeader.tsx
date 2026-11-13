import Link from "next/link";
import { PawPrint } from "lucide-react";
import PatientSearch from "@/components/PatientSearch";
import { CLINIC_NAME, CLINIC_SUBTITLE, USER } from "@/lib/data";
import { initials } from "@/lib/format";

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 rounded-lg" aria-label={`${CLINIC_NAME} home, today's schedule`}>
          <span className="grid size-11 place-items-center rounded-xl bg-teal-700 text-white">
            <PawPrint aria-hidden className="size-6" />
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-bold tracking-tight text-slate-900">{CLINIC_NAME}</span>
            <span className="block text-xs text-slate-600">{CLINIC_SUBTITLE}</span>
          </span>
        </Link>

        <div className="order-last w-full md:order-none md:max-w-xl md:flex-1">
          <PatientSearch />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden text-right leading-tight sm:block">
            <p className="text-sm font-semibold text-slate-900">{USER.name}</p>
            <p className="text-xs text-slate-600">{USER.role}</p>
          </div>
          <span
            aria-label={`${USER.name}, ${USER.role}`}
            role="img"
            className="grid size-10 place-items-center rounded-full bg-slate-800 text-sm font-semibold text-white"
          >
            {initials(USER.name)}
          </span>
        </div>
      </div>
    </header>
  );
}
