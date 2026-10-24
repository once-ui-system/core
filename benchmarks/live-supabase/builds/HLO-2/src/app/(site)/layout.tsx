import { Column } from "@once-ui-system/core";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <Column fill minHeight="100vh">
      <SiteHeader />
      <Column as="main" fillWidth flex={1} horizontal="center">
        {children}
      </Column>
      <SiteFooter />
    </Column>
  );
}
