import { Background, Button, Column, Heading, Row, Text } from "@once-ui-system/core";

export default function NotFound() {
  return (
    <Column as="section" fill center padding="24">
      <Column maxWidth="m" radius="xl" padding="xl" overflow="hidden">
        <Background
          position="absolute"
          top="0"
          left="0"
          fill
          pointerEvents="none"
          gradient={{
            display: true,
            colorStart: "brand-alpha-medium",
            colorEnd: "static-transparent",
            x: 50,
            y: 0,
            width: 200,
            height: 80,
            opacity: 60,
          }}
        />
        <Column zIndex={1} gap="8">
          <Text variant="display-strong-xl">404</Text>
          <Heading as="h1" variant="display-default-xs">
            Page not found
          </Heading>
          <Text onBackground="neutral-weak" marginBottom="24">
            The page you are looking for does not exist.
          </Text>
          <Row>
            <Button href="/" label="Back to home" />
          </Row>
        </Column>
      </Column>
    </Column>
  );
}
