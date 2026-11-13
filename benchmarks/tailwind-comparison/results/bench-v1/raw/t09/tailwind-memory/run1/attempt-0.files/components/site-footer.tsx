import Link from "next/link";

import { brand, nav } from "@/lib/data";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-serif text-xl font-bold">{brand.name}</p>
          <p className="mt-1 max-w-sm text-sm text-muted">
            Analytics and issue tracking for small software teams.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-muted transition-colors hover:text-link"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="text-sm text-muted">
          © 2025 {brand.name}. Data stored in the EU.
        </p>
      </div>
    </footer>
  );
}
