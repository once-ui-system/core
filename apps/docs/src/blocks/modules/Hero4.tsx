import {
  AutoScroll,
  Background,
  Button,
  Column,
  Fade,
  Heading,
  Media,
  Row,
} from "@once-ui-system/core";

export const Hero4: React.FC<React.ComponentProps<typeof Row>> = ({ ...flex }) => {
  return (
    <Column fillWidth fitHeight horizontal="center" align="center">
      <Background
        position="absolute"
        top="0"
        left="0"
        gradient={{
          display: true,
          x: 50,
          y: 0,
          width: 50,
          height: 100,
          colorStart: "accent-background-strong",
          colorEnd: "static-transparent",
        }}
        height={32}
      />
      <Background
        data-solid="inverse"
        position="absolute"
        top="0"
        left="0"
        gradient={{
          display: true,
          x: 50,
          y: 0,
          width: 50,
          height: 100,
          colorStart: "brand-solid-medium",
          colorEnd: "static-transparent",
        }}
        height={24}
      />
      <Column fillWidth gap="32" fitHeight horizontal="center" {...flex}>
        <Column fillWidth horizontal="center" gap="24" marginBottom="32">
          <Column maxWidth="xs" horizontal="center" gap="12">
            <Heading variant="display-strong-xl" marginTop="12">
              Just ship it
              <br /> with Once UI
            </Heading>
            <Heading
              wrap="balance"
              onBackground="neutral-weak"
              variant="heading-default-xl"
              marginBottom="32"
            >
              The design engine for builders
            </Heading>
            <Row gap="8" data-border="rounded">
              <Button href="#">Ship your app</Button>
              <Button href="#" variant="secondary">
                Request a demo
              </Button>
            </Row>
          </Column>
          <Column maxWidth="l" overflow="hidden">
            <Column fillWidth gap="12" style={{ transform: "perspective(1000px) rotateX(15deg)" }}>
              <AutoScroll
                aspectRatio="3 / 1"
                style={{ transform: "scale(0.75) translateX(-25%)", width: "150%" }}
                speed="slow"
              >
                <Media
                  src="/images/og/home.jpg"
                  alt="Hero mockup"
                  marginRight="16"
                  aspectRatio="16 / 9"
                  radius="l"
                  border="neutral-alpha-medium"
                />
                <Media
                  src="/images/products/studio-01.jpg"
                  alt="Hero mockup"
                  marginRight="16"
                  aspectRatio="16 / 9"
                  radius="l"
                  border="neutral-alpha-medium"
                />
                <Media
                  src="/images/products/docs-01.jpg"
                  alt="Hero mockup"
                  marginRight="16"
                  aspectRatio="16 / 9"
                  radius="l"
                  border="neutral-alpha-medium"
                />
                <Media
                  src="/images/products/portfolio-01.jpg"
                  alt="Hero mockup"
                  marginRight="16"
                  aspectRatio="16 / 9"
                  radius="l"
                  border="neutral-alpha-medium"
                />
              </AutoScroll>
            </Column>
            <Fade
              style={{ transform: "translateX(-1px)" }}
              position="absolute"
              top="0"
              left="0"
              fillHeight
              width={12}
              to="right"
            />
            <Fade
              style={{ transform: "translateX(1px)" }}
              position="absolute"
              top="0"
              right="0"
              fillHeight
              width={12}
              to="left"
            />
          </Column>
        </Column>
      </Column>
    </Column>
  );
};
