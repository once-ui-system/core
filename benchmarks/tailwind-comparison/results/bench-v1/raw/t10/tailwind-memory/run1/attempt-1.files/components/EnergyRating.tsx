const SCALE = ["A+", "A", "B", "C", "D", "E", "F"];
const COLORS = [
  "bg-green-700 text-white",
  "bg-green-600 text-white",
  "bg-lime-600 text-white",
  "bg-yellow-400 text-yellow-950",
  "bg-amber-500 text-amber-950",
  "bg-orange-600 text-white",
  "bg-red-700 text-white",
];

export function EnergyRating({ rating }: { rating: string }) {
  return (
    <div>
      <div
        className="flex items-end gap-1"
        role="img"
        aria-label={`Energy rating ${rating} on a scale from A+ (best) to F (worst)`}
      >
        {SCALE.map((s, i) => {
          const active = s === rating;
          return (
            <div
              key={s}
              className={`grid place-items-center rounded-md text-sm font-semibold ${COLORS[i]} ${
                active
                  ? "h-12 w-12 ring-2 ring-stone-900 ring-offset-2"
                  : "h-8 w-9 opacity-45"
              }`}
            >
              {s}
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-sm text-stone-600">
        Rated <strong className="text-stone-900">{rating}</strong>. A+ is the
        most efficient, F the least.
      </p>
    </div>
  );
}
