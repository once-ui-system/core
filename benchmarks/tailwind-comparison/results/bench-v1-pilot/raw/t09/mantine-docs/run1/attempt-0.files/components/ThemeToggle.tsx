"use client";

import { ActionIcon, useComputedColorScheme, useMantineColorScheme } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";
import classes from "./ThemeToggle.module.css";

export function ThemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computed = useComputedColorScheme("dark", { getInitialValueInEffect: true });

  return (
    <ActionIcon
      variant="default"
      size="lg"
      aria-label="Toggle light and dark theme"
      title="Toggle light and dark theme"
      onClick={() => setColorScheme(computed === "dark" ? "light" : "dark")}
    >
      <IconSun className={classes.sun} size={18} stroke={1.75} aria-hidden="true" />
      <IconMoon className={classes.moon} size={18} stroke={1.75} aria-hidden="true" />
    </ActionIcon>
  );
}
