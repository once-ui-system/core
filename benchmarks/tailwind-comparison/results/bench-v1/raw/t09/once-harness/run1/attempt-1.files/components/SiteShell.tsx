import { Column, VisuallyHidden } from "@once-ui-system/core";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

/** Shared page frame: skip link, header, main landmark and footer. */
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <Column fillWidth minHeight="100vh">
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
