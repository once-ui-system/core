import { Column, Grid, Row, Text } from "@once-ui-system/core";
import { statsLayouts } from "./layouts.js";
import { choice, rows, text } from "./props.js";
import { type SectionBaseProps, SectionHeader, SectionShell, sectionWidth } from "./shared.js";

export interface StatsSectionProps extends SectionBaseProps {
  items?: { value?: string; label?: string; description?: string }[];
}

/** One column per figure up to four; more wrap onto a second row. */
const columnsFor = (count: number) => Math.min(4, Math.max(1, count)) as 1 | 2 | 3 | 4;

// A few figures that make the case: the number large, what it counts under
// it. `row` sets them in an open row divided by rules, `cards` frames each,
// `strip` lines them up in a ruled band beside the heading.
export function StatsSection(props: StatsSectionProps) {
  const layout = choice(props.layout, statsLayouts, "row");
  const width = sectionWidth(props.width);
  const stats = rows(props.items)
    .map((item, index) => ({
      key: `${index}-${text(item.value)}`,
      value: text(item.value),
      label: text(item.label),
      description: text(item.description),
    }))
    .filter((s) => s.value);
  const columns = columnsFor(stats.length);
  const cards = layout === "cards";

  if (layout === "strip") {
    // A band of facts between two rules: the heading on one side, the
    // figures in a line on the other. Light enough to sit right under a hero.
    return (
      <SectionShell width={width}>
        <Row
          fillWidth
          gap="48"
          paddingY="32"
          vertical="center"
          borderTop="neutral-alpha-medium"
          borderBottom="neutral-alpha-medium"
          m={{ direction: "column", vertical: "start", gap: "24" }}
        >
          <Column flex={1} fillWidth m={{ flex: "0" }}>
            <SectionHeader eyebrow={props.eyebrow} title={props.title} maxWidth="24rem" />
          </Column>
          <Column flex={2} m={{ flex: "0" }} fillWidth>
            <Grid
              fillWidth
              columns={columns}
              m={{ columns: Math.min(columns, 2) as 1 | 2 }}
              gap="32"
            >
              {stats.map((stat) => (
                <Column key={stat.key} gap="4">
                  <Text textVariant="display-strong-s" onBackground="neutral-strong">
                    {stat.value}
                  </Text>
                  {stat.label && (
                    <Text textVariant="body-default-s" onBackground="neutral-weak">
                      {stat.label}
                    </Text>
                  )}
                </Column>
              ))}
            </Grid>
          </Column>
        </Row>
      </SectionShell>
    );
  }

  return (
    <SectionShell width={width}>
      <SectionHeader eyebrow={props.eyebrow} title={props.title} description={props.description} />
      <Grid
        fillWidth
        columns={columns}
        m={{ columns: Math.min(columns, 2) as 1 | 2 }}
        s={{ columns: 1 }}
        gap={cards ? "24" : "32"}
      >
        {stats.map((stat) => (
          <Column
            key={stat.key}
            gap="8"
            background={cards ? "surface" : undefined}
            border={cards || undefined}
            radius={cards ? "l" : undefined}
            padding={cards ? "32" : undefined}
            paddingLeft={cards ? undefined : "24"}
            borderLeft={cards ? undefined : "brand-alpha-medium"}
          >
            <Text textVariant="display-strong-m" onBackground="neutral-strong">
              {stat.value}
            </Text>
            {stat.label && (
              <Text textVariant="heading-strong-s" onBackground="neutral-strong">
                {stat.label}
              </Text>
            )}
            {stat.description && (
              <Text textVariant="body-default-s" onBackground="neutral-weak" wrap="pretty">
                {stat.description}
              </Text>
            )}
          </Column>
        ))}
      </Grid>
    </SectionShell>
  );
}
