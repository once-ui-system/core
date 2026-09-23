import { Accordion, Column, Heading, Text } from "@once-ui-system/core";

interface FaqProps {
  title: string;
  content: string;
}

export const faq: FaqProps[] = [
  {
    title: "What do you actually deliver?",
    content:
      "I design and build full frontend systems—landing pages, product interfaces, dashboards, documentation, and more. Instead of isolated pages, everything is structured as a consistent, reusable system that can evolve with your product.",
  },
  {
    title: "How is this different from a typical agency or freelancer?",
    content:
      "Most projects are built from scratch every time. I work differently—I use a system-based approach, which means faster delivery, more consistency, and the ability to expand your product without rebuilding everything.",
  },
  {
    title: "Who is this for?",
    content:
      "Founders and teams who want to move fast without creating a fragmented product. This works best for early-stage startups, SaaS products, and teams that need both speed and long-term structure.",
  },
  {
    title: "What kind of projects do you take on?",
    content:
      "Anything from landing pages to full product frontends. Some projects start small and expand over time, others are built as complete systems from the beginning.",
  },
  {
    title: "How long does a project take?",
    content:
      "It depends on scope, but most projects are delivered in a few weeks. Because the system is already structured, we avoid a lot of the usual delays.",
  },
  {
    title: "How do we work together?",
    content:
      "We start with a short alignment phase to define scope and direction. From there, I design and build iteratively, so you can see progress early and continuously refine the product.",
  },
  {
    title: "Do you also handle design and branding?",
    content:
      "Yes. I can define or refine your visual system, ensuring that your product, marketing, and documentation all feel consistent and aligned.",
  },
  {
    title: "Do you work with ongoing clients?",
    content:
      "Yes. Many projects continue after the initial build, especially as products grow and require new features or iterations.",
  },
];

export const Faq4 = (flex: React.ComponentProps<typeof Column>) => {
  return (
    <Column fillWidth horizontal="center" gap="48" {...flex}>
      <Column fillWidth paddingTop="24" paddingLeft="24">
        <Heading as="h2" variant="display-strong-m" marginBottom="20">
          Frequently asked questions
        </Heading>
        <Text onBackground="neutral-medium" variant="body-default-xl">
          Here are some common questions about my work and process.
        </Text>
      </Column>
      <Column fillWidth gap="8">
        {faq.map((item, index) => (
          <Column key={index} fillWidth border radius="l" padding="4" background="overlay">
            <Accordion title={<Text variant="body-default-s">{item.title}</Text>}>
              <Text variant="body-default-s" onBackground="neutral-medium">
                {item.content}
              </Text>
            </Accordion>
          </Column>
        ))}
      </Column>
    </Column>
  );
};
