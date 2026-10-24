import { Column, Row, SmartLink, Text } from "@once-ui-system/core";
import { schema } from "@/resources";

/** The frame for sign-in and invitation pages: a brand bar and one centered column. */
export default function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Row as="header" fillWidth horizontal="center" paddingX="16" paddingY="12">
        <Row fillWidth maxWidth="l" vertical="center">
          <SmartLink href="/" unstyled>
            <Text variant="heading-strong-m" onBackground="neutral-strong">
              {schema.name}
            </Text>
          </SmartLink>
        </Row>
      </Row>
      <Column as="main" fillWidth horizontal="center" flex={1} paddingY="48" paddingX="16">
        <Column fillWidth maxWidth="xs" gap="24">
          {children}
        </Column>
      </Column>
    </>
  );
}
