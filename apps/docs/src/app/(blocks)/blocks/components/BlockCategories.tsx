import { Card, Column, Grid, Media, Row, Tag, Text } from "@once-ui-system/core";
import { hasRecentExample } from "@/app/utils/recency";
import { blocks } from "@/resources";
import type { BlockItem } from "@/types";

export const BlockCategories: React.FC<React.ComponentProps<typeof Grid>> = ({ ...grid }) => {
  return (
    <Column fillWidth gap="40" {...grid}>
      {/* Display section titles in a row */}
      {Object.entries(blocks)
        .filter(([key]) => key !== "blocks")
        .map(([key, section]) => (
          <Column fillWidth key={key}>
            <Row
              paddingX="24"
              minHeight="56"
              gap="12"
              vertical="center"
              position="sticky"
              top="56"
              background="page"
              zIndex={1}
            >
              <Text as="span" variant="heading-strong-s">
                {section.title}
              </Text>
              <Tag size="m" scheme="brand">
                Pro
              </Tag>
            </Row>

            {/* Display section items in a grid */}
            <Grid
              fillWidth
              columns="5"
              m={{ columns: 2 }}
              s={{ columns: 1 }}
              border="neutral-alpha-medium"
              overflow="hidden"
              radius="xl"
            >
              {/* Handle both array and object formats for items */}
              {Array.isArray(section.items)
                ? [...section.items]
                    .sort((a, b) => getLatestTimestamp(b) - getLatestTimestamp(a))
                    .map((item, index) => renderItem(item, `${index}`, section.icon))
                : Object.entries(section.items)
                    .sort(([, a], [, b]) => getLatestTimestamp(b) - getLatestTimestamp(a))
                    .map(([itemKey, item]) => renderItem(item, itemKey, section.icon))}
            </Grid>
          </Column>
        ))}
    </Column>
  );

  // Helper function to render each item card
  function renderItem(item: BlockItem, key: string, _sectionIcon: string) {
    // Calculate the number of examples in this item
    const examplesCount = item.examples?.length || 0;
    const hasNewTag = hasRecentExample(item.examples);

    return (
      <Card fillWidth key={key} direction="column" href={item.href} border background="overlay">
        <Row paddingY="24" paddingLeft="32" paddingRight="8" gap="12" fillWidth vertical="center">
          <Text variant="heading-strong-xs" truncate>
            {item.label}
          </Text>
          <Row gap="8">
            <Row
              textVariant="body-default-xs"
              onBackground="neutral-weak"
              background="neutral-alpha-weak"
              border="neutral-alpha-medium"
              radius="s"
              padding="2"
              minWidth="24"
              center
            >
              {examplesCount}
            </Row>
            {hasNewTag && <Tag scheme="brand">NEW</Tag>}
          </Row>
        </Row>
        <Row paddingLeft="16" fillWidth>
          <Media
            sizes="280px"
            dark
            src={item.image?.dark || ""}
            alt={`Illustration for ${item.label} copy-paste block`}
            borderLeft
            borderTop
            aspectRatio="960/880"
            topLeftRadius="l"
          />
          <Media
            sizes="280px"
            light
            src={item.image?.light || ""}
            alt={`Illustration for ${item.label} copy-paste block`}
            borderLeft
            borderTop
            aspectRatio="960/880"
            topLeftRadius="l"
          />
        </Row>
      </Card>
    );
  }

  // Returns the most recent timestamp (ms) among an item's examples
  function getLatestTimestamp(item: BlockItem): number {
    const timestamps = (item.examples ?? [])
      .map((ex) => ex.updated || ex.created)
      .filter((d): d is string => Boolean(d))
      .map((d) => new Date(d).getTime())
      .filter((t) => !Number.isNaN(t));
    return timestamps.length ? Math.max(...timestamps) : 0;
  }
};
