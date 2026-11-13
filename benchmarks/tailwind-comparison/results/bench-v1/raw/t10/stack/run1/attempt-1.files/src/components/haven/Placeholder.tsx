import { placeholderStyle } from "@/lib/data";
import "./haven.css";

export function Placeholder({
  seed,
  shift = 0,
  label,
}: {
  seed: string;
  shift?: number;
  label?: string;
}) {
  return (
    <div
      className="haven-ph"
      style={placeholderStyle(seed, shift)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
