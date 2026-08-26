"use client";

import { forwardRef, useEffect, useState } from "react";
import { useTheme } from "../contexts";
import { IconButton } from "./IconButton";
import { Row } from "./Row";

export interface ThemeSwitcherProps extends React.ComponentProps<typeof Row> {}

export const ThemeSwitcher = forwardRef<HTMLDivElement, ThemeSwitcherProps>((props, ref) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getVariant = (themeValue: string) => {
    if (!mounted) return "tertiary";
    return theme === themeValue ? "primary" : "tertiary";
  };

  return (
    <Row
      data-border="rounded"
      ref={ref}
      gap="2"
      border="neutral-alpha-weak"
      radius="full"
      suppressHydrationWarning
      {...props}
    >
      <IconButton
        icon="computer"
        variant={getVariant("system")}
        onClick={() => setTheme("system")}
        aria-label="System theme"
        suppressHydrationWarning
      />
      <IconButton
        icon="dark"
        variant={getVariant("dark")}
        onClick={() => setTheme("dark")}
        aria-label="Dark theme"
        suppressHydrationWarning
      />
      <IconButton
        icon="light"
        variant={getVariant("light")}
        onClick={() => setTheme("light")}
        aria-label="Light theme"
        suppressHydrationWarning
      />
    </Row>
  );
});

ThemeSwitcher.displayName = "ThemeSwitcher";
