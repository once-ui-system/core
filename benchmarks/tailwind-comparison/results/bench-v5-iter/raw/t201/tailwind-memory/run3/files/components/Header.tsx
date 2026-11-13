import Link from "next/link";
import { PawPrint } from "lucide-react";
import { CLINIC, TODAY, USER, fmtLongToday } from "@/lib/data";
import { SearchBox } from "@/components/SearchBox";

export function Header() {
  const initials = USER.name
    .split(" ")
    .map((w) => w[0])
    .join("");
  return (
    <header className="sticky top-0 z-30 border-b border-teal-900/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 rounded-lg pr-1">
          <span className="grid size-10 place-items-center rounded-xl bg-teal-700 text-white shadow-sm">
            <PawPrint aria-hidden className="size-6" />
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-extrabold tracking-tight text-teal-900">{CLINIC.product}</span>
            <span className="hidden text-xs font-medium text-slate-600 sm:block">{CLINIC.name}</span>
          </span>
        </Link>

        <div className="order-3 w-full min-w-0 md:order-none md:w-auto md:flex-1 md:max-w-xl">
          <SearchBox />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <p className="hidden text-right text-sm leading-tight lg:block">
            <span className="block font-semibold">{fmtLongToday(TODAY)}</span>
          </p>
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="grid size-10 place-items-center rounded-full bg-teal-100 text-sm font-bold text-teal-900"
            >
              {initials}
            </span>
            <p className="hidden text-sm leading-tight sm:block">
              <span className="block font-semibold">{USER.name}</span>
              <span className="block text-xs text-slate-600">{USER.role}</span>
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
