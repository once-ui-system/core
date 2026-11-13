import * as React from "react";
import Box from "@mui/material/Box";

// Text for screen readers only; the visible label next to it is marked aria-hidden.
export function SrOnly({ children }: { children: React.ReactNode }) {
  return (
    <Box
      component="span"
      sx={{
        position: "absolute",
        width: 1,
        height: 1,
        overflow: "hidden",
        clip: "rect(0 0 0 0)",
        whiteSpace: "nowrap",
        border: 0,
        p: 0,
        m: -0.125,
      }}
    >
      {children}
    </Box>
  );
}
