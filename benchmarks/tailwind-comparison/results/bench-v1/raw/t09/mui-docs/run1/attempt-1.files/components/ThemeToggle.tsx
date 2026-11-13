"use client";

import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useColorScheme } from "@mui/material/styles";

/**
 * Light/dark switch for the whole site. Both the visible mode and the
 * persisted preference come from the theme's colour-scheme context, so
 * every themed surface updates together.
 */
export default function ThemeToggle() {
  const { mode, systemMode, setMode } = useColorScheme();

  // `mode` is undefined on the server and first client render; render a
  // same-sized placeholder so the header does not shift or mismatch.
  if (!mode) {
    return <Box aria-hidden sx={{ width: 40, height: 40 }} />;
  }

  const resolved = mode === "system" ? (systemMode ?? "dark") : mode;
  const next = resolved === "dark" ? "light" : "dark";
  const label = `Switch to ${next} theme`;

  return (
    <Tooltip title={label}>
      <IconButton
        onClick={() => setMode(next)}
        aria-label={label}
        color="inherit"
      >
        {resolved === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
}
