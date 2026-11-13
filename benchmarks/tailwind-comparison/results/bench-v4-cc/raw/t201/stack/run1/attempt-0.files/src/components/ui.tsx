import type { Status } from "@/lib/data";
import { statusLabel } from "@/lib/data";

export function WarnIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3 2 21h20L12 3Z" fill="#fff" />
      <path d="M12 9v5.5" stroke="#b42318" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="12" cy="17.6" r="1.4" fill="#b42318" />
    </svg>
  );
}

export function PawIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <ellipse cx="6" cy="10" rx="2.1" ry="2.8" />
      <ellipse cx="10" cy="5.8" rx="2.1" ry="2.8" />
      <ellipse cx="14" cy="5.8" rx="2.1" ry="2.8" />
      <ellipse cx="18" cy="10" rx="2.1" ry="2.8" />
      <path d="M12 11c-3 0-5.5 3-5.5 5.4 0 1.9 1.6 2.6 3 2.3 1-.2 1.6-.5 2.5-.5s1.5.3 2.5.5c1.4.3 3-.4 3-2.3C17.5 14 15 11 12 11Z" />
    </svg>
  );
}

export function AlertList({ alerts, large = false }: { alerts: string[]; large?: boolean }) {
  if (alerts.length === 0) return null;
  return (
    <ul className={`pp-alerts${large ? " lg" : ""}`} aria-label="Medical alerts">
      {alerts.map((a) => (
        <li key={a} className="pp-alert">
          <WarnIcon size={large ? 20 : 16} />
          <span>{a}</span>
        </li>
      ))}
    </ul>
  );
}

export function StatusPill({ status }: { status: Status }) {
  return <span className={`pp-pill pp-pill-${status}`}>{statusLabel[status]}</span>;
}
