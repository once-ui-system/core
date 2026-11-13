"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { event, planner } from "@/lib/data";
import { usePlanner } from "./PlannerProvider";
import s from "./seatwise.module.css";

const dateLabel = new Date(`${event.date}T00:00:00Z`).toLocaleDateString("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const { stats } = usePlanner();
  const links = [
    { href: "/", label: "Plan", note: `${stats.unseated.length} to seat` },
    { href: "/guests", label: "Guests", note: `${stats.attending} attending` },
  ];
  return (
    <div className={s.app}>
      <a className={s.skip} href="#main">
        Skip to content
      </a>
      <header className={s.header}>
        <div className={s.headerInner}>
          <Link href="/" className={s.brand} aria-label="Seatwise, plan">
            <svg className={s.brandMark} viewBox="0 0 32 32" aria-hidden="true">
              <rect width="32" height="32" rx="9" fill="#1f5d4a" />
              <circle cx="16" cy="16" r="5" fill="#fff" />
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <circle
                  key={i}
                  cx={16 + Math.cos((i * Math.PI) / 3 - Math.PI / 2) * 9.5}
                  cy={16 + Math.sin((i * Math.PI) / 3 - Math.PI / 2) * 9.5}
                  r="2.2"
                  fill="#f2c879"
                />
              ))}
            </svg>
            <span>Seatwise</span>
          </Link>
          <div className={s.eventMeta}>
            <span className={s.eventName}>{event.name}</span>
            <span className={s.eventSub}>
              {dateLabel} &middot; {event.venue}
            </span>
          </div>
          <nav className={s.nav} aria-label="Main">
            {links.map((l) => {
              const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={active ? `${s.navLink} ${s.navLinkActive}` : s.navLink}
                  aria-current={active ? "page" : undefined}
                >
                  {l.label}
                  <span className={s.navNote}>{l.note}</span>
                </Link>
              );
            })}
          </nav>
          <div className={s.user}>
            <span className={s.avatar} aria-hidden="true">
              HB
            </span>
            <span className={s.userText}>
              <strong>{planner.name}</strong>
              <span>Wedding planner</span>
            </span>
          </div>
        </div>
      </header>
      <main id="main" className={s.main}>
        {children}
      </main>
    </div>
  );
}
