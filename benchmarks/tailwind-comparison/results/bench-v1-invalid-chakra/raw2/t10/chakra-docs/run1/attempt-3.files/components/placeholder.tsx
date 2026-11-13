import { Box } from "@chakra-ui/react";

const PALETTES: Array<[string, string, string]> = [
  ["#f6d7b0", "#e8a87c", "#c38d9e"],
  ["#bfd8d2", "#7fb7be", "#3d7a8a"],
  ["#d9d2e9", "#a79bd0", "#6b5fa6"],
  ["#f2e2b3", "#e0b863", "#b9824a"],
  ["#cfe3c4", "#93c28a", "#4f8a64"],
  ["#f3c9c9", "#e39a9a", "#b25c6a"],
];

export function hashIndex(id: string, offset = 0): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return (h + offset) % PALETTES.length;
}

interface PlaceholderProps {
  id: string;
  variant?: number;
  height?: string | number | Record<string, string | number>;
  rounded?: string;
  label?: string;
}

/** A photo placeholder drawn purely with CSS gradients (skyline of windows). */
export function Placeholder({
  id,
  variant = 0,
  height = "160px",
  rounded = "md",
  label,
}: PlaceholderProps) {
  const [a, b, c] = PALETTES[hashIndex(id, variant)];
  const flip = hashIndex(id, variant + 2) % 2;
  const windows =
    "repeating-linear-gradient(0deg, transparent 0 10px, rgba(255,255,255,0.35) 10px 15px)";
  return (
    <Box
      role="img"
      aria-label={label ?? "Photo placeholder"}
      position="relative"
      overflow="hidden"
      width="100%"
      height={height}
      rounded={rounded}
      style={{
        backgroundImage: `linear-gradient(${flip ? 160 : 200}deg, ${a} 0%, ${b} 60%, ${c} 100%)`,
      }}
    >
      <Box
        position="absolute"
        top="14%"
        right={flip ? "70%" : "16%"}
        width="18%"
        paddingBottom="18%"
        rounded="full"
        bg="whiteAlpha.700"
      />
      <Box
        position="absolute"
        left="8%"
        bottom={0}
        width="30%"
        height="52%"
        bg="blackAlpha.300"
        roundedTop="sm"
        style={{ backgroundImage: windows }}
      />
      <Box
        position="absolute"
        left="40%"
        bottom={0}
        width="26%"
        height="68%"
        bg="blackAlpha.400"
        roundedTop="sm"
        style={{ backgroundImage: windows }}
      />
      <Box
        position="absolute"
        left="68%"
        bottom={0}
        width="24%"
        height="40%"
        bg="blackAlpha.300"
        roundedTop="sm"
        style={{ backgroundImage: windows }}
      />
    </Box>
  );
}
