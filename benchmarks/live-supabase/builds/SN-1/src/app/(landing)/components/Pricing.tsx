import { landingCopy, plans } from "@/content";

const copy = landingCopy.sections.pricing;
import { Column, Row } from "@once-ui-system/core";
import { Plan } from "../pricing/components/Plan";
import { SectionHeader } from "./SectionHeader";

export const Pricing = ({ ...flex }: React.ComponentProps<typeof Column>) => (
  <Column fillWidth horizontal="center" gap="48" {...flex}>
    <SectionHeader
      label={copy.label}
      title={copy.title}
      description={copy.description}
    />
    <Row fillWidth maxWidth="m" gap="12" s={{ direction: "column" }}>
      <Plan plan={plans.free} />
      <Plan plan={plans.team} />
    </Row>
  </Column>
);
