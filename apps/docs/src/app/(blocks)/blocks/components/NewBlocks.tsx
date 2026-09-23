"use client";

import { Card, Column, Grid, Media, Row, Scroller, Text } from "@once-ui-system/core";
import { useMemo } from "react";
import { isRecent } from "@/app/utils/recency";
import { blocks } from "@/resources";
import type { BlockExample, BlockImage } from "@/types";
import { formatShortRelativeTime } from "@/utils/date-formatter";

interface NewBlocksProps {
  onNavigate?: () => void;
}

type FlattenedExample = BlockExample & {
  __date?: string;
  image?: BlockImage;
  href?: string;
};

export function NewBlocks({ onNavigate }: NewBlocksProps = {}) {
  // Build a flattened, date-sorted list of all block examples
  const allExamples = useMemo(() => {
    const list: FlattenedExample[] = [];
    Object.values(blocks).forEach((category) => {
      if (!category?.items) return;
      Object.values(category.items).forEach((section) => {
        const examples: BlockExample[] = section?.examples ?? [];
        const sectionImage: BlockImage | undefined = section?.image;
        const sectionHref: string | undefined = section?.href;
        examples.forEach((ex) => {
          const date = ex.updated || ex.created || undefined;
          list.push({ ...ex, __date: date, image: sectionImage, href: sectionHref });
        });
      });
    });
    list.sort((a, b) => {
      const ad = a.__date ? new Date(a.__date).getTime() : 0;
      const bd = b.__date ? new Date(b.__date).getTime() : 0;
      return bd - ad;
    });
    return list;
  }, []);

  return (
    <Column fillWidth border radius="l" minHeight={24} overflow="hidden">
      <Scroller fill direction="column" fadeColor="page">
        <Grid fillWidth columns={2}>
          {allExamples.map((example, index) => {
            const dateStr = example.__date as string | undefined;
            const rel = dateStr ? formatShortRelativeTime(new Date(dateStr)) : undefined;
            const dateLabel = example.updated ? "Updated" : example.created ? "Created" : undefined;
            return (
              <Card
                key={`${example.title}-${index}`}
                href={example.href ?? "#"}
                fillWidth
                padding="4"
                background="transparent"
                direction="column"
                border="transparent"
                borderBottom
                borderRight={index % 2 === 0 ? "neutral-alpha-weak" : "transparent"}
                onClick={() => onNavigate?.()}
              >
                <Media
                  border
                  light
                  src={example.image?.light ?? ""}
                  sizes="64px"
                  aspectRatio="1"
                  radius="m"
                />
                <Media
                  border
                  dark
                  src={example.image?.dark ?? ""}
                  sizes="64px"
                  aspectRatio="1"
                  radius="m"
                />
                <Column fillWidth gap="16" vertical="center" padding="24">
                  <Column gap="4">
                    <Text variant="label-default-l" onBackground="neutral-strong">
                      {example.title}
                    </Text>
                    <Row
                      vertical="center"
                      textVariant="label-default-xs"
                      onBackground="neutral-weak"
                    >
                      {isRecent(example.__date) && (
                        <>
                          {rel} <Text marginX="8">•</Text> {dateLabel}
                        </>
                      )}
                    </Row>
                  </Column>
                  {example.description && (
                    <Text variant="label-default-xs" onBackground="neutral-weak">
                      {example.description}
                    </Text>
                  )}
                </Column>
              </Card>
            );
          })}
        </Grid>
      </Scroller>
    </Column>
  );
}
