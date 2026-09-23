import { Background, Particle, Row } from "@once-ui-system/core";

export const Background1: React.FC<React.ComponentProps<typeof Row>> = ({ ...flex }) => {
  return (
    <Row position="absolute" fill {...flex}>
      <Particle
        opacity={70}
        position="absolute"
        top="0"
        left="0"
        fill
        interactive
        speed={1}
        size="2"
        density={100}
        intensity={10}
        pointerEvents="none"
      />
      <Background
        gradient={{
          display: true,
          x: 100,
          y: 0,
          width: 150,
          height: 100,
          colorStart: "accent-solid-strong",
          colorEnd: "static-transparent",
        }}
      />
      <Background
        position="absolute"
        top="0"
        left="0"
        gradient={{
          display: true,
          x: 50,
          y: -25,
          colorStart: "brand-background-strong",
          colorEnd: "static-transparent",
        }}
      />
    </Row>
  );
};
