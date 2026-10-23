import { Footer, Header } from "@/app/(landing)/components";
import { Column } from "@once-ui-system/core";

export default function LandingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      <Column fillWidth horizontal="center" flex={1} paddingY="xl">
        {children}
      </Column>
      <Footer />
    </>
  );
}
