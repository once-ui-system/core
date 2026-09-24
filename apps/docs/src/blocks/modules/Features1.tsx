import { Animation, BlobFx, Column, Grid, Heading, Icon, Text } from "@once-ui-system/core";

const features = [
  {
    title: "Component Library",
    description:
      "Extensive collection of customizable UI components built with modern best practices and accessibility in mind.",
    icon: "componentLibrary" as const,
  },
  {
    title: "Design Tokens",
    description:
      "Centralized design tokens for colors, typography, spacing, and more to maintain consistent styling across your application.",
    icon: "designTokens" as const,
  },
  {
    title: "Responsive Design",
    description:
      "Fluid and adaptive layouts that work seamlessly across all devices and screen sizes.",
    icon: "responsive" as const,
  },
  {
    title: "Dark Mode",
    description:
      "Built-in dark mode support with smooth transitions and customizable color schemes.",
    icon: "darkMode" as const,
  },
  {
    title: "Accessibility",
    description:
      "WCAG compliant components with keyboard navigation, screen reader support, and proper ARIA attributes.",
    icon: "accessibility" as const,
  },
  {
    title: "Documentation",
    description:
      "Comprehensive documentation with live examples, code snippets, and best practices for implementation.",
    icon: "documentation" as const,
  },
];

export const Features1: React.FC<React.ComponentProps<typeof Column>> = ({ ...flex }) => {
  return (
    <Column fillWidth gap="40" {...flex}>
      <Column maxWidth="s" paddingX="40" gap="12">
        <Heading as="h2" variant="display-default-s">
          Empowering developers with <Text onBackground="brand-weak">cutting-edge tools</Text> and
          capabilities
        </Heading>
      </Column>
      <Grid fillWidth gap="4" columns="3" m={{ columns: 2 }} s={{ columns: 1 }}>
        <BlobFx position="absolute" right="0" bottom="0" />
        {features.map((feature, index) => (
          <Animation key={index} zoomOut={1.02} fade={1} triggerType="hover" duration={300}>
            <Column background="surface" radius="s" padding="40" border fillWidth gap="8">
              <Icon
                padding="8"
                name={feature.icon}
                onBackground="brand-weak"
                size="xs"
                radius="m"
                border="brand-alpha-medium"
                background="brand-alpha-weak"
              />
              <Heading marginTop="12" as="h3" variant="body-default-m">
                {feature.title}
              </Heading>
              <Text wrap="balance" onBackground="neutral-weak" variant="body-default-s">
                {feature.description}
              </Text>
            </Column>
          </Animation>
        ))}
      </Grid>
    </Column>
  );
};
