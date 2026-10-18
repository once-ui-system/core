import { Tag, Button, Column, Heading, Line, StatusIndicator, Row, Text } from "@once-ui-system/core";
import { ShineFx } from "@once-ui-system/fx";

export const Hero11: React.FC<React.ComponentProps<typeof Row>> = ({ ...flex }) => {
  return (
    <Row fillWidth horizontal="center" paddingX="8" borderY {...flex}>
      <Column maxWidth="l" borderX>
        <Column fillWidth paddingX="8" paddingY="160">
          <Row fillWidth vertical="center" gap="8">
            <Line flex={1} maxWidth="16" background="neutral-alpha-weak" />
            <Tag variant="announce"
              border
              background="overlay"
              paddingY="4"
              paddingLeft="4"
              paddingRight="20"
              pointerEvents="none"
            >
              <StatusIndicator pulse marginRight="8" style={{ opacity: 0.6 }} />
              <Text wrap="nowrap" weight="default">
                <ShineFx inverse duration={3000} baseOpacity={0.7}>
                  Launch your product ecosystem
                </ShineFx>
              </Text>
            </Tag>
            <Line flex={1} background="neutral-alpha-weak" />
          </Row>
          <Column fillWidth gap="16" paddingX="24" paddingY="48">
            <Heading textVariant="display-default-m">
              I design and build full frontend systems for modern products –{" "}
              <Text onBackground="brand-weak">
                from landing pages to documentation, dashboards, and more
              </Text>{" "}
              – faster than you'd expect.
            </Heading>
          </Column>
          <Row fillWidth vertical="center" gap="8">
            <Line flex={1} maxWidth="16" background="neutral-alpha-weak" />
            <Button id="to_pricing" href="#pricing" arrowIcon>
              See plans
            </Button>
            <Line flex={1} background="neutral-alpha-weak" />
          </Row>
        </Column>
      </Column>
    </Row>
  );
};
