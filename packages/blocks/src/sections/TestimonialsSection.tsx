import { Avatar, Column, Grid, Row, Text } from "@once-ui-system/core";
import { testimonialsLayouts } from "./layouts.js";
import { choice, rows, text } from "./props.js";
import { type SectionBaseProps, SectionHeader, SectionShell, sectionWidth } from "./shared.js";

export interface TestimonialsSectionProps extends SectionBaseProps {
  items?: { quote?: string; name?: string; role?: string; avatar?: string }[];
}

type Testimonial = { key: string; quote: string; name: string; role: string; avatar: string };

/** Up to three quotes side by side. */
const columnsFor = (count: number) => Math.min(3, Math.max(1, count)) as 1 | 2 | 3;

/** Who said it: an optional portrait, the name, and a line about them. */
function Attribution({ item, center = false }: { item: Testimonial; center?: boolean }) {
  if (!item.name && !item.role) return null;
  return (
    <Row as="figcaption" gap="12" vertical="center" horizontal={center ? "center" : "start"}>
      {item.avatar && <Avatar size="m" src={item.avatar} />}
      <Column gap="2" align={center ? "center" : "start"}>
        {item.name && (
          <Text textVariant="label-strong-s" onBackground="neutral-strong">
            {item.name}
          </Text>
        )}
        {item.role && (
          <Text textVariant="label-default-s" onBackground="neutral-weak">
            {item.role}
          </Text>
        )}
      </Column>
    </Row>
  );
}

// What customers, clients or readers say, quote by quote, arranged by
// `layout`: framed cards, the first quote large with the rest beneath it, or
// unframed quotes set off by a rule.
export function TestimonialsSection(props: TestimonialsSectionProps) {
  const layout = choice(props.layout, testimonialsLayouts, "cards");
  const width = sectionWidth(props.width);
  const items: Testimonial[] = rows(props.items)
    .map((item, index) => ({
      key: `${index}-${text(item.name)}`,
      quote: text(item.quote),
      name: text(item.name),
      role: text(item.role),
      avatar: text(item.avatar),
    }))
    .filter((item) => item.quote);
  if (items.length === 0) {
    return (
      <SectionShell width={width}>
        <SectionHeader
          eyebrow={props.eyebrow}
          title={props.title}
          description={props.description}
        />
      </SectionShell>
    );
  }

  if (layout === "spotlight") {
    const [first, ...rest] = items;
    return (
      <SectionShell width={width} horizontal="center" align="center" gap="48">
        <SectionHeader
          center
          eyebrow={props.eyebrow}
          title={props.title}
          description={props.description}
        />
        <Column as="figure" margin="0" maxWidth="44rem" gap="24" horizontal="center">
          <Text
            as="blockquote"
            margin="0"
            textVariant="display-default-xs"
            onBackground="neutral-strong"
            wrap="balance"
          >
            “{first.quote}”
          </Text>
          <Attribution item={first} center />
        </Column>
        {rest.length > 0 && (
          <Grid
            fillWidth
            columns={columnsFor(rest.length)}
            m={{ columns: Math.min(2, rest.length) as 1 | 2 }}
            s={{ columns: 1 }}
            gap="32"
            paddingTop="32"
            borderTop
          >
            {rest.map((item) => (
              <Column key={item.key} as="figure" margin="0" gap="16" horizontal="center">
                <Text
                  as="blockquote"
                  margin="0"
                  textVariant="body-default-l"
                  onBackground="neutral-strong"
                  wrap="balance"
                >
                  “{item.quote}”
                </Text>
                <Attribution item={item} center />
              </Column>
            ))}
          </Grid>
        )}
      </SectionShell>
    );
  }

  const plain = layout === "plain";
  return (
    <SectionShell width={width}>
      <SectionHeader eyebrow={props.eyebrow} title={props.title} description={props.description} />
      <Grid
        fillWidth
        columns={columnsFor(items.length)}
        m={{ columns: Math.min(2, items.length) as 1 | 2 }}
        s={{ columns: 1 }}
        gap={plain ? "40" : "24"}
      >
        {items.map((item) => (
          <Column
            key={item.key}
            as="figure"
            margin="0"
            gap="24"
            vertical="between"
            padding={plain ? undefined : "32"}
            paddingLeft={plain ? "24" : undefined}
            borderLeft={plain ? "brand-alpha-strong" : undefined}
            border={plain ? undefined : true}
            radius={plain ? undefined : "l"}
            background={plain ? undefined : "surface"}
          >
            <Text
              as="blockquote"
              margin="0"
              textVariant="heading-default-m"
              onBackground="neutral-strong"
              wrap="pretty"
            >
              “{item.quote}”
            </Text>
            <Attribution item={item} />
          </Column>
        ))}
      </Grid>
    </SectionShell>
  );
}
