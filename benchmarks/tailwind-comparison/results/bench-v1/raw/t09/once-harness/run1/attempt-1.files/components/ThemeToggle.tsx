"use client";

import { IconButton, useTheme } from "@once-ui-system/core";
import { useEffect, useState } from "react";

/** Light/dark toggle: flips the whole site through the design system's theme context. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Before mount the resolved theme can differ from the server render; keep markup stable.
  const isDark = mounted ? resolvedTheme === "dark" : true;
  const next = isDark ? "light" : "dark";

  return (
    <IconButton
      variant="tertiary"
      icon={isDark ? "light" : "dark"}
      tooltip={`Switch to ${next} theme`}
      aria-label={`Switch to ${next} theme`}
      onClick={() => setTheme(next)}
    />
  );
}
