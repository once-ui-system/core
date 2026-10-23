import { Row, Text } from "@once-ui-system/core";

export const Banner = ({ ...flex }: React.ComponentProps<typeof Row>) => {
  return (
    <Row fillWidth paddingX="24" paddingY="12" center background="page" borderBottom {...flex}>
      <Text variant="label-default-s"><Text weight="strong">Special offer:</Text> 20% off all plans this month!</Text>
    </Row>
  );
};