import {
  AutoScroll,
  Background,
  Badge,
  Button,
  Column,
  Fade,
  Heading,
  Logo,
  Row,
  Tag,
  Text,
} from "@once-ui-system/core";

export const Hero3: React.FC<React.ComponentProps<typeof Row>> = ({ ...flex }) => {
  return (
    <Column fillWidth fitHeight horizontal="center" align="center">
      <Background
        position="absolute"
        top="0"
        left="0"
        mask={{ x: 50, y: 0, radius: 50 }}
        dots={{ display: true, color: "neutral-alpha-weak", size: "2" }}
      />
      <Column maxWidth="xs" gap="32" fitHeight horizontal="center" {...flex}>
        <Column horizontal="center" gap="24" marginBottom="32">
          <Badge
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
            <Tag size="l" scheme="brand" marginRight="12">
              <Text variant="body-strong-xs">WWUI</Text>
            </Tag>
            <Text variant="label-default-s">Claim your ticket</Text>
          </Badge>
          <Heading variant="display-default-l" marginTop="12">
            Start with templates
            <br />
            <Text onBackground="brand-weak">Customize with blocks</Text>
          </Heading>
          <Heading
            wrap="balance"
            onBackground="neutral-medium"
            variant="body-default-l"
            marginBottom="16"
          >
            Once UI provides out-of-the-box solutions for advanced UI challenges. You can launch a
            functional business with Once UI — not just a shiny site.
          </Heading>
          <Row gap="8">
            <Button href="#">Ship your app</Button>
            <Button href="#" variant="secondary">
              Request a demo
            </Button>
          </Row>
          <Row fillWidth paddingY="24" maxWidth={40}>
            <AutoScroll dark marginTop="xl" opacity={50}>
              <Logo wordmark="/trademarks/wordmark-dark.svg" />
              <Logo wordmark="/trademarks/wordmark-dark.svg" />
              <Logo wordmark="/trademarks/wordmark-dark.svg" />
              <Logo wordmark="/trademarks/wordmark-dark.svg" />
              <Logo wordmark="/trademarks/wordmark-dark.svg" />
            </AutoScroll>
            <AutoScroll light marginTop="xl" opacity={50}>
              <Logo wordmark="/trademarks/wordmark-light.svg" />
              <Logo wordmark="/trademarks/wordmark-light.svg" />
              <Logo wordmark="/trademarks/wordmark-light.svg" />
              <Logo wordmark="/trademarks/wordmark-light.svg" />
              <Logo wordmark="/trademarks/wordmark-light.svg" />
            </AutoScroll>
            <Fade position="absolute" top="0" left="0" fillHeight width={12} to="right" />
            <Fade position="absolute" top="0" right="0" fillHeight width={12} to="left" />
          </Row>
          <Text onBackground="neutral-weak" variant="label-strong-s">
            Trusted by top brands around the globe
          </Text>
        </Column>
      </Column>
    </Column>
  );
};
