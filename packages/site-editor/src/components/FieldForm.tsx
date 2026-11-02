"use client";

import {
  Button,
  Column,
  Grid,
  Icon,
  IconButton,
  Input,
  Media,
  Row,
  SegmentedControl,
  Select,
  Sortable,
  SortableHandle,
  SortableItem,
  Switch,
  Text,
  Textarea,
} from "@once-ui-system/core";
import { useState } from "react";
import { useEditorContext } from "../context.js";
import type { EditorField } from "../model.js";
import { hasGlyph, SectionGlyph } from "./SectionGlyph.js";

/** `cards` → `Cards`, `top-left` → `Top left`. */
const humanize = (value: string) => {
  const words = value.replace(/[-_]/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
};

const asString = (value: unknown) =>
  typeof value === "string" ? value : typeof value === "number" ? String(value) : "";

type ListRow = Record<string, unknown>;

let rowCounter = 0;
/** List rows carry a hidden `_id` so a reordered row keeps its open state. */
const rowId = (row: ListRow, index: number) =>
  typeof row._id === "string" ? row._id : `row-${index}`;
const newRowId = () => {
  rowCounter += 1;
  return `r-${Date.now().toString(36)}${rowCounter.toString(36)}`;
};

function ListField({
  type,
  field,
  id,
  value,
  onChange,
}: {
  type: string;
  field: EditorField;
  id: string;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const { labels } = useEditorContext();
  const rows: ListRow[] = Array.isArray(value) ? (value as ListRow[]) : [];
  const [open, setOpen] = useState<string | null>(null);
  const fields = field.fields ?? [];
  const titleKey = field.rowTitle ?? fields.find((f) => f.kind === "text")?.key;
  const full = field.max !== undefined && rows.length >= field.max;
  const set = (next: ListRow[]) => onChange(next);
  const ids = rows.map(rowId);

  return (
    <Column fillWidth gap="8">
      <Text variant="label-default-s" onBackground="neutral-weak">
        {field.label}
      </Text>
      <Sortable
        items={ids}
        handle
        gap="4"
        label={field.label}
        onReorder={(_items, move) => {
          // Every row gets its id now, so an open row stays open as it moves.
          const next: ListRow[] = rows.map((row, i) => ({ ...row, _id: rowId(row, i) }));
          const [moved] = next.splice(move.from, 1);
          next.splice(move.to, 0, moved as ListRow);
          set(next);
        }}
      >
        {rows.map((row, index) => {
          const key = ids[index] as string;
          const isOpen = open === key;
          const title = (titleKey && asString(row[titleKey])) || labels.rowUntitled;
          return (
            <SortableItem key={key} id={key} label={title}>
              <Column
                fillWidth
                radius="m"
                border={isOpen ? "neutral-alpha-strong" : "neutral-alpha-medium"}
                overflow="hidden"
              >
                <Row fillWidth vertical="center" gap="4" paddingLeft="4" paddingRight="8">
                  <SortableHandle />
                  <Row
                    as="button"
                    type="button"
                    flex={1}
                    minWidth={0}
                    paddingY="8"
                    gap="8"
                    vertical="center"
                    cursor="interactive"
                    background="transparent"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : key)}
                  >
                    <Text variant="label-default-s" truncate flex={1}>
                      {title}
                    </Text>
                    <Icon
                      name={isOpen ? "chevronUp" : "chevronDown"}
                      size="xs"
                      onBackground="neutral-weak"
                      decorative
                    />
                  </Row>
                </Row>
                {isOpen && (
                  <Column fillWidth gap="16" padding="12" borderTop="neutral-alpha-weak">
                    <FieldForm
                      type={type}
                      fields={fields}
                      values={row}
                      idPrefix={`${id}-${key}`}
                      onChange={(fieldKey, next) => {
                        const updated = rows.slice();
                        updated[index] = { ...row, [fieldKey]: next };
                        set(updated);
                      }}
                    />
                    <Row fillWidth horizontal="end">
                      <Button
                        size="s"
                        variant="tertiary"
                        prefixIcon="trash"
                        onClick={() => {
                          set(rows.filter((_, i) => i !== index));
                          setOpen(null);
                        }}
                      >
                        {labels.removeRow}
                      </Button>
                    </Row>
                  </Column>
                )}
              </Column>
            </SortableItem>
          );
        })}
      </Sortable>
      <Button
        size="s"
        variant="secondary"
        prefixIcon="plus"
        disabled={full}
        onClick={() => {
          const row: ListRow = { _id: newRowId() };
          set([...rows.map((r, i) => ({ ...r, _id: rowId(r, i) })), row]);
          setOpen(row._id as string);
        }}
      >
        {labels.addRow}
      </Button>
    </Column>
  );
}

