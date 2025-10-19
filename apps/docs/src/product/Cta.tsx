import { Row, Button, Mask, Particle, Column, TypeFx, Background } from "@once-ui-system/core";

export const Cta = () => {
  return (
    <Row fillWidth horizontal="center">
      <Row flex={1} border="neutral-alpha-medium" radius="full" minWidth={4} l={{hide: true}}/>
      <Column maxWidth="xl" height="m" center paddingX="l" gap="24" s={{direction: "column"}} borderLeft="neutral-alpha-medium" borderRight="neutral-alpha-medium" overflow="hidden">
        <Background
          position="absolute"
          fill
          lines={{
            display: true,
            color: "neutral-alpha-weak",
            angle: -45,
            size: "4"
          }}/>
        <Row overflow="hidden" position="absolute" minWidth={80} minHeight={28} radius="full" border="neutral-alpha-medium">
          <Background
            fill
            position="absolute"
            bottom="0"
            left="0"
            data-solid="color"
            gradient={{
              display: true,
              x: 50,
              y: 100,
              width: 100,
              height: 50,
              colorStart: "brand-solid-strong",
              colorEnd: "page-background",
            }}
          />
          <Background
            fill
            position="absolute"
            bottom="0"
            left="0"
            style={{filter: "blur(1rem)", transform: "scale(1.1)"}}
            gradient={{
              display: true,
              x: 50,
              y: 100,
              width: 100,
              height: 30,
              colorStart: "brand-on-background-strong",
            }}
          />
          </Row>
          <Row overflow="hidden" position="absolute" minWidth={58} minHeight={28} radius="full" border="neutral-alpha-medium"/>
          <Row overflow="hidden" position="absolute" minWidth={42} minHeight={28} radius="full" border="neutral-alpha-medium"/>
          <Row overflow="hidden" position="absolute" minWidth={28} minHeight={28} radius="full" border="neutral-alpha-medium">
          <Mask fill
            position="absolute"
            x={50}
            y={50}
            radius={25}
            >
            <Particle style={{transform: "scale(1.1)"}} opacity={70} position="absolute" top="0" left="0" fill interactive speed={1.5} density={100} size="2" intensity={20} mode="attract"/>
          </Mask>
        </Row>
        <Column horizontal="center" gap="20">
          <TypeFx
            variant="display-strong-m"
            words={["Ship your product.", "Build a presence.", "Launch seamlessly."]}
            speed={80}
            hold={2000}
            trigger="instant"
          />
          <Button data-border="rounded" id="hero-cta-button" href="https://once-ui.com/auth?signup" arrowIcon>
            Start now
          </Button>
        </Column>
      </Column>
      <Row flex={1} border="neutral-alpha-medium" radius="full" minWidth={4} l={{hide: true}}/>
    </Row>
  );
};