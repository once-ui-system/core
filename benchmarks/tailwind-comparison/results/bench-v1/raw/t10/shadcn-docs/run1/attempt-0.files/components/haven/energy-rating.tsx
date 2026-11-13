import { cn } from "@/lib/utils";
import { ENERGY_SCALE } from "@/lib/data";

const COLORS: Record<string, string> = {
  "A+": "bg-green-700 text-white",
  A: "bg-green-600 text-white",
  B: "bg-lime-600 text-white",
  C: "bg-yellow-400 text-neutral-900",
  D: "bg-amber-500 text-neutral-900",
  E: "bg-orange-600 text-white",
  F: "bg-red-600 text-white",
};

export function EnergyRating({ rating }: { rating: string }) {
  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">
        Energy rating:{" "}
        <span className="font-semibold text-foreground">{rating}</span>
      </p>
      <ol aria-label="Energy rating scale" className="flex flex-wrap gap-1.5">
        {ENERGY_SCALE.map((step) => {
          const current = step === rating;
          return (
            <li
              key={step}
              aria-current={current ? "true" : undefined}
              className={cn(
                "flex h-9 min-w-10 items-center justify-center rounded-md px-2 text-sm font-semibold transition-transform",
                COLORS[step],
                current ? "scale-110 ring-2 ring-foreground ring-offset-2 ring-offset-background" : "opacity-40",
              )}
            >
              {step}
              {current ? <span className="sr-only"> (this home)</span> : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
