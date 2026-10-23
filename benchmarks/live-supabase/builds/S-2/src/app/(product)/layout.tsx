import { isSupabaseConfigured } from "@/lib/sb/config";
import { Column, Row, Text } from "@once-ui-system/core";
import { Header, Sidebar } from './components';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Column fill horizontal="center" flex={1}>
      {!isSupabaseConfigured() && (
        <Row fillWidth center paddingX="16" paddingY="8" background="neutral-alpha-weak" role="status">
          <Text variant="label-default-s" onBackground="neutral-medium" align="center">
            Supabase is not configured: demo mode, with sample data and no sign-in.
          </Text>
        </Row>
      )}
      <Header />
      <Row fill paddingX="8">
        <Sidebar s={{hide: true}} maxWidth={18} fitHeight position="sticky" top="56" />
        <Row
          fill
          horizontal="center"
          topRadius="l"
          overflow="hidden">
          <Row
            height="calc(100dvh - var(--static-space-56))"
            overflowY="auto"
            horizontal="center"
            topRadius="l"
            paddingX="l"
            fillWidth
            background="surface">
            <Column maxWidth="xl" gap="m" paddingY="32" fitHeight>
              {children}
            </Column>
          </Row>
        </Row>
      </Row>
    </Column>
  );
}