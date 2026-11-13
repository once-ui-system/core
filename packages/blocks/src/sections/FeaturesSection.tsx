import { Column, Grid, Heading, Row, Text } from "@once-ui-system/core";
import { featuresLayouts, SECTION_COLUMNS } from "./layouts.js";
import { choice, rows, text } from "./props.js";
import {
  type SectionBaseProps,
  SectionHeader,
  SectionIcon,
  SectionShell,
  sectionWidth,
} from "./shared.js";

export interface FeaturesSectionProps extends SectionBaseProps {
  columns?: string;
  items?: { icon?: string; title?: string; description?: string }[];
}

type Feature = { key: string; icon: string; title: string; description: string };

/** The icon in a soft brand tile, the same in every layout. */
function FeatureIcon({ name }: { name: string }) {
  return name ? <SectionIcon name={name} /> : null;
}

function FeatureText({ feature }: { feature: Feature }) {
  return (
    <Column gap="8">
      {feature.title && (
        <Heading as="h3" textVariant="heading-strong-s">
          {feature.title}
        </Heading>
      )}
      {feature.description && (
        <Text textVariant="body-default-s" onBackground="neutral-weak" wrap="pretty">
          {feature.description}
        </Text>
      )}
    </Column>
  );
}

// What a product or a service does, one item per point, arranged by `layout`:
// a grid of cards, an unframed two-column list, or the heading beside a
// column of points.
export function FeaturesSection(props: FeaturesSectionProps) {
  const layout = choice(props.layout, featuresLayouts, "cards");
  const width = sectionWidth(props.width);
  const columns = Number(choice(props.columns, SECTION_COLUMNS, "3")) as 2 | 3 | 4;
  const features: Feature[] = rows(props.items)
    .map((item, index) => ({
      key: `${index}-${text(item.title)}`,
      icon: text(item.icon),
      title: text(item.title),
      description: text(item.description),
    }))
    .filter((f) => f.title || f.description);

  const header = (
    <SectionHeader eyebrow={props.eyebrow} title={props.title} description={props.description} />
  );

  if (layout === "split") {
    return (
      <SectionShell width={width}>
        <Row fillWidth gap="64" m={{ direction: "column", gap: "32" }}>
          <Column flex={2} m={{ flex: "0" }}>
            {header}
          </Column>
          <Column flex={3} m={{ flex: "0" }} fillWidth>
            {features.map((feature, index) => (
              <Row
                key={feature.key}
                fillWidth
                gap="20"
                paddingY="24"
                borderTop={index === 0 ? undefined : "neutral-alpha-weak"}
              >
                <FeatureIcon name={feature.icon} />
                <FeatureText feature={feature} />
              </Row>
            ))}
          </Column>
        </Row>
      </SectionShell>
    );
  }

  if (layout === "list") {
    return (
      <SectionShell width={width}>
        {header}
        <Grid fillWidth columns="2" s={{ columns: 1 }} gap="40">
          {features.map((feature) => (
            <Row key={feature.key} gap="20">
              <FeatureIcon name={feature.icon} />
              <FeatureText feature={feature} />
            </Row>
          ))}
        </Grid>
      </SectionShell>
    );
  }

  return (
    <SectionShell width={width}>
      {header}
      <Grid fillWidth columns={columns} m={{ columns: 2 }} s={{ columns: 1 }} gap="24">
        {features.map((feature) => (
          <Column key={feature.key} background="surface" border radius="l" padding="24" gap="16">
            <FeatureIcon name={feature.icon} />
            <FeatureText feature={feature} />
          </Column>
        ))}
      </Grid>
    </SectionShell>
  );
}
