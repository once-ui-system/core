import {
  Background,
  Button,
  Column,
  Heading,
  Line,
  Mask,
  Media,
  Row,
  Text,
} from "@once-ui-system/core";

export const Hero9: React.FC<React.ComponentProps<typeof Row>> = ({ ...flex }) => {
  return (
    <Column fillWidth horizontal="center" {...flex}>
      <Background
        position="absolute"
        bottom="0"
        left="0"
        gradient={{
          display: true,
          x: 50,
          y: 100,
          width: 50,
          colorStart: "brand-background-strong",
        }}
      />
      <Media
        pointerEvents="none"
        style={{ mixBlendMode: "color-dodge" }}
        position="absolute"
        bottom="0"
        sizes="(max-width: 1440px) 100vw, 1440px"
        src="/videos/smoke.mp4"
        alt="Smoke effect"
      />
      <Column fillWidth horizontal="center" paddingX="l" paddingBottom="104">
        <Column maxWidth="m" horizontal="center" paddingX="l">
          <Heading variant="display-strong-l" align="center" marginBottom="32">
            Launch apps without writing a single line of code
          </Heading>
          <Text
            wrap="balance"
            variant="heading-default-xl"
            align="center"
            onBackground="neutral-medium"
            marginBottom="40"
          >
            Quick start with pre-built app templates and fine-tune with copy-paste blocks
          </Text>
          <Button>Get started</Button>
        </Column>
      </Column>
      <Row position="absolute" bottom="0" left="0" fillWidth height="1">
        <Mask x={50} y={50} radius={75}>
          <Line background="brand-alpha-medium" />
        </Mask>
      </Row>
    </Column>
  );
};
