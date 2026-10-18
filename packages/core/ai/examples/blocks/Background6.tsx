import { Background, Mask, ParticleFx, Row } from "@once-ui-system/core";

/** Ambient hero layer: a brand floor glow and interactive particles (Waitlist1's background). */
export const Background6: React.FC<React.ComponentProps<typeof Row>> = ({ ...flex }) => {
  return (
    <Row position="absolute" top="0" left="0" fill overflow="hidden" {...flex}>
      <Background
        fill
        themeSolid="color"
        gradient={{
          display: true,
          x: "50%",
          y: "100%",
          width: "100%",
          height: "50%",
          colorStart: "brand-solid-strong",
          colorEnd: "static-transparent",
        }}
      />
      <Background
        fill
        position="absolute"
        bottom="0"
        left="0"
        blur="1rem"
        style={{ transform: "scale(1.1)" }}
        gradient={{
          display: true,
          x: "50%",
          y: "100%",
          width: "100%",
          height: "30%",
          colorStart: "brand-on-background-strong",
          colorEnd: "static-transparent",
        }}
      />
      <Mask position="absolute" top="0" left="0" x="50%" y="50%" radius="100vh">
        <ParticleFx
          opacity={70}
          fill
          interactive
          speed={3.33}
          intensity={40}
          pointerEvents="none"
        />
      </Mask>
    </Row>
  );
};
