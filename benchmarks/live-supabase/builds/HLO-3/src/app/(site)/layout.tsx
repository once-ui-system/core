import { Column } from "@once-ui-system/core";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <Column fill minHeight="100vh">
      <SiteHeader />
      <Column as="main" fillWidth flex={1} horizontal="center" paddingX="16" paddingY="40">
        <Column maxWidth="m" gap="40">
          {children}
        </Column>
      </Column>
      <SiteFooter />
    </Column>
  );
}
