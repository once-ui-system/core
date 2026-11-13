import { Box } from "@chakra-ui/react";
import { placeholderBackground } from "@/lib/data";

interface Props {
  id: string;
  shift?: number;
  rounded?: string;
  label?: string;
}

/** A photo stand-in drawn purely with CSS: gradient sky, sun, and building silhouettes. */
export function PlaceholderPhoto({ id, shift = 0, rounded, label }: Props) {
  return (
    <Box
      role="img"
      aria-label={label ?? "Photo placeholder"}
      position="relative"
      overflow="hidden"
      width="100%"
      height="100%"
      borderRadius={rounded}
      style={{ background: placeholderBackground(id, shift) }}
    >
      <Box
        position="absolute"
        top="14%"
        right="16%"
        width="14%"
        paddingBottom="14%"
        borderRadius="full"
        bg="whiteAlpha.700"
      />
      <Box
        position="absolute"
        left="8%"
        bottom={0}
        width="22%"
        height="48%"
        bg="blackAlpha.300"
        borderTopRadius="sm"
      />
      <Box
        position="absolute"
        left="34%"
        bottom={0}
        width="30%"
        height="66%"
        bg="blackAlpha.400"
        borderTopRadius="sm"
      />
      <Box
        position="absolute"
        left="68%"
        bottom={0}
        width="24%"
        height="38%"
        bg="blackAlpha.300"
        borderTopRadius="sm"
      />
    </Box>
  );
}
