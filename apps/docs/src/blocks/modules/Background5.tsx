import { Background, Row } from "@once-ui-system/core";

export const Background5: React.FC<React.ComponentProps<typeof Row>> = ({ ...flex }) => {
  return (
    <Row position="absolute" fill {...flex}>
      <Background
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
        position="absolute"
        top="0"
        left="0"
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
        position="absolute"
        top="0"
        left="0"
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
        position="absolute"
        top="0"
        left="0"
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
    </Row>
  );
};
