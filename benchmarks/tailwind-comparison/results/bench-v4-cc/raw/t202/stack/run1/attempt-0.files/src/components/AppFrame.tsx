"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { APP, EVENT, PLANNER } from "@/lib/data";
import { formatDate } from "@/lib/plan";

const NAV = [
  { href: "/", label: "Seating plan" },
  { href: "/guests", label: "Guest list" },
];

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="sw-app">
      <a className="sw-skip" href="#main">
        Skip to content
      </a>
      <header className="sw-header">
        <div className="sw-header-inner">
          <Link href="/" className="sw-brand" aria-label={`${APP} home`}>
            <span className="sw-mark" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span>{APP}</span>
          </Link>
          <nav aria-label="Main" className="sw-nav">
            {NAV.map((n) => {
              const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
              return (
                <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined} className="sw-navlink">
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="sw-event">
            <strong>{EVENT.name}</strong>
            <span>
              {formatDate(EVENT.date)} · {EVENT.venue}
            </span>
          </div>
          <div className="sw-user" title={PLANNER.name}>
            <span className="sw-avatar" aria-hidden="true">
              HB
            </span>
            <span className="sw-user-name">{PLANNER.name}</span>
          </div>
        </div>
      </header>
      <main id="main" className="sw-main">
        {children}
      </main>
    </div>
  );
}
