"use client";

import { type ComponentType, useEffect, useState } from "react";
import { Box, Spinner } from "@chakra-ui/react";
import type { HomeMapProps } from "./home-map";

/**
 * Loads the map module only in the browser, after hydration. The first client
 * render is identical to the server render (a placeholder), so there is no
 * hydration mismatch.
 */
export default function LazyHomeMap(props: HomeMapProps) {
  const [MapComponent, setMapComponent] =
    useState<ComponentType<HomeMapProps> | null>(null);

  useEffect(() => {
    let cancelled = false;
    import("./home-map").then((mod) => {
      if (!cancelled) setMapComponent(() => mod.default);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!MapComponent) {
    return (
      <Box
        height="100%"
        width="100%"
        bg="bg.muted"
        display="flex"
        alignItems="center"
        justifyContent="center"
        role="status"
        aria-label="Loading map"
      >
        <Spinner />
      </Box>
    );
  }

  return <MapComponent {...props} />;
}
