import { Accordion, Column, Grid, Heading, Row, Text } from "@once-ui-system/core";
import { faqLayouts } from "./layouts.js";
import { choice, rows, text } from "./props.js";
import { type SectionBaseProps, SectionHeader, SectionShell, sectionWidth } from "./shared.js";

export interface FaqSectionProps extends SectionBaseProps {
  items?: { question?: string; answer?: string }[];
}

type Faq = { key: string; question: string; answer: string };

/** The questions as accordions, each in its own frame. */
function FaqAccordions({ items }: { items: Faq[] }) {
  return (
    <Column fillWidth gap="8">
      {items.map((item) => (
        <Column key={item.key} fillWidth border radius="l" background="surface">
          <Accordion
            title={
              <Text textVariant="heading-strong-xs" onBackground="neutral-strong">
                {item.question}
              </Text>
            }
          >
            <Text textVariant="body-default-m" onBackground="neutral-weak" wrap="pretty">
              {item.answer}
            </Text>
          </Accordion>
        </Column>
      ))}
    </Column>
  );
}

// Questions people ask before they get in touch. `stacked` and `split` fold
// each answer away; `grid` shows every answer at once in two columns, for a
// short list nobody should have to click through.
export function FaqSection(props: FaqSectionProps) {
  const layout = choice(props.layout, faqLayouts, "stacked");
  const width = sectionWidth(props.width);
  const items: Faq[] = rows(props.items)
    .map((item, index) => ({
      key: `${index}-${text(item.question)}`,
      question: text(item.question),
      answer: text(item.answer),
    }))
    .filter((item) => item.question && item.answer);

  if (layout === "split") {
    return (
      <SectionShell width={width}>
        <Row fillWidth gap="64" m={{ direction: "column", gap: "32" }}>
          <Column flex={2} m={{ flex: "0" }}>
            <SectionHeader
              eyebrow={props.eyebrow}
              title={props.title}
              description={props.description}
            />
          </Column>
          <Column flex={3} m={{ flex: "0" }} fillWidth>
            <FaqAccordions items={items} />
          </Column>
        </Row>
      </SectionShell>
    );
  }

  if (layout === "grid") {
    return (
      <SectionShell width={width}>
        <SectionHeader
          eyebrow={props.eyebrow}
          title={props.title}
          description={props.description}
        />
        <Grid fillWidth columns="2" s={{ columns: 1 }} gap="40">
          {items.map((item) => (
            <Column key={item.key} gap="8">
              <Heading as="h3" textVariant="heading-strong-s">
                {item.question}
              </Heading>
              <Text textVariant="body-default-m" onBackground="neutral-weak" wrap="pretty">
                {item.answer}
              </Text>
            </Column>
          ))}
        </Grid>
      </SectionShell>
    );
  }

  return (
    <SectionShell width={width} horizontal="center">
      <SectionHeader
        center
        eyebrow={props.eyebrow}
        title={props.title}
        description={props.description}
      />
      <Column maxWidth="m">
        <FaqAccordions items={items} />
      </Column>
    </SectionShell>
  );
}
