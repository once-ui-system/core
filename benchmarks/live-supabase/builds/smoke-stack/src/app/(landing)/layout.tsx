import { Column } from "@once-ui-system/core";
import { Header, Footer, Banner } from "@/app/(landing)/components";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Above the header's fade, below overlays (Drawer and Dialog sit at 9). */}
      <Banner zIndex={3} />
      <Header />
      <Column fillWidth horizontal="center" flex={1} paddingY="xl">
        {children}
      </Column>
      <Footer />
    </>
  );
}
