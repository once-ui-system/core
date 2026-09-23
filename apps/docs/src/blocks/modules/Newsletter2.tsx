import { Button, Column, Heading, Input, Logo, Row, Text } from "@once-ui-system/core";

export const Newsletter2: React.FC<React.ComponentProps<typeof Row>> = ({ ...flex }) => {
  return (
    <Row fillWidth fitHeight borderTop="neutral-medium" borderBottom="neutral-medium" {...flex}>
      <Row borderRight="neutral-medium" flex={1} />
      <Column maxWidth="s" minWidth={24} flex={3} horizontal="center">
        <Column padding="32" fillWidth horizontal="center" gap="12">
          <Logo size="l" dark icon="/trademarks/icon-dark.svg" />
          <Logo size="l" light icon="/trademarks/icon-light.svg" />
          <Heading marginTop="12" align="center" variant="heading-strong-l">
            The product brief, once a month
          </Heading>
          <Text
            variant="body-default-m"
            align="center"
            wrap="balance"
            marginBottom="20"
            onBackground="neutral-medium"
          >
            Practical notes on product craft, interface systems, and the decisions behind each
            release
          </Text>
          <Row maxWidth={20}>
            <Input
              label="Work email"
              placeholder="you@company.com"
              id="newsletter-email"
              type="email"
              required
            />
          </Row>
          <Button id="newsletter-button-2" size="m" arrowIcon>
            Join the product brief
          </Button>
        </Column>
      </Column>
      <Row borderLeft="neutral-medium" flex={1} />
    </Row>
  );
};
