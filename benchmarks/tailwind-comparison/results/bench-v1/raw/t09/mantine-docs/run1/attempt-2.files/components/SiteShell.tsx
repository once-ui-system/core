import { Box } from "@mantine/core";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import classes from "./SiteShell.module.css";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <Box className={classes.root}>
      <a href="#main" className={classes.skipLink}>
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1} className={classes.main}>
        {children}
      </main>
      <SiteFooter />
    </Box>
  );
}
