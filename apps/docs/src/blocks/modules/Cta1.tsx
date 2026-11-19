import { Background, Button, Column, Heading, Row, Text } from "@once-ui-system/core";

const cta = {
  eyebrow: "Ready when you are",
  title: "Ship the interface, skip the busywork",
  description:
    "Start from production-ready blocks, theme them in one config, and hand the rest to your agent.",
  primary: { label: "Start building", href: "#" },
  secondary: { label: "Talk to us", href: "#" },
  note: "Free and open source. No credit card.",
};

/**
 * A closing call to action: a full-bleed band with one glow, a headline and a
 * button pair. Put it last on a landing page, right above the footer.
 */
export const Cta1: React.FC<React.ComponentProps<typeof Column>> = ({ ...flex }) => {
  return (
    <Column
      fillWidth
      horizontal="center"
      paddingX="l"
      paddingY="104"
      overflow="hidden"
      borderTop
      borderBottom
      {...flex}
    >
      <Background
        position="absolute"
        top="0"
        left="0"
        fill
        pointerEvents="none"
        gradient={{
          display: true,
          x: "50%",
          y: "100%",
          width: 320,
          height: 160,
          opacity: 100,
          colorStart: "brand-alpha-medium",
          colorEnd: "static-transparent",
        }}
        lines={{
          display: true,
          opacity: 40,
          size: "24",
          thickness: 1,
          angle: 90,
          color: "neutral-alpha-medium",
        }}
        mask={{ x: "50%", y: "100%", radius: "40rem" }}
      />
      <Column maxWidth="s" horizontal="center" gap="24" align="center" zIndex={1}>
        <Text textVariant="label-default-s" onBackground="brand-medium">
          {cta.eyebrow}
        </Text>
        <Heading as="h2" textVariant="display-strong-m" wrap="balance">
          {cta.title}
        </Heading>
        <Text textVariant="body-default-l" onBackground="neutral-weak" wrap="balance">
          {cta.description}
        </Text>
        <Row gap="12" marginTop="16" s={{ direction: "column" }} horizontal="center">
          <Button data-border="rounded" href={cta.primary.href} arrowIcon>
            {cta.primary.label}
          </Button>
          <Button data-border="rounded" href={cta.secondary.href} variant="secondary">
            {cta.secondary.label}
          </Button>
        </Row>
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          {cta.note}
        </Text>
      </Column>
    </Column>
  );
};
