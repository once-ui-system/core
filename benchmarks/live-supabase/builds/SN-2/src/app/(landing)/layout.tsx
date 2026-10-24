import { Column } from "@once-ui-system/core";
import { Header, Footer } from "@/app/(landing)/components";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
