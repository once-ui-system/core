import { Background, HoloFx, Particle, Row } from "@once-ui-system/core";

export const Background3: React.FC<React.ComponentProps<typeof Row>> = ({ ...flex }) => {
  return (
    <Row fill position="absolute" top="0" left="0" horizontal="center" vertical="end" {...flex}>
      <Particle
        opacity={70}
        position="absolute"
        top="0"
        left="0"
        fill
        interactive
        speed={1}
        color="brand-on-background-strong"
        size="1"
        density={100}
      />
      <Particle
        opacity={70}
        position="absolute"
        top="0"
        left="0"
        fill
        interactive
        speed={0.5}
        color="brand-on-background-strong"
        size="2"
        density={40}
      />
      <Background
        fill
        position="absolute"
        top="0"
        left="0"
        gradient={{
          display: true,
          x: 50,
          y: 55,
          width: 80,
          height: 40,
          opacity: 50,
          colorStart: "brand-solid-strong",
          colorEnd: "static-transparent",
        }}
      />
      <HoloFx
        radius="full"
        overflow="hidden"
        minWidth={40}
        minHeight={40}
        texture={{
          opacity: 60,
          image: "url(/images/textures/foil.jpg)",
        }}
      >
        <Row background="page" radius="full" minWidth={40} minHeight={40} fill overflow="hidden">
          <Background
            fill
            position="absolute"
            top="0"
            left="0"
            gradient={{
              display: true,
              x: 50,
              y: -30,
              width: 100,
              height: 100,
              opacity: 100,
              colorStart: "brand-solid-strong",
              colorEnd: "static-transparent",
            }}
          />
          <Background
            fill
            position="absolute"
            top="0"
            left="0"
            mask={{
              x: 50,
              y: 10,
              radius: 20,
            }}
            gradient={{
              display: true,
              x: 50,
              y: 20,
              width: 30,
              height: 30,
              opacity: 100,
              colorStart: "brand-solid-strong",
              colorEnd: "static-transparent",
            }}
          />
        </Row>
      </HoloFx>
    </Row>
  );
};
