import { Row, SmartLink, Text } from "@once-ui-system/core";
import { landingCopy } from "@/content";

const { banner } = landingCopy;

export const Banner = ({ ...flex }: React.ComponentProps<typeof Row>) => {
  return (
    <Row fillWidth paddingX="24" paddingY="12" center background="page" borderBottom {...flex}>
      <Text variant="label-default-s"><Text weight="strong">{banner.label}</Text> <SmartLink href={banner.href}>{banner.text}</SmartLink></Text>
    </Row>
  );
};