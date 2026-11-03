import { Box } from "@mantine/core";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import classes from "./SiteShell.module.css";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <Box className={classes.shell}>
      <a href="#main" className={classes.skip}>
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className={classes.main} tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
    </Box>
  );
}
