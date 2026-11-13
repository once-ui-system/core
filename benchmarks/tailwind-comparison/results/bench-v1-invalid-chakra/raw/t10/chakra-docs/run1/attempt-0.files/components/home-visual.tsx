import { Box } from "@chakra-ui/react";

const PALETTES: [string, string, string][] = [
  ["#f4d9b8", "#e8a87c", "#c38d9e"],
  ["#cfe3d4", "#8fbf9f", "#41747a"],
  ["#d6dcf5", "#8f9fe0", "#5b5f97"],
  ["#f7d6d0", "#e5989b", "#b5838d"],
  ["#e9e4c8", "#c9b458", "#7a6c2f"],
  ["#d2eaf2", "#7bb8d1", "#33658a"],
];

function hash(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

interface Props {
  id: string;
  /** Variation index for gallery tiles */
  variant?: number;
  label?: string;
}

/** A photo placeholder drawn purely with CSS gradients and shapes. */
export function HomeVisual({ id, variant = 0, label }: Props) {
  const [sky, mid, deep] = PALETTES[(hash(id) + variant) % PALETTES.length];
  const shift = (hash(id) + variant * 7) % 30;
  return (
    <Box
      role="img"
      aria-label={label ?? "Photo placeholder"}
      position="relative"
      overflow="hidden"
      height="100%"
      width="100%"
      style={{
        background: `linear-gradient(180deg, ${sky} 0%, ${sky} 55%, ${mid} 55%, ${mid} 100%)`,
      }}
    >
      <Box
        position="absolute"
        borderRadius="full"
        bg="whiteAlpha.800"
        width="14%"
        paddingBottom="14%"
        style={{ top: "12%", right: `${12 + shift}%` }}
      />
      <Box
        position="absolute"
        bottom="38%"
        left="12%"
        width="26%"
        height="42%"
        style={{ background: deep, opacity: 0.9 }}
      />
      <Box
        position="absolute"
        bottom="38%"
        left="36%"
        width="22%"
        height="30%"
        style={{ background: deep, opacity: 0.7 }}
      />
      <Box
        position="absolute"
        bottom="38%"
        left="56%"
        width="30%"
        height="52%"
        style={{
          background: deep,
          opacity: 0.8,
          clipPath: "polygon(0 12%, 50% 0, 100% 12%, 100% 100%, 0 100%)",
        }}
      />
      <Box
        position="absolute"
        bottom="56%"
        left="17%"
        width="6%"
        height="9%"
        bg="whiteAlpha.700"
      />
      <Box
        position="absolute"
        bottom="56%"
        left="28%"
        width="6%"
        height="9%"
        bg="whiteAlpha.700"
      />
      <Box
        position="absolute"
        bottom="60%"
        left="66%"
        width="8%"
        height="10%"
        bg="whiteAlpha.700"
      />
    </Box>
  );
}
