"use client";

import { Box } from "@chakra-ui/react";
import { type Home } from "@/lib/data";
import LazyHomeMap from "./lazy-home-map";

export function DetailMap({ home }: { home: Home }) {
  return (
    <Box height="280px" rounded="lg" overflow="hidden" borderWidth="1px">
      <LazyHomeMap
        homes={[home]}
        center={[home.lng, home.lat]}
        zoom={13.5}
        label={`Map showing ${home.title} in ${home.district}`}
      />
    </Box>
  );
}
