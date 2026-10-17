import { Scroller, Background, Button, Column, Fade, Heading, Logo, Row, Tag, Text } from "@once-ui-system/core";

export const Hero3: React.FC<React.ComponentProps<typeof Row>> = ({ ...flex }) => {
  return (
    <Column fillWidth fitHeight horizontal="center" align="center">
      <Background
        position="absolute"
        top="0"
        left="0"
        mask={{ x: "50%", y: 0, radius: "50vh" }}
        dots={{ display: true, color: "neutral-alpha-weak", size: "2" }}
      />
      <Column maxWidth="xs" gap="32" fitHeight horizontal="center" {...flex}>
        <Column fillWidth horizontal="center" gap="24" marginBottom="32">
          <Tag variant="announce"
            href="#"
            id="badge-3"
            paddingY="4"
            paddingLeft="4"
            paddingRight="16"
            gap="8"
            border="neutral-alpha-medium"
            arrow
            effect={false}
          >
            <Tag size="l" tone="brand" marginRight="12">
              <Text textVariant="body-strong-xs">WWUI</Text>
            </Tag>
            <Text textVariant="label-default-s">Claim your ticket</Text>
          </Tag>
          <Heading textVariant="display-default-l" marginTop="12">
            Start with templates
            <br />
            <Text onBackground="brand-weak">Customize with blocks</Text>
          </Heading>
          <Heading onBackground="neutral-medium" textVariant="body-default-l" marginBottom="16">
            Once UI provides out-of-the-box solutions for advanced UI challenges. You can launch a
            functional business with Once UI — not just a shiny site.
          </Heading>
          <Row gap="8">
            <Button href="#">Ship your app</Button>
            <Button href="#" variant="secondary">
              Request a demo
            </Button>
          </Row>
          <Row paddingY="24" maxWidth="40rem">
            <Scroller auto marginTop="xl" opacity={50}>
              <Logo
                wordmark={{
                  light: "/trademarks/wordmark-light.svg",
                  dark: "/trademarks/wordmark-dark.svg",
                }}
              />
              <Logo
                wordmark={{
                  light: "/trademarks/wordmark-light.svg",
                  dark: "/trademarks/wordmark-dark.svg",
                }}
              />
              <Logo
                wordmark={{
                  light: "/trademarks/wordmark-light.svg",
                  dark: "/trademarks/wordmark-dark.svg",
                }}
              />
              <Logo
                wordmark={{
                  light: "/trademarks/wordmark-light.svg",
                  dark: "/trademarks/wordmark-dark.svg",
                }}
              />
              <Logo
                wordmark={{
                  light: "/trademarks/wordmark-light.svg",
                  dark: "/trademarks/wordmark-dark.svg",
                }}
              />
            </Scroller>
            <Fade
              position="absolute"
              top="0"
              left="0"
              fillHeight
              width="12rem"
              s={{ width: "4rem" }}
              to="right"
            />
            <Fade
              position="absolute"
              top="0"
              right="0"
              fillHeight
              width="12rem"
              s={{ width: "4rem" }}
              to="left"
            />
          </Row>
          <Text onBackground="neutral-weak" textVariant="label-strong-s">
            Trusted by top brands around the globe
          </Text>
        </Column>
      </Column>
    </Column>
  );
};
