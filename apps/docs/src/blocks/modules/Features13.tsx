import { Column, Heading, Line, Media, Row, Text } from "@once-ui-system/core";

export const Features13 = (flex: React.ComponentProps<typeof Row>) => {
  return (
    <Row vertical="center" maxWidth="xl" padding="8" m={{ direction: "column-reverse" }} {...flex}>
      <Media
        fillWidth
        sizes="640px"
        src="/images/customize/brand-01.jpg"
        aspectRatio="3/4"
        radius="l"
        border
      />
      <Column fillWidth padding="xl" gap="16" horizontal="start">
        <Heading as="h2" variant="display-strong-m">
          From template to client delivery — in a few steps
        </Heading>
        <Text onBackground="neutral-weak" variant="heading-default-xl" wrap="balance">
          No custom builds. No endless design cycles. Just adapt, deploy, repeat.
        </Text>
        <Column fillWidth paddingTop="24">
          {[
            {
              title: "Choose what you want to offer",
              description: "Landing, dashboard, docs, community, or full ecosystem.",
            },
            {
              title: "Customize the brand",
              description:
                "Apply your client’s branding, content, and structure on top of a proven foundation.",
            },
            {
              title: "Deploy instantly",
              description: "Launch production-ready app frontends without rebuilding from scratch.",
            },
            {
              title: "Repeat for the next client",
              description: "Same system. New client. Scalable revenue.",
            },
          ].map((step, index) => (
            <Row maxWidth={28} key={index} gap="32">
              <Column flex={1} minWidth="48" horizontal="center">
                <Row flex={1} horizontal="center">
                  {index === 0 && (
                    <Line position="absolute" top="0" width="16" background="brand-alpha-medium" />
                  )}
                  <Line vert background="brand-alpha-medium" />
                </Row>
                <Row
                  fillWidth
                  height="48"
                  center
                  textVariant="code-default-s"
                  onBackground="brand-weak"
                  radius="m"
                  background="brand-alpha-weak"
                  border="brand-alpha-weak"
                >
                  {index + 1}
                </Row>
                <Row flex={1} horizontal="center">
                  <Line vert background="brand-alpha-medium" />
                  {index === 3 && (
                    <Line
                      position="absolute"
                      bottom="0"
                      width="16"
                      background="brand-alpha-medium"
                    />
                  )}
                </Row>
              </Column>
              <Column fillWidth gap="4" paddingY="16">
                <Text variant="heading-default-s" wrap="balance">
                  {step.title}
                </Text>
                <Text onBackground="neutral-weak" variant="body-default-xs" wrap="balance">
                  {step.description}
                </Text>
              </Column>
            </Row>
          ))}
        </Column>
      </Column>
    </Row>
  );
};
