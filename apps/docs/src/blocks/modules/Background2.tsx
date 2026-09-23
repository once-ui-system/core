import { Background, Row } from "@once-ui-system/core";

export const Background2: React.FC<React.ComponentProps<typeof Row>> = ({ ...flex }) => {
  return (
    <Row position="absolute" fill {...flex}>
      <Background
        mask={{
          x: 60,
          y: 0,
          radius: 100,
        }}
        gradient={{
          display: true,
          tilt: -35,
          height: 75,
          width: 150,
          x: 100,
          y: 40,
          colorStart: "accent-solid-medium",
          colorEnd: "static-transparent",
        }}
        dots={{
          display: true,
          size: "2",
          color: "accent-solid-medium",
          opacity: 50,
        }}
      />
      <Background
        position="absolute"
        top="0"
        left="0"
        data-solid="color"
        mask={{
          cursor: true,
          radius: 100,
        }}
        gradient={{
          display: true,
          opacity: 100,
          tilt: -35,
          height: 50,
          width: 120,
          x: 80,
          y: 50,
          colorStart: "brand-solid-strong",
          colorEnd: "static-transparent",
        }}
      />
      <Background
        position="absolute"
        top="0"
        left="0"
        mask={{
          x: 0,
          y: 100,
          radius: 150,
        }}
        gradient={{
          display: true,
          opacity: 100,
          tilt: -35,
          height: 100,
          width: 120,
          x: 25,
          y: 50,
          colorStart: "page-background",
          colorEnd: "static-transparent",
        }}
      />
    </Row>
  );
};
