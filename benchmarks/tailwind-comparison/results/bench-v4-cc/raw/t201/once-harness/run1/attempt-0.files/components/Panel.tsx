import { Column, Heading, Row } from "@once-ui-system/core";

export function Panel({
  id,
  title,
  aside,
  children,
}: {
  id: string;
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Column as="section" aria-labelledby={id} background="surface" border radius="l" padding="24" gap="16" fillWidth>
      <Row horizontal="between" vertical="center" gap="12" wrap>
        <Heading as="h2" id={id} textVariant="heading-strong-l">
          {title}
        </Heading>
        {aside}
      </Row>
      {children}
    </Column>
  );
}
