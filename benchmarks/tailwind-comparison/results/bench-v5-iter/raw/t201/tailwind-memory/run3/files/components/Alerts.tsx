import { Bird, Cat, Dog, PawPrint, Rabbit, TriangleAlert } from "lucide-react";

/** Compact red chips used wherever a patient appears in a list. */
export function AlertChips({ alerts, className = "" }: { alerts: string[]; className?: string }) {
  if (alerts.length === 0) return null;
  return (
    <ul aria-label="Medical alerts" className={`flex flex-wrap gap-1.5 ${className}`}>
      {alerts.map((a) => (
        <li
          key={a}
          className="inline-flex items-center gap-1.5 rounded-md bg-red-700 px-2 py-1 text-xs font-bold leading-tight text-white"
        >
          <TriangleAlert aria-hidden className="size-3.5 shrink-0" strokeWidth={2.5} />
          <span>
            <span className="sr-only">Medical alert: </span>
            {a}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Large banner for the top of a record. */
export function AlertBanner({ name, alerts }: { name: string; alerts: string[] }) {
  if (alerts.length === 0) return null;
  return (
    <section
      aria-label={`Medical alerts for ${name}`}
      className="rounded-2xl border-2 border-red-700 bg-red-50 p-4 shadow-sm sm:p-5"
    >
      <div className="flex items-center gap-2 text-red-800">
        <TriangleAlert aria-hidden className="size-6" strokeWidth={2.5} />
        <h2 className="text-sm font-extrabold uppercase tracking-wider">
          Medical alert{alerts.length > 1 ? "s" : ""}
        </h2>
      </div>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {alerts.map((a) => (
          <li
            key={a}
            className="flex items-start gap-3 rounded-xl bg-red-700 px-4 py-3 text-lg font-bold leading-snug text-white"
          >
            <TriangleAlert aria-hidden className="mt-1 size-5 shrink-0" strokeWidth={2.5} />
            <span>{a}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SpeciesIcon({ species, className = "size-5" }: { species: string; className?: string }) {
  const props = { "aria-hidden": true, className } as const;
  switch (species) {
    case "Dog":
      return <Dog {...props} />;
    case "Cat":
      return <Cat {...props} />;
    case "Bird":
      return <Bird {...props} />;
    case "Rabbit":
      return <Rabbit {...props} />;
    default:
      return <PawPrint {...props} />;
  }
}
