import { Column, Heading, Row, Text } from "@once-ui-system/core";
import { LineChart } from "@once-ui-system/core/data";

export const Features11: React.FC<React.ComponentProps<typeof Row>> = ({ ...flex }) => {
  return (
    <Row fillWidth {...flex}>
      <Row fillWidth padding="xl" background="page">
        <LineChart
          fillHeight
          height={undefined}
          position="absolute"
          pointerEvents="none"
          radius="l"
          overflow="hidden"
          left="0"
          top="0"
          axis="none"
          legend={{ display: false }}
          series={[{ key: "performance", color: "cyan" }]}
          data={[
            { value: 1, performance: 1 },
            { value: 2, performance: 2 },
            { value: 3, performance: 4 },
            { value: 4, performance: 8 },
            { value: 5, performance: 16 },
            { value: 6, performance: 32 },
            { value: 7, performance: 64 },
            { value: 8, performance: 116 },
            { value: 9, performance: 128 },
          ]}
        />
        <Column maxWidth={40} padding="16" background="page" border>
          <Heading as="h2" variant="display-strong-s" marginBottom="32">
            Watch your orders skyrocket
          </Heading>
          <Text marginBottom="24" variant="heading-default-l" wrap="balance">
            Focus on marketing and sales, not design, maintenance and inventory management.
            Everything is handled for you.
          </Text>
          <Text variant="label-default-s" onBackground="neutral-weak" wrap="balance">
            No more stress, no more worries.
          </Text>
        </Column>
      </Row>
    </Row>
  );
};
