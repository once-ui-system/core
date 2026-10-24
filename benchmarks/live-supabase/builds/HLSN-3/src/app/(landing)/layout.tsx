import { Column } from "@once-ui-system/core";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function LandingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <Column fillWidth minHeight="100vh" background="page" horizontal="center">
      <SiteHeader />
      <Column as="main" fillWidth maxWidth="l" paddingX="16" paddingY="40" gap="104" flex={1}>
        {children}
      </Column>
      <SiteFooter />
    </Column>
  );
}
