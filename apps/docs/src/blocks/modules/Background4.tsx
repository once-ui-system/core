import { Background, ParticleFx, Row } from "@once-ui-system/core";

export const Background4: React.FC<React.ComponentProps<typeof Row>> = ({ ...flex }) => {
  return (
    <Row fillWidth center {...flex}>
      <Row
        position="absolute"
        minWidth="74rem"
        minHeight="28rem"
        radius="full"
        border="brand-alpha-weak"
      />
      <Row
        position="absolute"
        minWidth="58rem"
        minHeight="28rem"
        radius="full"
        border="brand-alpha-weak"
      />
      <Row
        position="absolute"
        minWidth="45rem"
        minHeight="28rem"
        radius="full"
        border="brand-alpha-medium"
      />
      <Row
        position="absolute"
        minWidth="35rem"
        minHeight="28rem"
        radius="full"
        border="brand-alpha-medium"
      />
      <Row
        position="absolute"
        minWidth="28rem"
        minHeight="28rem"
        radius="full"
        border="brand-alpha-strong"
        overflow="hidden"
      >
        <Background
          fill
          position="absolute"
          gradient={{
            display: true,
            x: "50%",
            y: "50%",
            width: "100%",
            height: "60%",
            opacity: 100,
            colorStart: "brand-alpha-weak",
            colorEnd: "static-transparent",
          }}
          mask={{
            x: "50%",
            y: "50%",
            radius: "25vh",
          }}
        >
          <ParticleFx
            style={{ transform: "scale(1.1)" }}
            opacity={70}
            position="absolute"
            top="0"
            left="0"
            fill
            interactive
            speed={13.33}
            size="1"
            intensity={50}
          />
        </Background>
      </Row>
    </Row>
  );
};
