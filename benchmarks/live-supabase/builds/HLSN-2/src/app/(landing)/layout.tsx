import { Column } from "@once-ui-system/core";
import { Footer, Header } from "@/app/(landing)/components";

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <Column fillWidth horizontal="center" flex={1} paddingX="l" s={{ paddingX: "16" }}>
        <Column fillWidth maxWidth="l" horizontal="center" gap="104" paddingBottom="xl">
          {children}
        </Column>
      </Column>
      <Footer />
    </>
  );
}
