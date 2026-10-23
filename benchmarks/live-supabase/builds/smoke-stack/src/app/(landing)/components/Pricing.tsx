import { plans } from "@/content";
import { Column, Row, SmartLink, Text } from "@once-ui-system/core";
import { Plan } from "../pricing/components/Plan";
import { SectionHeader } from "./SectionHeader";

export const Pricing = ({ ...flex }: React.ComponentProps<typeof Column>) => (
  <Column fillWidth horizontal="center" gap="48" {...flex}>
    <SectionHeader
      label="Pricing"
      title="Simple pricing, no surprises"
      description="Start for free. Upgrade when you need more."
    />
    <Row fillWidth maxWidth="m" gap="12" s={{ direction: "column" }}>
      <Plan plan={plans.free} />
      <Plan plan={plans.pro} />
    </Row>
    <Text variant="body-default-s" onBackground="neutral-weak">
      <SmartLink href="/pricing" suffixIcon="chevronRight">
        Compare plans
      </SmartLink>
    </Text>
  </Column>
);
