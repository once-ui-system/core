"use client";

import React, { forwardRef } from "react";
import { Row, IconButton } from ".";
import { useTheme } from "../contexts";

const ThemeSwitcher = forwardRef<HTMLDivElement, React.ComponentProps<typeof Row>>((flex, ref) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
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
      {...flex}
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
export { ThemeSwitcher };
