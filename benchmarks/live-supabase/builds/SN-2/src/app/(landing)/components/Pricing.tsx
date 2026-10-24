import { landingCopy, plans } from "@/content";
import { Column, Row } from "@once-ui-system/core";
import { Plan } from "./Plan";
import { SectionHeader } from "./SectionHeader";

const copy = landingCopy.sections.pricing;

export const Pricing = ({ ...flex }: React.ComponentProps<typeof Column>) => (
  <Column fillWidth horizontal="center" gap="48" {...flex}>
    <SectionHeader label={copy.label} title={copy.title} description={copy.description} />
    <Row fillWidth maxWidth="m" gap="12" s={{ direction: "column" }}>
      <Plan plan={plans.free} />
      <Plan plan={plans.team} />
    </Row>
  </Column>
);
