import { Button, Column, Grid, Heading, Icon, Line, Row, Tag, Text } from "@once-ui-system/core";
import { pricingLayouts } from "./layouts.js";
import { action, choice, flag, lines, rows, text } from "./props.js";
import { type SectionBaseProps, SectionHeader, SectionShell, sectionWidth } from "./shared.js";

export interface PricingSectionProps extends SectionBaseProps {
  /** The plans; `features` takes one feature per line. */
  items?: {
    name?: string;
    price?: string;
    period?: string;
    description?: string;
    features?: string;
    ctaLabel?: string;
    ctaHref?: string;
    badge?: string;
    highlighted?: boolean;
  }[];
}

type Plan = {
  key: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: { label: string; href: string } | null;
  badge: string;
  highlighted: boolean;
};

const columnsFor = (count: number) => Math.min(4, Math.max(1, count)) as 1 | 2 | 3 | 4;

function PlanPrice({ plan }: { plan: Plan }) {
  if (!plan.price) return null;
  return (
    <Row gap="4" vertical="end" wrap>
      <Text textVariant="display-strong-s" onBackground="neutral-strong">
        {plan.price}
      </Text>
      {plan.period && (
        <Text textVariant="body-default-s" onBackground="neutral-weak" marginBottom="4">
          {plan.period}
        </Text>
      )}
    </Row>
  );
}

function PlanFeatures({ features, inline = false }: { features: string[]; inline?: boolean }) {
  if (features.length === 0) return null;
  const items = features.map((feature, index) => (
    <Row
      // biome-ignore lint/suspicious/noArrayIndexKey: a feature line has no identity beyond its text and order
      key={`${index}-${feature}`}
      as="li"
      gap="8"
      vertical="start"
    >
      <Icon name="check" size="s" onBackground="brand-medium" />
      <Text textVariant="body-default-s" onBackground="neutral-medium">
        {feature}
      </Text>
    </Row>
  ));
  return inline ? (
    <Row as="ul" margin="0" padding="0" gap="16" wrap>
      {items}
    </Row>
  ) : (
    <Column as="ul" margin="0" padding="0" gap="12">
      {items}
    </Column>
  );
}

function PlanName({ plan }: { plan: Plan }) {
  return (
    <Row gap="8" vertical="center" wrap>
      <Heading as="h3" textVariant="heading-strong-m">
        {plan.name}
      </Heading>
      {plan.badge && <Tag tone="brand" size="s" label={plan.badge} />}
    </Row>
  );
}

// Plans side by side, one marked when it is the one most people want.
// `cards` frames each plan in a column; `list` runs them as rows, which
// suits services with a sentence each rather than a feature table.
export function PricingSection(props: PricingSectionProps) {
  const layout = choice(props.layout, pricingLayouts, "cards");
  const width = sectionWidth(props.width);
  const plans: Plan[] = rows(props.items)
    .map((item, index) => ({
      key: `${index}-${text(item.name)}`,
      name: text(item.name),
      price: text(item.price),
      period: text(item.period),
      description: text(item.description),
      features: lines(item.features),
      cta: action(item.ctaLabel, item.ctaHref, props.resolveHref),
      badge: text(item.badge),
      highlighted: flag(item.highlighted),
    }))
    .filter((plan) => plan.name);

  const header = (
    <SectionHeader eyebrow={props.eyebrow} title={props.title} description={props.description} />
  );

  if (layout === "list") {
    return (
      <SectionShell width={width}>
        {header}
        <Column fillWidth>
          {plans.map((plan, index) => (
            <Row
              key={plan.key}
              fillWidth
              gap="32"
              paddingY="32"
              horizontal="between"
              borderTop={index === 0 ? undefined : "neutral-alpha-weak"}
              m={{ direction: "column", gap: "20" }}
            >
              <Column flex={1} m={{ flex: "0" }} gap="12">
                <PlanName plan={plan} />
                {plan.description && (
                  <Text textVariant="body-default-m" onBackground="neutral-weak" wrap="pretty">
                    {plan.description}
                  </Text>
                )}
                <PlanFeatures features={plan.features} inline />
              </Column>
              <Column gap="16" horizontal="end" m={{ horizontal: "start" }}>
                <PlanPrice plan={plan} />
                {plan.cta && (
                  <Button href={plan.cta.href} variant={plan.highlighted ? "primary" : "secondary"}>
                    {plan.cta.label}
                  </Button>
                )}
              </Column>
            </Row>
          ))}
        </Column>
      </SectionShell>
    );
  }

  const columns = columnsFor(plans.length);
  return (
    <SectionShell width={width}>
      {header}
      <Grid
        fillWidth
        columns={columns}
        m={{ columns: Math.min(columns, 2) as 1 | 2 }}
        s={{ columns: 1 }}
        gap="24"
      >
        {plans.map((plan) => (
          <Column
            key={plan.key}
            fill
            gap="24"
            padding="32"
            radius="l"
            vertical="between"
            background="surface"
            border={plan.highlighted ? "brand-alpha-medium" : true}
            shadow={plan.highlighted ? "l" : undefined}
          >
            <Column gap="20">
              <Column gap="8">
                <PlanName plan={plan} />
                {plan.description && (
                  <Text textVariant="body-default-s" onBackground="neutral-weak" wrap="pretty">
                    {plan.description}
                  </Text>
                )}
              </Column>
              <PlanPrice plan={plan} />
              {plan.features.length > 0 && <Line background="neutral-alpha-weak" />}
              <PlanFeatures features={plan.features} />
            </Column>
            {plan.cta && (
              <Button
                fillWidth
                href={plan.cta.href}
                variant={plan.highlighted ? "primary" : "secondary"}
              >
                {plan.cta.label}
              </Button>
            )}
          </Column>
        ))}
      </Grid>
    </SectionShell>
  );
}
