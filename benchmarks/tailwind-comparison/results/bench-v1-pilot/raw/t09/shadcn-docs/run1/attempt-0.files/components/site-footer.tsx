import Link from "next/link";

import { Separator } from "@/components/ui/separator";
import { brand, footerLinks } from "@/lib/data";

export function SiteFooter() {
  return (
    <footer className="border-t bg-card/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="font-serif text-2xl font-bold">
              {brand.name}
              <span className="text-primary" aria-hidden="true">
                .
              </span>
            </p>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              {brand.tagline}.
            </p>
          </div>
          {footerLinks.map((group) => (
            <nav key={group.heading} aria-label={group.heading}>
              <h2 className="font-sans text-sm font-semibold">
                {group.heading}
              </h2>
              <ul className="mt-3 space-y-2 text-sm">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="rounded-sm text-muted-foreground outline-none hover:text-primary hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <Separator className="my-8" />
        <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2025 Lumen. All rights reserved.</p>
          <p>Your data stays in the EU, encrypted at rest.</p>
        </div>
      </div>
    </footer>
  );
}
