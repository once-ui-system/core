"use client";

import {
  ActionIcon,
  Box,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";

/**
 * Both icons are rendered and one is hidden per colour scheme with
 * `lightHidden` / `darkHidden`, so server and client markup match.
 */
export function ThemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computed = useComputedColorScheme("dark", {
    getInitialValueInEffect: true,
  });

  return (
    <ActionIcon
      variant="default"
      size="lg"
      aria-label="Toggle light and dark theme"
      onClick={() => setColorScheme(computed === "dark" ? "light" : "dark")}
    >
      <Box component="span" darkHidden style={{ display: "inline-flex" }}>
        <IconSun size={18} stroke={1.75} aria-hidden="true" />
      </Box>
      <Box component="span" lightHidden style={{ display: "inline-flex" }}>
        <IconMoon size={18} stroke={1.75} aria-hidden="true" />
      </Box>
    </ActionIcon>
  );
}
