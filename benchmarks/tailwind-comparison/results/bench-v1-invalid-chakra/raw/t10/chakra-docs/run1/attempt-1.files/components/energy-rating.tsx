import { Box, HStack, Text } from "@chakra-ui/react";

const SCALE = ["A+", "A", "B", "C", "D", "E", "F"];
const COLORS: Record<string, string> = {
  "A+": "#0b7a3b",
  A: "#2f9e44",
  B: "#5c940d",
  C: "#8a7f00",
  D: "#c77700",
  E: "#d9480f",
  F: "#c92a2a",
};

export function EnergyRating({ rating }: { rating: string }) {
  return (
    <Box>
      <HStack
        gap="1.5"
        role="img"
        aria-label={`Energy rating ${rating} on a scale from A+ to F`}
      >
        {SCALE.map((s) => {
          const active = s === rating;
          return (
            <Box
              key={s}
              aria-hidden="true"
              display="flex"
              alignItems="center"
              justifyContent="center"
              width={active ? "52px" : "36px"}
              height={active ? "52px" : "36px"}
              rounded="md"
              color="white"
              fontWeight="bold"
              fontSize={active ? "lg" : "sm"}
              borderWidth={active ? "3px" : "0"}
              borderColor="fg"
              style={{
                background: COLORS[s],
                opacity: active ? 1 : 0.4,
              }}
            >
              {s}
            </Box>
          );
        })}
      </HStack>
      <Text fontSize="sm" color="fg.muted" mt="2">
        Rated {rating} (A+ is the most efficient)
      </Text>
    </Box>
  );
}
