import { Column, Grid, Heading, Icon, Row, Text } from "@once-ui-system/core";
import type { IconName } from "@/resources/icons";
import { SectionHeader } from "./SectionHeader";

const steps: { icon: IconName; title: string; description: string; code: string }[] = [
  {
    icon: "terminal",
    title: "Create your app",
    description: "Pick the surfaces you need. The CLI writes a project with only those in it.",
    code: "npx @once-ui-system/cli create my-app",
  },
  {
    icon: "swatch",
    title: "Make it yours",
    description: "Set your colors, fonts and shapes in one config file. Every page follows.",
    code: "src/resources/once-ui.config.js",
  },
  {
    icon: "rocket",
    title: "Ship it",
    description: "Add your keys, deploy to Vercel and start building the part that's yours.",
    code: "npm run build",
  },
];

export const Steps = ({ ...flex }: React.ComponentProps<typeof Column>) => (
  <Column fillWidth horizontal="center" gap="48" {...flex}>
    <SectionHeader
      label="How it works"
      title="From zero to deployed in an afternoon"
    />
    <Grid fillWidth columns={3} m={{ columns: 1 }} gap="12">
      {steps.map((step, index) => (
        <Column key={step.title} fillWidth gap="12" padding="32" radius="xl" border="neutral-alpha-weak">
          <Row fillWidth horizontal="between" vertical="center" marginBottom="16">
            <Icon name={step.icon} size="s" onBackground="brand-medium" />
            <Text variant="label-default-s" onBackground="neutral-weak">
              {String(index + 1).padStart(2, "0")}
            </Text>
          </Row>
          <Heading as="h3" variant="heading-strong-m">
            {step.title}
          </Heading>
          <Text onBackground="neutral-weak" variant="body-default-s" wrap="balance">
            {step.description}
          </Text>
          <Row
            fillWidth
            marginTop="8"
            paddingX="12"
            paddingY="8"
            radius="m"
            background="neutral-alpha-weak"
            textVariant="code-default-xs"
            onBackground="neutral-medium"
            style={{ overflowX: "auto", whiteSpace: "nowrap" }}
          >
            {step.code}
          </Row>
        </Column>
      ))}
    </Grid>
  </Column>
);
