import { Background, Button, Column, Heading, Input, Logo, Row, Text } from "@once-ui-system/core";

export const Newsletter1: React.FC<React.ComponentProps<typeof Column>> = ({ ...flex }) => {
  return (
    <Column
      overflow="hidden"
      fillWidth
      fitHeight
      padding="xl"
      radius="l"
      horizontal="center"
      align="center"
      background="surface"
      border
      shadow="xl"
      {...flex}
    >
      <Background
        top="0"
        left="0"
        position="absolute"
        mask={{
          x: 100,
          y: 0,
          radius: 150,
        }}
        gradient={{
          display: true,
          x: 100,
          y: 20,
          tilt: -5,
          width: 100,
          height: 50,
          colorStart: "danger-solid-strong",
          colorEnd: "static-transparent",
        }}
      />
      <Background
        top="0"
        left="0"
        position="absolute"
        gradient={{
          display: true,
          x: 50,
          y: 0,
          width: 75,
          height: 50,
          colorStart: "brand-background-strong",
          colorEnd: "static-transparent",
        }}
      />
      <Background
        top="0"
        left="0"
        position="absolute"
        mask={{
          x: 0,
          y: 0,
          radius: 150,
        }}
        gradient={{
          display: true,
          x: 25,
          y: 0,
          tilt: -30,
          width: 100,
          height: 50,
          colorStart: "accent-solid-strong",
          colorEnd: "static-transparent",
        }}
      />
      <Background
        top="0"
        left="0"
        position="absolute"
        mask={{
          x: 50,
          y: 0,
          radius: 100,
        }}
        dots={{
          display: true,
          size: "2",
          color: "page-background",
          opacity: 100,
        }}
      />
      <Column horizontal="center" maxWidth="xs" gap="12">
        <Logo size="l" dark icon="/trademarks/icon-dark.svg" />
        <Logo size="l" light icon="/trademarks/icon-light.svg" />
        <Heading marginTop="12" variant="display-strong-xs">
          Building the future together
        </Heading>
        <Text
          variant="body-default-l"
          wrap="balance"
          marginBottom="l"
          onBackground="neutral-medium"
        >
          Be the first to know about new features and the latest updates
        </Text>
      </Column>
      <Row center gap="8" fillWidth s={{ direction: "column" }} horizontal="center">
        <Row maxWidth={20}>
          <Input placeholder="Email" id="newsletter-email" type="email" required />
        </Row>
        <Button id="newsletter-button" size="m" arrowIcon>
          Sign up
        </Button>
      </Row>
    </Column>
  );
};
