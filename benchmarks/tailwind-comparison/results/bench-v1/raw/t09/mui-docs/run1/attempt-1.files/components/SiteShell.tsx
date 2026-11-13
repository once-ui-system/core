import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

/** Shared page chrome: skip link, header, main landmark and footer. */
export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Link
        href="#main"
        sx={{
          position: "absolute",
          left: 8,
          top: -64,
          zIndex: "tooltip",
          bgcolor: "background.paper",
          px: 2,
          py: 1,
          borderRadius: 1,
          "&:focus": { top: 8 },
        }}
      >
        Skip to content
      </Link>
      <SiteHeader />
      <Box component="main" id="main" tabIndex={-1} sx={{ flexGrow: 1, outline: "none" }}>
        {children}
      </Box>
      <SiteFooter />
    </Box>
  );
}
