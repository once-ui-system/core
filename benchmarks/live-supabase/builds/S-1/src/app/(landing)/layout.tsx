import { Column } from "@once-ui-system/core";
import { Footer, Header } from "./components";

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <Column as="main" fillWidth horizontal="center" flex={1} paddingY="xl">
        {children}
      </Column>
      <Footer />
    </>
  );
}
