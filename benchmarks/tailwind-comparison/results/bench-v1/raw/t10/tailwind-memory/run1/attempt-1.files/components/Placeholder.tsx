import { Home as HomeIcon } from "lucide-react";

const PALETTES: [string, string, string][] = [
  ["#fde68a", "#fb923c", "#9a3412"],
  ["#bae6fd", "#38bdf8", "#075985"],
  ["#bbf7d0", "#4ade80", "#166534"],
  ["#fbcfe8", "#f472b6", "#9d174d"],
  ["#ddd6fe", "#a78bfa", "#5b21b6"],
  ["#fecaca", "#f87171", "#991b1b"],
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** CSS-drawn photo placeholder: gradient sky, sun and a skyline silhouette. */
export function Placeholder({
  seed,
  variant = 0,
  className = "",
}: {
  seed: string;
  variant?: number;
  className?: string;
}) {
  const [a, b, c] = PALETTES[(hash(seed) + variant) % PALETTES.length];
  const sunLeft = 15 + ((hash(seed) + variant * 23) % 60);
  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden ${className}`}
      style={{ background: `linear-gradient(160deg, ${a} 0%, ${b} 100%)` }}
    >
      <div
        className="absolute top-[14%] size-[18%] rounded-full bg-white/70"
        style={{ left: `${sunLeft}%` }}
      />
      <div className="absolute inset-x-0 bottom-0 flex h-[48%] items-end gap-[3%] px-[4%]">
        {[55, 80, 62, 95, 70, 85, 58].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm"
            style={{
              height: `${h - ((variant + i) % 3) * 8}%`,
              background: c,
              opacity: 0.55 + ((i + variant) % 4) * 0.12,
            }}
          />
        ))}
      </div>
      <HomeIcon className="absolute right-3 top-3 size-5 text-white/80" />
    </div>
  );
}
