import type { Metadata } from "next";
import { Flex } from "@chakra-ui/react";
import { SearchView } from "@/components/search-view";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Haven · Homes for sale in Lisbon",
  description: "Search apartments, houses and studios in Lisbon on a map.",
};

export default function Page() {
  return (
    <Flex direction="column" minHeight="100dvh" height={{ md: "100dvh" }}>
      <SiteHeader />
      <Flex as="main" id="main" direction="column" flex="1" minHeight={0}>
        <SearchView />
      </Flex>
    </Flex>
  );
}
