"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import "./pawpoint.css";
import { ownerById, patients, user, formatLongDate, today } from "@/lib/data";
import { AlertList, PawIcon } from "./ui";

function Search() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return patients.filter((p) => p.name.toLowerCase().includes(t) || ownerById(p.owner).name.toLowerCase().includes(t));
  }, [q]);

  const close = () => {
    setOpen(false);
  };

  return (
    <div
      className="pp-search"
      ref={box}
      role="search"
      onBlur={(e) => {
        if (!box.current?.contains(e.relatedTarget as Node | null)) close();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") close();
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        type="search"
        value={q}
        placeholder="Find a patient or owner"
        aria-label="Find a patient or owner by name"
        autoComplete="off"
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && matches[0]) {
            router.push(`/patients/${matches[0].id}`);
            setQ("");
            close();
          }
        }}
      />
      <p className="sr-only" role="status" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
        {q.trim() ? `${matches.length} ${matches.length === 1 ? "match" : "matches"}` : ""}
      </p>
      {open && q.trim() && (
        <div className="pp-results">
          {matches.length === 0 ? (
            <p className="pp-none">No patient or owner matches “{q.trim()}”.</p>
          ) : (
            <ul>
              {matches.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/patients/${p.id}`}
                    onClick={() => {
                      setQ("");
                      close();
                    }}
                  >
                    <b>{p.name}</b>
                    <small>
                      {p.species} · {ownerById(p.owner).name}
                    </small>
                    <AlertList alerts={p.alerts} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("");
  return (
    <div className="pp">
      <a className="pp-skip" href="#main">
        Skip to content
      </a>
      <header className="pp-header">
        <div className="pp-header-in">
          <Link href="/" className="pp-brand" aria-label="Pawpoint, today's schedule">
            <span className="pp-logo">
              <PawIcon />
            </span>
            <span>
              <b>Pawpoint</b>
              <small>Hillside Veterinary Clinic</small>
            </span>
          </Link>
          <Search />
          <div className="pp-me">
            <div>
              <b>{user.name}</b>
              <span>{user.role}</span>
            </div>
            <span className="pp-avatar" aria-hidden="true">
              {initials}
            </span>
          </div>
        </div>
      </header>
      <main id="main" className="pp-main">
        {children}
      </main>
      <p style={{ display: "none" }}>{formatLongDate(today)}</p>
    </div>
  );
}
