import { Column, Grid, Heading, Row, Tag, Text } from "@once-ui-system/core";

const steps = [4, 8, 12, 16, 22, 30, 40, 50, 65, 80, 100] as const;

function Scale({ tone }: { tone: "brand" | "accent" | "neutral" | "danger" }) {
  return (
    <Column gap="8">
      <Text textVariant="label-default-s" onBackground="neutral-weak">
        {tone}/N
      </Text>
      <Row gap="4">
        {steps.map((n) => (
          <Column key={n} flex={1} gap="4" horizontal="center">
            <Row fillWidth height="40" radius="s" background={`${tone}/${n}`} />
            <Text textVariant="code-default-xs" onBackground="neutral-weak">
              {n}
            </Text>
          </Column>
        ))}
      </Row>
    </Column>
  );
}

function Panel({ theme }: { theme: "dark" | "light" }) {
  return (
    <Column theme={theme} background="page" padding="32" gap="32" flex={1} radius="l" border>
      <Row gap="8" vertical="center">
        <Heading as="h2" textVariant="heading-strong-m">
          Any token at any opacity
        </Heading>
        <Tag size="s">{theme}</Tag>
      </Row>

      <Column gap="16">
        <Scale tone="brand" />
        <Scale tone="accent" />
        <Scale tone="neutral" />
        <Scale tone="danger" />
      </Column>

      <Column gap="8">
        <Text textVariant="label-default-s" onBackground="neutral-weak">
          The named alphas are steps on the same scale
        </Text>
        <Grid columns="3" gap="8">
          {(
            [
              ["brand-alpha-weak", "brand/15"],
              ["brand-alpha-medium", "brand/30"],
              ["brand-alpha-strong", "brand/50"],
            ] as const
          ).map(([named, step]) => (
            <Row key={named} gap="4">
              <Column flex={1} height="48" radius="s" background={named} center>
                <Text textVariant="code-default-xs">{named}</Text>
              </Column>
              <Column flex={1} height="48" radius="s" background={step} center>
                <Text textVariant="code-default-xs">{step}</Text>
              </Column>
            </Row>
          ))}
        </Grid>
      </Column>

      <Column gap="8">
        <Text textVariant="label-default-s" onBackground="neutral-weak">
          A glow card, no custom variables
        </Text>
        <Grid columns="2" gap="16" s={{ columns: "1" }}>
          <Column
            padding="24"
            gap="8"
            radius="l"
            background="brand/12"
            border="brand/22"
            onBackground="neutral-strong"
          >
            <Text textVariant="code-default-xs" onBackground="brand-weak">
              background="brand/12" border="brand/22"
            </Text>
            <Heading as="h3" textVariant="heading-strong-s">
              Launch week
            </Heading>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              Tinted by the brand at 12%, edged at 22%, in both themes.
            </Text>
          </Column>
          <Column padding="24" gap="8" radius="l" background="gradient/16" border="accent/22">
            <Text textVariant="code-default-xs" onBackground="accent-weak">
              background="gradient/16" border="accent/22"
            </Text>
            <Heading as="h3" textVariant="heading-strong-s">
              Brand to accent
            </Heading>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              The theme's two hues as one gradient, at 16%.
            </Text>
          </Column>
        </Grid>
      </Column>

      <Column gap="8">
        <Text textVariant="label-default-s" onBackground="neutral-weak">
          background="gradient", and a role token at an opacity
        </Text>
        <Row gap="8">
          <Column flex={1} height="64" radius="m" background="gradient" />
          <Column
            flex={1}
            height="64"
            radius="m"
            background="gradient"
            style={{ "--gradient-angle": "90deg" } as React.CSSProperties}
          />
          <Column
            flex={1}
            height="64"
            radius="m"
            solid="accent-strong/40"
            border="accent-strong/80"
          />
        </Row>
      </Column>
    </Column>
  );
}

export default function AlphaTokens() {
  return (
    <Row fillWidth padding="24" gap="24" s={{ direction: "column" }} background="page">
      <Panel theme="dark" />
      <Panel theme="light" />
    </Row>
  );
}
