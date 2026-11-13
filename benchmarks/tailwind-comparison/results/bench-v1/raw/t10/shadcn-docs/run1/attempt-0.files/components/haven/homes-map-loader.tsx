"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const HomesMap = dynamic(() => import("@/components/haven/homes-map"), {
  ssr: false,
  loading: () => <Skeleton className="size-full rounded-none" />,
});

export function HomesMapLoader(props: ComponentProps<typeof HomesMap>) {
  return <HomesMap {...props} />;
}
