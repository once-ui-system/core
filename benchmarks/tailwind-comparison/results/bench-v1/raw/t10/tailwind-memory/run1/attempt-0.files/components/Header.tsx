import Link from "next/link";
import { Home as HomeIcon } from "lucide-react";
import { CITY } from "@/lib/data";

export function Header() {
  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md font-semibold tracking-tight text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-teal-700 text-white">
            <HomeIcon className="size-4" aria-hidden="true" />
          </span>
          Haven
        </Link>
        <span className="text-sm text-stone-600">Homes in {CITY}</span>
      </div>
    </header>
  );
}
