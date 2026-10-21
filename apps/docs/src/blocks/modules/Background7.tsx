import { Background, Column, Heading, Media, Row, Text } from "@once-ui-system/core";

export const Background7: React.FC<React.ComponentProps<typeof Row>> = ({ ...flex }) => {
  return (
    <Row fill overflow="hidden" minHeight="48rem" {...flex}>
      <Background
        themeSolid="inverse"
        position="absolute"
        top="0"
        left="0"
        fill
        grid={{
          display: true,
          width: "1rem",
          height: "1rem",
          color: "brand-background-strong",
        }}
        mask={{ x: "50%", y: "55%", radius: "65vh" }}
      />
      <Background
        themeSolid="inverse"
        position="absolute"
        top="0"
        left="0"
        fill
        gradient={{
          display: true,
          colorStart: "brand-solid-medium",
          y: "80%",
          width: "40%",
          height: "64%",
        }}
      />
      <Background
        position="absolute"
        bottom="0"
        left="0"
        fill
        gradient={{
          display: true,
          x: "50%",
          y: "100%",
          width: "75%",
          colorStart: "brand-background-strong",
        }}
      />
      <Media
        pointerEvents="none"
        style={{ mixBlendMode: "color-dodge" }}
        position="absolute"
        bottom="0"
        left="0"
        sizes="(max-width: 1440px) 100vw, 1440px"
        src="/videos/smoke.mp4"
        alt="Atmospheric smoke effect"
      />
      <Column fillWidth horizontal="center" padding="xl" gap="16" zIndex={1}>
        <Column maxWidth="40rem" gap="12" horizontal="center">
          <Text textVariant="heading-default-xl" onBackground="brand-weak" align="center">
            Atmospheric hero shell
          </Text>
          <Heading as="h2" textVariant="display-default-s" align="center">
            Grid mask, brand gradient, and smoke video layered for product landing pages
          </Heading>
        </Column>
      </Column>
    </Row>
  );
};
