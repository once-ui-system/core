import { Column, Grid, Heading, Icon, Text } from "@once-ui-system/core";
import type { IconName } from "@/resources/icons";
import { SectionHeader } from "./SectionHeader";

const features: { icon: IconName; title: string; description: string }[] = [
  {
    icon: "quality",
    title: "Auth that's done",
    description: "Email sign-up, log in, password reset and protected routes on Supabase.",
  },
  {
    icon: "people",
    title: "Teams and roles",
    description: "Organizations, invites and role-based access, with every query scoped to a team.",
  },
  {
    icon: "card",
    title: "Billing",
    description: "Stripe plans, checkout and a customer portal, synced to your database.",
  },
  {
    icon: "apps",
    title: "A real dashboard",
    description: "Sidebar layout, charts, tables and settings pages you can rename and ship.",
  },
  {
    icon: "book",
    title: "Docs and blog",
    description: "MDX docs with search and a blog with SEO metadata generated for every page.",
  },
  {
    icon: "devices",
    title: "Web, mobile and desktop",
    description: "Ship the same app to iOS, Android, macOS and Windows from one codebase.",
  },
];

export const Features = ({ ...flex }: React.ComponentProps<typeof Column>) => (
  <Column fillWidth horizontal="center" gap="48" {...flex}>
    <SectionHeader
      label="Features"
      title="Everything a product needs on day one"
      description="The parts every app rebuilds, built once and built well, so you start on the part that's yours."
    />
    <Grid fillWidth columns={3} m={{ columns: 2 }} s={{ columns: 1 }} gap="12">
      {features.map((feature) => (
        <Column
          key={feature.title}
          fillWidth
          gap="8"
          padding="32"
          radius="xl"
          border="neutral-alpha-weak"
          background="surface"
        >
          <Icon
            name={feature.icon}
            size="s"
            padding="8"
            radius="m"
            border="brand-alpha-weak"
            background="brand-alpha-weak"
            onBackground="brand-medium"
            marginBottom="16"
          />
          <Heading as="h3" variant="heading-strong-m">
            {feature.title}
          </Heading>
          <Text onBackground="neutral-weak" variant="body-default-s" wrap="balance">
            {feature.description}
          </Text>
        </Column>
      ))}
    </Grid>
  </Column>
);
