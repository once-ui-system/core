import {
  Button,
  Column,
  Heading,
  Input,
  Logo,
  Mask,
  MatrixFx,
  Row,
  Text,
} from "@once-ui-system/core";

export const Newsletter4: React.FC<React.ComponentProps<typeof Column>> = ({ ...flex }) => {
  return (
    <Column
      overflow="hidden"
      fillWidth
      gap="l"
      radius="xl"
      horizontal="center"
      border
      s={{ direction: "column" }}
      {...flex}
    >
      <Mask position="absolute" left="0" top="0" x={50} y={50} radius={50} aspectRatio="1/1" center>
        <MatrixFx
          data-solid="color"
          flicker
          fps={40}
          size={2}
          spacing={3}
          colors={["brand-solid-strong"]}
          bulge={{
            duration: 4,
            intensity: 12,
            repeat: true,
          }}
        />
      </Mask>
      <Column maxWidth="xs" gap="20" padding="xl" horizontal="center" align="center">
        <Logo dark icon="/trademarks/icon-dark.svg" size="xl" />
        <Logo light icon="/trademarks/icon-light.svg" size="xl" />
        <Heading variant="display-strong-xs" marginTop="16">
          Stay updated and enjoy 10% off
        </Heading>
        <Text wrap="balance" marginBottom="32" onBackground="neutral-weak">
          Get the latest news and updates about Once UI
        </Text>
        <Row maxWidth={18}>
          <Input
            placeholder="Email"
            id="newsletter-email"
            type="email"
            size="s"
            required
            suffix={
              <Button
                size="s"
                style={{ marginRight: "-0.325rem" }}
                id="newsletter-button"
                arrowIcon
              >
                Sign up
              </Button>
            }
          />
        </Row>
      </Column>
    </Column>
  );
};
