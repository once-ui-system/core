import {
  Background,
  Column,
  Heading,
  HoloFx,
  Icon,
  IconButton,
  Input,
  Row,
  Text,
  TiltFx,
} from "@once-ui-system/core";

export const BankCard: React.FC<React.ComponentProps<typeof Column>> = ({ ...flex }) => {
  return (
    <Row paddingX="32" fillWidth gap="64" vertical="center" s={{ direction: "column" }} {...flex}>
      <Row
        shadow="xl"
        fillWidth
        border="neutral-alpha-medium"
        padding="4"
        borderStyle="dashed"
        radius="xl-4"
      >
        <TiltFx
          aspectRatio="16 / 9"
          fillWidth
          radius="xl"
          border="accent-alpha-weak"
          overflow="hidden"
        >
          <HoloFx
            fill
            texture={{
              opacity: 0,
            }}
          >
            <Background
              fill
              position="absolute"
              gradient={{
                display: true,
                tilt: -45,
                height: 150,
                width: 100,
                x: 75,
                y: -50,
                colorStart: "brand-solid-strong",
                colorEnd: "accent-solid-weak",
              }}
            />
          </HoloFx>
          <Column
            fill
            position="absolute"
            pointerEvents="none"
            padding="24"
            vertical="end"
            gap="12"
            onSolid="neutral-strong"
          >
            <Text variant="body-default-xl">Lorant One</Text>
            <Row fillWidth horizontal="between" vertical="end" paddingRight="16">
              <Column gap="4">
                <Text variant="body-default-m">08 / 27</Text>
                <Text variant="body-default-m">1234 5678 1234 5678</Text>
              </Column>
              <Icon name="visa" size="xl" />
            </Row>
          </Column>
        </TiltFx>
      </Row>
      <Column fillWidth gap="-1">
        <Row fillWidth vertical="center" horizontal="between" marginBottom="32">
          <Heading as="h3" variant="display-default-xs">
            Fill in your card details
          </Heading>
          <IconButton
            data-border="rounded"
            variant="tertiary"
            icon="chevronRight"
            tooltip="Next"
            tooltipPosition="left"
          />
        </Row>
        <Input
          id="cardnumber"
          placeholder="Card number"
          corners="top"
          autoComplete="off"
          defaultValue="1234 5678 1234 5678"
        />
        <Row fillWidth gap="-1">
          <Input
            id="expiry"
            placeholder="Expiry date"
            corners="bottom-left"
            autoComplete="off"
            defaultValue="08 / 27"
          />
          <Input
            id="cvv"
            placeholder="CVV"
            corners="bottom-right"
            autoComplete="off"
            defaultValue="123"
          />
        </Row>
      </Column>
    </Row>
  );
};
