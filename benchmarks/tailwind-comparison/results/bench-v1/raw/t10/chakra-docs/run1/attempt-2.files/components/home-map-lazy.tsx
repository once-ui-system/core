"use client";

import dynamic from "next/dynamic";
import { Box, Text } from "@chakra-ui/react";

const HomeMap = dynamic(() => import("@/components/home-map"), {
  ssr: false,
  loading: () => (
    <Box
      width="100%"
      height="100%"
      bg="bg.muted"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Text color="fg.muted" fontSize="sm">
        Loading map…
      </Text>
    </Box>
  ),
});

export default HomeMap;
