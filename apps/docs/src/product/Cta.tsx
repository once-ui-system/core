import { Row, Button, Mask, Particle, Text, Column } from "@once-ui-system/core";

export const Cta = () => {
  return (
    <Column fillWidth horizontal="center" borderBottom="neutral-alpha-medium" paddingX="l">
      <Row maxWidth="xl" paddingX="56">
        <Row borderTop="neutral-alpha-medium" borderLeft="neutral-alpha-medium" borderRight="neutral-alpha-medium" height="20" fillWidth topRadius="xl"/>
      </Row>
      <Row maxWidth="xl" paddingX="24">
        <Row borderTop="neutral-alpha-medium" borderLeft="neutral-alpha-medium" borderRight="neutral-alpha-medium" height="24" fillWidth topRadius="xl"/>
      </Row>
      <Row maxWidth="xl" height="m" center paddingX="l" topRadius="xl" gap="24" s={{direction: "column"}} borderTop="neutral-alpha-medium" borderLeft="neutral-alpha-medium" borderRight="neutral-alpha-medium" overflow="hidden">
        <Text align="center" variant="display-strong-m">
          Ship your product<Text onBackground="brand-medium">.</Text>
        </Text>
        <Row position="absolute" minWidth={80} minHeight={28} radius="full" border="brand-alpha-medium"/>
        <Row position="absolute" minWidth={58} minHeight={28} radius="full" border="brand-alpha-medium"/>
        <Row position="absolute" minWidth={42} minHeight={28} radius="full" border="brand-alpha-medium"/>
        <Row position="absolute" minWidth={28} minHeight={28} radius="full" border="brand-alpha-medium" overflow="hidden">
        <Mask fill
          position="absolute"
          x={50}
          y={50}
          radius={25}
          >
          <Particle style={{transform: "scale(1.1)"}} opacity={70} position="absolute" top="0" left="0" fill interactive speed={4} density={100} size="2" interactionRadius={50}/>
        </Mask>
        </Row>
        <Button data-border="rounded" id="hero-cta-button" href="/auth?signup" arrowIcon>
          Start now
        </Button>
      </Row>
    </Column>
  );
};