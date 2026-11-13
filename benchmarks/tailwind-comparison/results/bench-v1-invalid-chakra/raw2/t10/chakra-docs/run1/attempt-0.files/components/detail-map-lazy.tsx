"use client";

import dynamic from "next/dynamic";
import { Flex, Text } from "@chakra-ui/react";

export const DetailMapLazy = dynamic(() => import("@/components/detail-map"), {
  ssr: false,
  loading: () => (
    <Flex height="100%" align="center" justify="center" bg="bg.muted">
      <Text color="fg.muted">Loading map…</Text>
    </Flex>
  ),
});
