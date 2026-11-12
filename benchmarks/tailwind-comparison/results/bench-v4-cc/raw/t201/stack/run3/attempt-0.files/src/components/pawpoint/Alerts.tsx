export function WarnIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" focusable="false" className="pp-alert-icon">
      <path d="M10 2.2 19 17.8H1L10 2.2Z" fill="currentColor" />
      <path d="M10 7.6v4.4" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10" cy="14.6" r="1.1" fill="#fff" />
    </svg>
  );
}

export function AlertBadges({ alerts, size = "md" }: { alerts: string[]; size?: "sm" | "md" | "lg" }) {
  if (alerts.length === 0) return null;
  return (
    <ul className={`pp-alerts pp-alerts-${size}`} aria-label="Medical alerts">
      {alerts.map((a) => (
        <li key={a} className="pp-alert">
          <WarnIcon />
          <span>
            <span className="pp-vh">Medical alert: </span>
            {a}
          </span>
        </li>
      ))}
    </ul>
  );
}
