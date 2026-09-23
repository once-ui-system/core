import { Heading, Line, Row, Tag, Text } from "@once-ui-system/core";
import { hasRecentExample, isRecent } from "@/app/utils/recency";

type ExampleDate = { updated?: string; created?: string };

export const BlockTitle = ({
  id,
  title,
  description,
  updated,
  created,
  examples,
}: {
  id?: string;
  title: string;
  description: string;
  creators?: string[];
  updated?: string;
  created?: string;
  examples?: ExampleDate[];
}) => {
  const showNew = examples?.length ? hasRecentExample(examples) : isRecent(updated || created);
  return (
    <Row vertical="center" gap="12" s={{ direction: "column", horizontal: "start" }}>
      <Row gap="8" vertical="center">
        <Heading
          id={id}
          data-block-title=""
          variant="body-strong-s"
          as="h2"
          style={{ scrollMarginTop: "calc(var(--static-space-56) + var(--static-space-16))" }}
        >
          {title}
        </Heading>
        {showNew && <Tag scheme="brand">NEW</Tag>}
      </Row>
      <Line vert height="16" background="neutral-alpha-medium" s={{ hide: true }} />
      <Text onBackground="neutral-medium" variant="body-default-s">
        {description}
      </Text>
    </Row>
  );
};
