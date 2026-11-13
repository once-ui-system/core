import { Box, Flex, Text } from "@chakra-ui/react";

const SCALE = ["A+", "A", "B", "C", "D", "E", "F"];
const COLORS: Record<string, string> = {
  "A+": "#0a7d3b",
  A: "#2e9c3f",
  B: "#6aae2f",
  C: "#b5c21f",
  D: "#e3b416",
  E: "#e8861a",
  F: "#d9541f",
};

export function EnergyRating({ rating }: { rating: string }) {
  return (
    <Box>
      <Flex gap={1} role="img" aria-label={`Energy rating ${rating} on a scale from A+ (best) to F (worst)`}>
        {SCALE.map((r) => {
          const active = r === rating;
          return (
            <Flex
              key={r}
              aria-hidden="true"
              align="center"
              justify="center"
              width={active ? "52px" : "36px"}
              height={active ? "44px" : "30px"}
              alignSelf="flex-end"
              rounded="sm"
              fontWeight="bold"
              fontSize={active ? "lg" : "sm"}
              style={{
                background: COLORS[r],
                color: ["C", "D"].includes(r) ? "#1a202c" : "#ffffff",
                outline: active ? "3px solid #1a202c" : "none",
                outlineOffset: 1,
                opacity: active ? 1 : 0.55,
              }}
            >
              {r}
            </Flex>
          );
        })}
      </Flex>
      <Text fontSize="xs" color="fg.muted" mt={2}>
        Scale from A+ (most efficient) to F (least efficient).
      </Text>
    </Box>
  );
}
