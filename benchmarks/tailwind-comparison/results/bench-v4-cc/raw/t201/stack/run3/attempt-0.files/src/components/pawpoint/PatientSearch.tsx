"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PATIENTS, ownerOf } from "@/lib/data";
import { AlertBadges } from "./Alerts";

function norm(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export default function PatientSearch() {
  const router = useRouter();
  const id = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return [];
    return PATIENTS.filter((p) => {
      const o = ownerOf(p.owner);
      return [p.name, o?.name ?? "", p.species, p.breed].some((t) => norm(t).includes(q));
    });
  }, [query]);

  useEffect(() => {
    function onDown(e: PointerEvent) {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  const showing = open && query.trim().length > 0;

  return (
    <div className="pp-search" ref={box} role="search">
      <label htmlFor={`${id}-q`} className="pp-vh">
        Search patients or owners
      </label>
      <svg className="pp-search-icon" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">
        <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="m13 13 4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        id={`${id}-q`}
        type="search"
        autoComplete="off"
        placeholder="Find a patient or owner"
        value={query}
        aria-controls={`${id}-results`}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
          } else if (e.key === "Enter" && results.length > 0) {
            e.preventDefault();
            setOpen(false);
            router.push(`/patients/${results[0].id}`);
          }
        }}
      />
      <div className="pp-vh" role="status" aria-live="polite">
        {showing ? `${results.length} ${results.length === 1 ? "match" : "matches"}` : ""}
      </div>
      {showing && (
        <div className="pp-results" id={`${id}-results`}>
          {results.length === 0 ? (
            <p className="pp-results-empty">No patient or owner matches “{query.trim()}”.</p>
          ) : (
            <ul>
              {results.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/patients/${p.id}`}
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <span className="pp-result-name">{p.name}</span>
                    <span className="pp-result-meta">
                      {p.species}, {p.breed} · {ownerOf(p.owner)?.name}
                    </span>
                    <AlertBadges alerts={p.alerts} size="sm" />
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
