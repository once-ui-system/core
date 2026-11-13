"use client";

import dynamic from "next/dynamic";
import { Center, Spinner } from "@chakra-ui/react";
import type { HomeMapProps } from "./home-map";

const HomeMapDynamic = dynamic(() => import("./home-map"), {
  ssr: false,
  loading: () => (
    <Center height="100%" bg="bg.muted">
      <Spinner />
    </Center>
  ),
});

export default function LazyHomeMap(props: HomeMapProps) {
  return <HomeMapDynamic {...props} />;
}