function ChoiceField({
  type,
  field,
  id,
  value,
  onChange,
}: {
  type: string;
  field: EditorField;
  id: string;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const { glyphs } = useEditorContext();
  const options = field.options ?? [];
  const current = asString(value) || options[0] || "";

  // A layout people pick by its look: one drawing per option.
  if (field.key === "layout" && options.every((option) => hasGlyph(glyphs, type, option))) {
    return (
      <Column fillWidth gap="8" role="radiogroup" aria-label={field.label}>
        <Text variant="label-default-s" onBackground="neutral-weak">
          {field.label}
        </Text>
        <Grid fillWidth columns="2" gap="8">
          {options.map((option) => {
            const selected = option === current;
            return (
              <Column
                key={option}
                as="button"
                type="button"
                role="radio"
                aria-checked={selected}
                fillWidth
                gap="4"
                padding="4"
                radius="m"
                cursor="interactive"
                background={selected ? "brand-alpha-weak" : "transparent"}
                border={selected ? "brand-alpha-strong" : "neutral-alpha-medium"}
                onClick={() => onChange(option)}
              >
                <SectionGlyph type={type} layout={option} />
                <Text
                  variant="label-default-xs"
                  onBackground={selected ? "brand-strong" : "neutral-medium"}
                  align="center"
                >
                  {humanize(option)}
                </Text>
              </Column>
            );
          })}
        </Grid>
      </Column>
    );
  }

  if (options.length <= 4 && options.every((option) => option.length <= 10)) {
    return (
      <Column fillWidth gap="8">
        <Text variant="label-default-s" onBackground="neutral-weak" id={`${id}-label`}>
          {field.label}
        </Text>
        <SegmentedControl
          aria-labelledby={`${id}-label`}
          fillWidth
          value={current}
          onValueChange={(next) => onChange(next)}
          buttons={options.map((option) => ({ value: option, label: humanize(option) }))}
        />
      </Column>
    );
  }

  return (
    <Select
      id={id}
      label={field.label}
      value={current}
      onValueChange={(next) => onChange(Array.isArray(next) ? next[0] : next)}
      options={options.map((option) => ({ value: option, label: humanize(option) }))}
    />
  );
}

export interface FieldFormProps {
  /** The section type, for field labels and layout drawings. */
  type: string;
  fields: readonly EditorField[];
  values: Record<string, unknown>;
  /** Keeps input ids unique across sections and list rows. */
  idPrefix: string;
  onChange: (key: string, value: unknown) => void;
}

/**
 * A section's panel, drawn from its schema, so a new field in the schema shows
 * up here with no extra wiring. Kinds the kit does not draw go to the
 * product's `fieldKinds`.
 */
export function FieldForm({ type, fields, values, idPrefix, onChange }: FieldFormProps) {
  const { labels, fieldKinds, fieldLabel } = useEditorContext();

  return (
    <Column fillWidth gap="16">
      {fields.map((raw) => {
        // A field tied to a condition that does not hold is left out; its
        // value stays saved for when it holds again.
        if (raw.when) {
          const gate = asString(values[raw.when.key]);
          if (gate && !raw.when.is.includes(gate)) return null;
        }
        const field = { ...raw, label: fieldLabel(type, raw) };
        const id = `${idPrefix}-${field.key}`;
        const value = values[field.key];
        const set = (next: unknown) => onChange(field.key, next);
        const custom = fieldKinds[field.kind];
        if (custom) {
          return <Column key={field.key}>{custom({ field, id, value, onChange: set })}</Column>;
        }

        switch (field.kind) {
          case "text":
            return (
              <Input
                key={field.key}
                id={id}
                label={field.label}
                description={field.hint}
                value={asString(value)}
                onValueChange={set}
              />
            );
          case "textarea":
            return (
              <Textarea
                key={field.key}
                id={id}
                label={field.label}
                description={
                  field.hint ??
                  (field.split === "lines"
                    ? "One per line"
                    : field.split === "paragraphs"
                      ? "A blank line between paragraphs"
                      : undefined)
                }
                lines="auto"
                value={asString(value)}
                onValueChange={set}
              />
            );
          case "link":
            return (
              <Input
                key={field.key}
                id={id}
                label={field.label}
                description={field.hint}
                prefix={<Icon name="link" size="xs" onBackground="neutral-weak" decorative />}
                value={asString(value)}
                onValueChange={set}
              />
            );
          case "image": {
            const src = asString(value);
            return (
              <Column key={field.key} fillWidth gap="8">
                <Input
                  id={id}
                  label={field.label}
                  description={field.hint ?? labels.imageUrl}
                  prefix={<Icon name="image" size="xs" onBackground="neutral-weak" decorative />}
                  suffix={
                    src ? (
                      <IconButton
                        icon="close"
                        size="s"
                        variant="tertiary"
                        tooltip={labels.remove}
                        onClick={() => set(undefined)}
                      />
                    ) : undefined
                  }
                  value={src}
                  onValueChange={(next) => set(next || undefined)}
                />
                {src && <Media src={src} alt="" aspectRatio="16 / 9" radius="m" sizes="22rem" />}
              </Column>
            );
          }
          case "boolean":
            return (
              <Switch
                key={field.key}
                id={id}
                label={field.label}
                description={field.hint}
                checked={value === true}
                onCheckedChange={(checked) => set(checked)}
              />
            );
          case "choice":
            return (
              <ChoiceField
                key={field.key}
                type={type}
                field={field}
                id={id}
                value={value}
                onChange={set}
              />
            );
          case "list":
            return (
              <ListField
                key={field.key}
                type={type}
                field={field}
                id={id}
                value={value}
                onChange={set}
              />
            );
          default:
            return null;
        }
      })}
    </Column>
  );
}
