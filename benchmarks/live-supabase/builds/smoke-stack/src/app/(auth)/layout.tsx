import { Column } from "@once-ui-system/core";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Column fillWidth horizontal="center" flex={1} padding="8">
      {children}
    </Column>
  );
}