import Link from "next/link";
import "./pawpoint.css";
import { CLINIC, USER } from "@/lib/data";
import PatientSearch from "./PatientSearch";

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
}

export default function Shell({ children, current }: { children: React.ReactNode; current: "schedule" | "patient" }) {
  return (
    <div className="pp-app">
      <a href="#main" className="pp-skip">
        Skip to content
      </a>
      <header className="pp-header">
        <div className="pp-header-in">
          <Link href="/" className="pp-brand" aria-label="Pawpoint, today's schedule">
            <svg viewBox="0 0 32 32" width="34" height="34" aria-hidden="true" focusable="false">
              <rect width="32" height="32" rx="9" fill="#0f766e" />
              <ellipse cx="16" cy="20.5" rx="6" ry="5" fill="#fff" />
              <circle cx="8.8" cy="14.5" r="2.5" fill="#fff" />
              <circle cx="13" cy="9.8" r="2.5" fill="#fff" />
              <circle cx="19" cy="9.8" r="2.5" fill="#fff" />
              <circle cx="23.2" cy="14.5" r="2.5" fill="#fff" />
            </svg>
            <span className="pp-brand-text">
              <strong>Pawpoint</strong>
              <span>{CLINIC}</span>
            </span>
          </Link>
          <nav className="pp-nav" aria-label="Main">
            <Link href="/" aria-current={current === "schedule" ? "page" : undefined}>
              Schedule
            </Link>
            {current === "patient" && (
              <span className="pp-nav-here" aria-current="page">
                Patient record
              </span>
            )}
          </nav>
          <PatientSearch />
          <div className="pp-user">
            <span className="pp-avatar" aria-hidden="true">
              {initials(USER.name)}
            </span>
            <span className="pp-user-text">
              <strong>{USER.name}</strong>
              <span>{USER.role}</span>
            </span>
          </div>
        </div>
      </header>
      <main id="main" className="pp-page">
        {children}
      </main>
    </div>
  );
}
