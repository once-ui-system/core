import { Background, Mask, Particle, Row } from "@once-ui-system/core";

export const Background6: React.FC<React.ComponentProps<typeof Row>> = ({ ...flex }) => {
  return (
    <Row position="absolute" fill overflow="hidden" {...flex}>
      <Background
        fill
        data-solid="color"
        gradient={{
          display: true,
          x: 50,
          y: 100,
          width: 100,
          height: 50,
          colorStart: "brand-solid-strong",
          colorEnd: "static-transparent",
        }}
      />
      <Background
        fill
        position="absolute"
        bottom="0"
        left="0"
        style={{ filter: "blur(1rem)", transform: "scale(1.1)" }}
        gradient={{
          display: true,
          x: 50,
          y: 100,
          width: 100,
          height: 30,
          colorStart: "brand-on-background-strong",
          colorEnd: "static-transparent",
        }}
      />
      <Mask position="absolute" top="0" left="0" x={50} y={50} radius={100}>
        <Particle
          opacity={70}
          fill
          interactive
          speed={1}
          size="2"
          density={100}
          intensity={40}
          pointerEvents="none"
        />
      </Mask>
    </Row>
  );
};
