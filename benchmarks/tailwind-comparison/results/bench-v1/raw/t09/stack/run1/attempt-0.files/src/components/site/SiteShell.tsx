import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { VisuallyHidden } from "@once-ui-system/core";
import { Column } from "@once-ui-system/core";

/** Header and footer shared by every marketing page. */
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <Column fillWidth flex={1}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <SiteHeader />
      <Column as="main" id="main" fillWidth horizontal="center" flex={1}>
        {children}
      </Column>
      <SiteFooter />
    </Column>
  );
}
