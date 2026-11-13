"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const DetailMap = dynamic(() => import("@/components/haven/detail-map"), {
  ssr: false,
  loading: () => <Skeleton className="size-full rounded-none" />,
});

export function DetailMapLoader(props: ComponentProps<typeof DetailMap>) {
  return <DetailMap {...props} />;
}
