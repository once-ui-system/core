import { Card, Grid, Media, Row, Tag, Text } from "@once-ui-system/core";
import { hasRecentExample } from "@/app/utils/recency";
import type { BlockItem } from "@/types";

/** The most recent timestamp (ms) among an item's examples. */
function getLatestTimestamp(item: BlockItem): number {
  const timestamps = (item.examples ?? [])
    .map((example) => example.updated || example.created)
    .filter((date): date is string => Boolean(date))
    .map((date) => new Date(date).getTime())
    .filter((time) => !Number.isNaN(time));
  return timestamps.length ? Math.max(...timestamps) : 0;
}

type GridColumns = NonNullable<React.ComponentProps<typeof Grid>["columns"]>;

/**
 * The wider of two column counts, unless it would leave one card alone on the
 * last row and the narrower one would not (5 cards: 3 + 2 rather than 4 + 1).
 */
const columnsFor = (count: number, wide: number, narrow: number) =>
  String(count > wide && count % wide === 1 && count % narrow !== 1 ? narrow : wide) as GridColumns;

/**
 * One card per block category, most recently updated first.
 *
 * Each card stands on its own (own border and radius, separated by a gap) so a
 * short last row ends cleanly, and no two borders ever stack into a double line.
 */
export function BlockCategoryGrid({ items }: { items: BlockItem[] }) {
  const sorted = [...items].sort((a, b) => getLatestTimestamp(b) - getLatestTimestamp(a));
  return (
    <Grid
      fillWidth
      gap="12"
      columns={columnsFor(sorted.length, 4, 3)}
      l={{ columns: columnsFor(sorted.length, 3, 2) }}
      m={{ columns: 2 }}
      s={{ columns: 1 }}
    >
      {sorted.map((item) => (
        <BlockCategoryCard key={item.href} item={item} />
      ))}
    </Grid>
  );
}

function BlockCategoryCard({ item }: { item: BlockItem }) {
  const examplesCount = item.examples?.length ?? 0;
  const alt = `Preview of the ${item.label} blocks`;

  return (
    <Card
      fillWidth
      href={item.href}
      direction="column"
      radius="l"
      border
      background="overlay"
      overflow="hidden"
    >
      <Row fillWidth gap="8" vertical="center" paddingX="20" paddingY="16">
        <Text textVariant="heading-strong-s" truncate>
          {item.label}
        </Text>
        <Row
          textVariant="body-default-xs"
          onBackground="neutral-weak"
          background="neutral-alpha-weak"
          border="neutral-alpha-medium"
          radius="s"
          paddingX="4"
          minWidth="24"
          center
        >
          {examplesCount}
        </Row>
        {hasRecentExample(item.examples) && (
          <Tag size="s" tone="brand">
            NEW
          </Tag>
        )}
      </Row>
      <Row fillWidth paddingLeft="20">
        <Media
          sizes="(max-width: 768px) 100vw, 400px"
          showIn="dark"
          src={item.image?.dark || ""}
          alt={alt}
          borderLeft
          borderTop
          aspectRatio="960/880"
          topLeftRadius="m"
        />
        <Media
          sizes="(max-width: 768px) 100vw, 400px"
          showIn="light"
          src={item.image?.light || ""}
          alt={alt}
          borderLeft
          borderTop
          aspectRatio="960/880"
          topLeftRadius="m"
        />
      </Row>
    </Card>
  );
}
