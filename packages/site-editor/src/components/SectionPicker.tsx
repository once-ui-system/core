"use client";

import { Column, Grid, Row, Text } from "@once-ui-system/core";
import { useEditorContext } from "../context.js";
import type { SectionDefinition } from "../model.js";
import { SectionGlyph } from "./SectionGlyph.js";

/**
 * What can go here, drawn rather than listed: two columns of tiles, each the
 * section's drawing over its name and a line on what it is for. The same
 * drawing the list shows for a section already on the page.
 */
export function SectionPicker({
  addable,
  onPick,
}: {
  addable: SectionDefinition[];
  onPick: (type: string) => void;
}) {
  const { labels } = useEditorContext();
  return (
    <Column padding="8" gap="8" maxWidth={352} maxHeight={448} overflowY="auto">
      <Row paddingX="4" paddingTop="4">
        <Text variant="label-default-xs" onBackground="neutral-weak">
          {labels.addSection}
        </Text>
      </Row>
      <Grid fillWidth columns="2" gap="8">
        {addable.map((definition) => (
          <Column
            key={definition.type}
            as="button"
            type="button"
            fillWidth
            gap="8"
            padding="8"
            radius="m"
            cursor="interactive"
            background="transparent"
            border="neutral-alpha-medium"
            onClick={() => onPick(definition.type)}
          >
            <SectionGlyph type={definition.type} />
            <Column fillWidth gap="2">
              <Text variant="label-strong-xs">{definition.label}</Text>
              <Text variant="label-default-xs" onBackground="neutral-weak" wrap="pretty">
                {definition.description}
              </Text>
            </Column>
          </Column>
        ))}
      </Grid>
    </Column>
  );
}
