"use client";

import { Column, Dropdown, Heading, IconButton, Option, Row, Text } from "@once-ui-system/core";
import { useState } from "react";
import { useEditorContext } from "../context.js";
import type { EditorField } from "../model.js";
import { FieldForm } from "./FieldForm.js";

/**
 * One section open in the panel: a header that names it, with the way back and
 * a "more" menu, over its fields. The header stays pinned while the fields
 * scroll.
 */
export function SectionPanel({
  id,
  type,
  title,
  description,
  fields,
  values,
  onChange,
  onBack,
  actions,
}: {
  id: string;
  type: string;
  title: string;
  description?: string;
  fields: readonly EditorField[];
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  onBack: () => void;
  /** The more menu; left out for the header and footer, which stay put. */
  actions?: {
    duplicate: () => void;
    moveUp?: () => void;
    moveDown?: () => void;
    remove: () => void;
  };
}) {
  const { labels } = useEditorContext();
  const [open, setOpen] = useState(false);
  const run = (action?: () => void) => () => {
    setOpen(false);
    action?.();
  };

  return (
    <Column fillWidth gap="16">
      <Row
        position="sticky"
        top="0"
        zIndex={1}
        fillWidth
        gap="8"
        paddingY="12"
        vertical="center"
        background="page"
        borderBottom="neutral-alpha-weak"
      >
        <IconButton
          icon="chevronLeft"
          variant="tertiary"
          size="s"
          tooltip={labels.back}
          tooltipPosition="bottom"
          onClick={onBack}
        />
        <Column flex={1} minWidth={0}>
          <Heading as="h2" variant="heading-strong-xs" truncate>
            {title}
          </Heading>
          {description && (
            <Text variant="label-default-xs" onBackground="neutral-weak" truncate>
              {description}
            </Text>
          )}
        </Column>
        {actions && (
          <Dropdown
            placement="bottom-end"
            open={open}
            onOpenChange={setOpen}
            trigger={
              <IconButton
                icon="moreHorizontal"
                variant="tertiary"
                size="s"
                tooltip={labels.more}
                tooltipPosition="bottom"
              />
            }
          >
            <Column padding="4" gap="2" minWidth={160}>
              <Option value="duplicate" label={labels.duplicate} onClick={run(actions.duplicate)} />
              <Option
                value="up"
                label={labels.moveUp}
                disabled={!actions.moveUp}
                onClick={run(actions.moveUp)}
              />
              <Option
                value="down"
                label={labels.moveDown}
                disabled={!actions.moveDown}
                onClick={run(actions.moveDown)}
              />
              <Option value="remove" danger label={labels.remove} onClick={run(actions.remove)} />
            </Column>
          </Dropdown>
        )}
      </Row>
      <FieldForm type={type} fields={fields} values={values} idPrefix={id} onChange={onChange} />
    </Column>
  );
}
