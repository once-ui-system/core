"use client";

import * as React from "react";
import { Box } from "@chakra-ui/react";
import { AppShellProvider } from "@/components/app-shell-provider";
import { AppHeader } from "@/components/app-header";
import { CommandPalette } from "@/components/command-palette";
import { InviteMemberDialog } from "@/components/invite-member-dialog";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppShellProvider>
      <Box minH="100dvh" bg="bg.subtle">
        <Box
          as="a"
          href="#main"
          position="absolute"
          left="-9999px"
          _focus={{
            left: "3",
            top: "3",
            zIndex: "popover",
            bg: "bg",
            px: "3",
            py: "2",
            rounded: "md",
            shadow: "md",
          }}
        >
          Skip to content
        </Box>
        <AppHeader />
        <Box as="main" id="main" maxW="6xl" mx="auto" px={{ base: "3", md: "6" }} py={{ base: "5", md: "8" }}>
          {children}
        </Box>
        <CommandPalette />
        <InviteMemberDialog />
      </Box>
    </AppShellProvider>
  );
}
