"use client";

import dynamic from "next/dynamic";
import { Center, Spinner } from "@chakra-ui/react";

const LazyHomeMap = dynamic(() => import("./home-map"), {
  ssr: false,
  loading: () => (
    <Center height="100%" bg="bg.muted">
      <Spinner />
    </Center>
  ),
});

export default LazyHomeMap;
