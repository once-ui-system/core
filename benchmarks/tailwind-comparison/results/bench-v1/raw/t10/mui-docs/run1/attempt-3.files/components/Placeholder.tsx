import Box from "@mui/material/Box";
import { hueFor } from "@/lib/data";

interface PlaceholderProps {
  id: string;
  /** Variant index to vary the composition (used by the gallery). */
  variant?: number;
  height?: number | string | { xs?: number | string; sm?: number | string; md?: number | string; lg?: number | string; xl?: number | string };
  label?: string;
  rounded?: boolean;
}

/**
 * A "photo" drawn purely with CSS: sky gradient, a building silhouette and a ground strip.
 * Decorative, so it is hidden from assistive technology unless a label is given.
 */
export default function Placeholder({
  id,
  variant = 0,
  height = 160,
  label,
  rounded = false,
}: PlaceholderProps) {
  const hue = (hueFor(id) + variant * 28) % 360;
  const sky = `linear-gradient(180deg, hsl(${hue} 70% 82%) 0%, hsl(${(hue + 30) % 360} 75% 92%) 100%)`;
  const wall = `hsl(${(hue + 190) % 360} 28% 42%)`;
  const wallLight = `hsl(${(hue + 190) % 360} 30% 55%)`;
  const ground = `hsl(${(hue + 120) % 360} 25% 36%)`;
  const windows = `repeating-linear-gradient(90deg, rgba(255,236,170,0.9) 0 10px, transparent 10px 24px)`;
  const towerLeft = 12 + ((variant * 7) % 14);
  const towerHeight = 52 + ((variant * 9) % 18);

  return (
    <Box
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      sx={{
        position: "relative",
        height,
        width: "100%",
        overflow: "hidden",
        background: sky,
        borderRadius: rounded ? 2 : 0,
        flexShrink: 0,
      }}
    >
      {/* sun */}
      <Box
        sx={{
          position: "absolute",
          top: "14%",
          right: `${12 + ((variant * 11) % 30)}%`,
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: `hsl(${(hue + 40) % 360} 95% 75%)`,
          opacity: 0.9,
        }}
      />
      {/* main building */}
      <Box
        sx={{
          position: "absolute",
          bottom: "16%",
          left: `${towerLeft}%`,
          width: "42%",
          height: `${towerHeight}%`,
          background: wall,
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
          boxShadow: "inset -14px 0 0 rgba(0,0,0,0.12)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: "14% 12% 30% 12%",
            background: windows,
            opacity: 0.85,
            maskImage: "repeating-linear-gradient(180deg, #000 0 14px, transparent 14px 26px)",
            WebkitMaskImage:
              "repeating-linear-gradient(180deg, #000 0 14px, transparent 14px 26px)",
          }}
        />
      </Box>
      {/* side building */}
      <Box
        sx={{
          position: "absolute",
          bottom: "16%",
          left: `${towerLeft + 38}%`,
          width: "30%",
          height: `${towerHeight - 22}%`,
          background: wallLight,
          borderTopLeftRadius: 40,
          borderTopRightRadius: 4,
        }}
      />
      {/* ground */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "17%",
          background: ground,
        }}
      />
    </Box>
  );
}
