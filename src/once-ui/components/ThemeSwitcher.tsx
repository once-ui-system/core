"use client";

import React, { forwardRef } from "react";
import { Row, IconButton } from ".";
import { useTheme } from "../contexts";

const ThemeSwitcher = forwardRef<HTMLDivElement, React.ComponentProps<typeof Row>>((flex, ref) => {
  const { theme, setTheme } = useTheme();
  
  // Ensure the component properly reflects the current theme
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Row
      data-border="rounded"
      ref={ref}
      gap="2"
      border="neutral-alpha-weak"
      radius="full"
      {...flex}
    >
      <IconButton
        icon="computer"
        variant={mounted && theme === "system" ? "primary" : "tertiary"}
        onClick={() => setTheme("system")}
        aria-label="System theme"
      />
      <IconButton
        icon="dark"
        variant={mounted && theme === "dark" ? "primary" : "tertiary"}
        onClick={() => setTheme("dark")}
        aria-label="Dark theme"
      />
      <IconButton
        icon="light"
        variant={mounted && theme === "light" ? "primary" : "tertiary"}
        onClick={() => setTheme("light")}
        aria-label="Light theme"
      />
    </Row>
  );
});

ThemeSwitcher.displayName = "ThemeSwitcher";
export { ThemeSwitcher };
