import {
  Background,
  Badge,
  Button,
  Column,
  Heading,
  Mask,
  MatrixFx,
  Media,
  RevealFx,
  Row,
} from "@once-ui-system/core";

export const Hero6: React.FC<React.ComponentProps<typeof Row>> = ({ ...flex }) => {
  return (
    <Column fillWidth horizontal="center" {...flex}>
      <Mask
        maxWidth="xl"
        aspectRatio="16 / 9"
        position="absolute"
        left="0"
        x={50}
        y={50}
        radius={75}
      >
        <MatrixFx
          flicker
          fps={40}
          data-solid="color"
          style={{ maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)" }}
          colors={["brand-solid-strong", "accent-solid-strong"]}
          size={2}
          spacing={4}
          bulge={{
            duration: 2,
            intensity: 10,
            repeat: false,
          }}
        />
      </Mask>
      <Column maxWidth="l" gap="32" paddingX="l" paddingTop="xl">
        <Column maxWidth="s" gap="24">
          <Badge background="brand-weak" marginBottom="12" href="#">
            <Background
              position="absolute"
              left="0"
              top="0"
              fill
              gradient={{
                display: true,
                colorStart: "brand-background-strong",
                y: 100,
                width: 50,
                height: 80,
              }}
              pointerEvents="none"
            />
            <Row>Claim your gift</Row>
          </Badge>
          <Heading variant="display-strong-l">We speak CSS natively</Heading>
          <Heading
            wrap="balance"
            onBackground="neutral-weak"
            variant="heading-default-m"
            marginBottom="8"
          >
            Once UI Pro is a collection of ready-to-use templates and building blocks that you can
            use to create your next project.
          </Heading>
          <Row gap="8" data-border="rounded" marginTop="12">
            <Button href="#">Start for free</Button>
            <Row radius="full" background="brand-weak" border="brand-alpha-weak">
              <Button href="#" variant="secondary">
                See demo
              </Button>
            </Row>
          </Row>
        </Column>
        <Row
          fillWidth
          background="overlay"
          aspectRatio="16 / 9"
          radius="l"
          overflow="hidden"
          border
          style={{
            backdropFilter: "blur(0.25rem)",
            left: "50%",
            transform:
              "translateY(0rem) translateX(-40%) scaleY(1.2) scaleX(1.4) rotateX(30deg) rotateY(20deg) rotate(335deg)",
            transformOrigin: "center",
            transformStyle: "preserve-3d",
            maskImage:
              "linear-gradient(to right, black 80%, transparent 100%), linear-gradient(to bottom, black 60%, transparent 100%)",
            maskComposite: "intersect",
          }}
        >
          <RevealFx>
            <Media
              sizes="(max-width: 1440px) 100vw, 1440px"
              src="/images/og/home.jpg"
              alt="Product image example"
            />
          </RevealFx>
        </Row>
      </Column>
    </Column>
  );
};
