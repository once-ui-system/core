import { Column, Row } from "@once-ui-system/core";
import { ctaLayouts } from "./layouts.js";
import { choice } from "./props.js";
import {
  SectionActions,
  type SectionBaseProps,
  SectionHeader,
  SectionShell,
  sectionWidth,
} from "./shared.js";

export interface CtaSectionProps extends SectionBaseProps {
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

// The one thing to do next, usually the page's last section. `banner` sets
// it on a band of the brand colour, `split` puts the words and the buttons on
// one line in a frame, `minimal` leaves it unframed and centred.
export function CtaSection(props: CtaSectionProps) {
  const layout = choice(props.layout, ctaLayouts, "banner");
  const width = sectionWidth(props.width);
  const buttons = {
    primaryLabel: props.primaryLabel,
    primaryHref: props.primaryHref,
    secondaryLabel: props.secondaryLabel,
    secondaryHref: props.secondaryHref,
    resolveHref: props.resolveHref,
  };
  const heading = { eyebrow: props.eyebrow, title: props.title, description: props.description };

  if (layout === "split") {
    return (
      <SectionShell width={width}>
        <Row
          fillWidth
          gap="32"
          padding="48"
          vertical="center"
          horizontal="between"
          radius="xl"
          border
          background="surface"
          m={{ direction: "column", vertical: "start", padding: "32" }}
          s={{ padding: "24" }}
        >
          <SectionHeader {...heading} maxWidth="32rem" />
          <SectionActions {...buttons} size="l" />
        </Row>
      </SectionShell>
    );
  }

  if (layout === "minimal") {
    return (
      <SectionShell width={width} horizontal="center" gap="32">
        <SectionHeader {...heading} center />
        <SectionActions {...buttons} center size="l" />
      </SectionShell>
    );
  }

  return (
    <SectionShell width={width}>
      <Column
        fillWidth
        horizontal="center"
        gap="32"
        paddingX="48"
        paddingY="64"
        radius="xl"
        border="brand-alpha-medium"
        background="brand-alpha-weak"
        s={{ paddingX: "24", paddingY: "40" }}
      >
        <SectionHeader {...heading} center />
        <SectionActions {...buttons} center size="l" />
      </Column>
    </SectionShell>
  );
}
