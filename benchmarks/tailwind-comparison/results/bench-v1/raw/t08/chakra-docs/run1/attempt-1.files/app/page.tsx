import type { Metadata } from "next";
import { Box } from "@chakra-ui/react";
import { Wizard } from "@/components/onboarding/wizard";

export const metadata: Metadata = {
  title: "Get started | Lumen",
  description:
    "Set up your Lumen workspace in four quick steps: account, workspace, invites and preferences.",
};

export default function Page() {
  return (
    <Box as="main" minH="100vh" bg="bg.subtle">
      <Wizard />
    </Box>
  );
}
