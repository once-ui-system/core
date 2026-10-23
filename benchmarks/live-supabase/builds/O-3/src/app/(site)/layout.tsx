import { Column } from "@once-ui-system/core";
import { DemoNotice } from "@/components/DemoNotice";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <Column fillWidth flex={1}>
      <DemoNotice />
      <SiteHeader />
      <Column as="main" fillWidth flex={1} horizontal="center" paddingX="24">
        {children}
      </Column>
      <SiteFooter />
    </Column>
  );
}
