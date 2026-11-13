import { cn } from "@/lib/utils";
import type { Home } from "@/lib/data";

const PALETTES: ReadonlyArray<{ sky: string; wall: string; roof: string; accent: string }> = [
  { sky: "#dbeafe", wall: "#fde68a", roof: "#b45309", accent: "#0f766e" },
  { sky: "#fce7f3", wall: "#e7e5e4", roof: "#9f1239", accent: "#1d4ed8" },
  { sky: "#dcfce7", wall: "#fed7aa", roof: "#7c2d12", accent: "#4d7c0f" },
  { sky: "#e0e7ff", wall: "#f5f5f4", roof: "#3730a3", accent: "#be123c" },
  { sky: "#cffafe", wall: "#fef3c7", roof: "#92400e", accent: "#0369a1" },
  { sky: "#ede9fe", wall: "#fecdd3", roof: "#6b21a8", accent: "#047857" },
];

function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * A photo placeholder drawn purely with CSS shapes. `variant` shifts the
 * palette and the scene so each gallery tile differs.
 */
export function HomePlaceholder({
  home,
  variant = 0,
  className,
  label,
}: {
  home: Home;
  variant?: number;
  className?: string;
  label?: string;
}) {
  const p = PALETTES[(hash(home.id) + variant) % PALETTES.length];
  const kind = (hash(home.id) + variant) % 3;
  const isHouse = home.type === "House";

  return (
    <div
      role="img"
      aria-label={label ?? `Photo placeholder of ${home.title}`}
      className={cn("relative aspect-[4/3] w-full overflow-hidden", className)}
      style={{ background: `linear-gradient(180deg, ${p.sky} 0%, ${p.sky} 62%, ${p.accent}33 62%)` }}
    >
      {/* sun */}
      <div
        className="absolute rounded-full"
        style={{
          width: "14%",
          aspectRatio: "1",
          top: "10%",
          right: kind === 1 ? "auto" : "12%",
          left: kind === 1 ? "12%" : "auto",
          background: "#fef08a",
        }}
      />
      {/* ground */}
      <div className="absolute inset-x-0 bottom-0 h-[38%]" style={{ background: `${p.accent}40` }} />
      {isHouse ? (
        <>
          <div
            className="absolute"
            style={{
              left: "24%",
              width: "52%",
              bottom: "20%",
              height: "34%",
              background: p.wall,
              boxShadow: "inset 0 -6px 0 rgba(0,0,0,0.06)",
            }}
          />
          <div
            className="absolute"
            style={{
              left: "20%",
              width: "60%",
              bottom: "54%",
              height: "20%",
              background: p.roof,
              clipPath: "polygon(0 100%, 50% 0, 100% 100%)",
            }}
          />
          <div
            className="absolute"
            style={{ left: "45%", width: "10%", bottom: "20%", height: "18%", background: p.accent }}
          />
          <div
            className="absolute"
            style={{ left: "30%", width: "9%", bottom: "34%", height: "10%", background: "#bae6fd" }}
          />
          <div
            className="absolute"
            style={{ left: "61%", width: "9%", bottom: "34%", height: "10%", background: "#bae6fd" }}
          />
        </>
      ) : (
        <>
          <div
            className="absolute"
            style={{
              left: kind === 2 ? "14%" : "20%",
              width: "34%",
              bottom: "18%",
              height: "62%",
              background: p.wall,
              boxShadow: "inset -8px 0 0 rgba(0,0,0,0.05)",
            }}
          />
          <div
            className="absolute"
            style={{
              left: kind === 2 ? "46%" : "50%",
              width: "28%",
              bottom: "18%",
              height: "44%",
              background: p.accent,
              opacity: 0.85,
            }}
          />
          {[0, 1, 2].map((row) =>
            [0, 1].map((col) => (
              <div
                key={`${row}-${col}`}
                className="absolute"
                style={{
                  left: `${(kind === 2 ? 18 : 24) + col * 14}%`,
                  width: "8%",
                  bottom: `${30 + row * 16}%`,
                  height: "9%",
                  background: "#bae6fd",
                }}
              />
            )),
          )}
          <div
            className="absolute"
            style={{ left: "55%", width: "18%", bottom: "18%", height: "10%", background: p.roof, opacity: 0.8 }}
          />
        </>
      )}
    </div>
  );
}
