"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Armchair, LayoutGrid, Users } from "lucide-react";
import { appName, event, formatDate, initials, planner } from "@/lib/data";

const nav = [
  { href: "/", label: "Plan", icon: LayoutGrid },
  { href: "/guests", label: "Guests", icon: Users },
];

export default function AppHeader() {
  const pathname = usePathname();
  return (
    <header className="border-b border-stone-200 bg-white print:hidden">
      <div className="mx-auto flex w-full max-w-[1500px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 rounded-lg">
          <span className="grid size-9 place-items-center rounded-xl bg-teal-700 text-white">
            <Armchair className="size-5" aria-hidden />
          </span>
          <span className="text-lg font-semibold tracking-tight text-stone-900">{appName}</span>
        </Link>

        <nav aria-label="Main" className="order-last flex w-full gap-1 sm:order-none sm:w-auto">
          {nav.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium sm:flex-none ${
                  active ? "bg-teal-50 text-teal-800" : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                <Icon className="size-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden text-right text-sm lg:block">
          <p className="font-medium text-stone-900">{event.name}</p>
          <p className="text-stone-500">
            {formatDate(event.date)} · {event.venue}
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <span
            aria-hidden
            className="grid size-9 place-items-center rounded-full bg-stone-800 text-xs font-semibold text-white"
          >
            {initials(planner.name)}
          </span>
          <span className="hidden text-sm font-medium text-stone-700 sm:inline">{planner.name}</span>
        </div>
      </div>
    </header>
  );
}
