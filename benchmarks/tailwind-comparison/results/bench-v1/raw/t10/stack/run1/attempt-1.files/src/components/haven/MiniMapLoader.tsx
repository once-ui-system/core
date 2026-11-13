"use client";

import dynamic from "next/dynamic";
import { Column, Text } from "@once-ui-system/core";
import { type Home, listings } from "@/lib/data";

const MiniMap = dynamic(() => import("./MiniMap"), {
  ssr: false,
  loading: () => (
    <Column fill center background="neutral-alpha-weak">
      <Text variant="body-default-s" onBackground="neutral-weak">
        Loading map…
      </Text>
    </Column>
  ),
});

export function MiniMapLoader({ home }: { home: Home }) {
  return (
    <div
      className="haven-minimap"
      role="region"
      aria-label={`Map showing ${home.title} in ${home.district}, ${listings.city}`}
    >
      <MiniMap home={home} />
    </div>
  );
}
