import Link from "next/link";

import { brand, nav } from "@/lib/data";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="font-serif text-2xl font-bold tracking-tight text-fg"
        >
          {brand.name}
          <span className="text-brand" aria-hidden="true">
            .
          </span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-6">
          <nav aria-label="Main">
            <ul className="flex items-center gap-1 sm:gap-2">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="rounded-lumen px-2 py-2 text-sm font-medium text-muted transition-colors hover:text-fg sm:px-3"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
