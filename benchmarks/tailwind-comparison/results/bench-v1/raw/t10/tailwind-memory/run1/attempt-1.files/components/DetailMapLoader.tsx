"use client";

import dynamic from "next/dynamic";

const DetailMap = dynamic(
  () => import("./DetailMap").then((m) => m.DetailMap),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full w-full place-items-center bg-stone-100 text-sm text-stone-600">
        Loading map…
      </div>
    ),
  },
);

export function DetailMapLoader(props: {
  lat: number;
  lng: number;
  label: string;
}) {
  return <DetailMap {...props} />;
}
