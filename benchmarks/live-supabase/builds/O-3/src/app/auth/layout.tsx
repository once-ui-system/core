import { Column } from "@once-ui-system/core";
import { DemoNotice } from "@/components/DemoNotice";
import { SiteHeader } from "@/components/SiteHeader";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Column fillWidth flex={1}>
      <DemoNotice />
      <SiteHeader />
      <Column as="main" fillWidth flex={1} horizontal="center" paddingX="16" paddingY="48">
        {children}
      </Column>
    </Column>
  );
}
