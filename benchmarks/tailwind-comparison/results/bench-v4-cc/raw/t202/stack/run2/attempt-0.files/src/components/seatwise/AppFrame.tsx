"use client";

import "./seatwise.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { EVENT, PLANNER, APP } from "@/lib/data";
import { usePlan } from "@/lib/plan";

const dateLabel = new Date(`${EVENT.date}T12:00:00Z`).toLocaleDateString("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const plan = usePlan();
  const { stats, brokenCount, heldId, hold } = plan;

  useEffect(() => {
    if (!heldId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") hold(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [heldId, hold]);

  const initials = PLANNER.name
    .split(" ")
    .map((p) => p[0])
    .join("");

  return (
    <div className="sw-app">
      <header className="sw-top">
        <div className="sw-top-in">
          <Link href="/" className="sw-brand">
            <span className="sw-logo" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="12" cy="12" r="4.5" />
                <circle cx="12" cy="3.5" r="1.4" fill="currentColor" />
                <circle cx="12" cy="20.5" r="1.4" fill="currentColor" />
                <circle cx="3.5" cy="12" r="1.4" fill="currentColor" />
                <circle cx="20.5" cy="12" r="1.4" fill="currentColor" />
              </svg>
            </span>
            {APP}
          </Link>
          <div className="sw-event">
            <strong>{EVENT.name}</strong>
            <span>
              {dateLabel} · {EVENT.venue}
            </span>
          </div>
          <nav className="sw-nav" aria-label="Main">
            <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>
              Seating plan
            </Link>
            <Link href="/guests" aria-current={pathname === "/guests" ? "page" : undefined}>
              Guest list
            </Link>
          </nav>
          <div className="sw-planner">
            <span className="sw-avatar" aria-hidden="true">
              {initials}
            </span>
            <span>
              Planner
              <br />
              <b style={{ color: "var(--ink)" }}>{PLANNER.name}</b>
            </span>
          </div>
        </div>
      </header>
      <div className="sw-wrap">
        <dl className="sw-stats" aria-label="Seating totals">
          <div className="sw-stat">
            <dt>Seated</dt>
            <dd>
              {stats.seated} <small>of {stats.attending} attending</small>
            </dd>
          </div>
          <div className={`sw-stat ${stats.unseatedAttending === 0 ? "is-good" : ""}`}>
            <dt>Still to seat</dt>
            <dd>{stats.unseatedAttending}</dd>
          </div>
          <div className="sw-stat">
            <dt>Free seats</dt>
            <dd>
              {stats.freeSeats} <small>of {stats.totalSeats}</small>
            </dd>
          </div>
          <div className={`sw-stat ${brokenCount > 0 ? "is-bad" : "is-good"}`}>
            <dt>Couple's rules</dt>
            <dd>{brokenCount === 0 ? "All kept" : `${brokenCount} broken`}</dd>
          </div>
        </dl>
        {children}
      </div>
    </div>
  );
}
