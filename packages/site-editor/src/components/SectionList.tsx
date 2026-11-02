"use client";

import {
  Column,
  Dropdown,
  Icon,
  IconButton,
  Line,
  Row,
  Sortable,
  SortableItem,
  Text,
} from "@once-ui-system/core";
import { Fragment, useState } from "react";
import { useEditorContext } from "../context.js";
import { FOOTER_ID, HEADER_ID, type Section, type SectionDefinition, summarize } from "../model.js";
import { SectionGlyph } from "./SectionGlyph.js";
import { SectionPicker } from "./SectionPicker.js";

function SectionTile({
  type,
  layout,
  label,
  summary,
  selected,
  draggable,
  onSelect,
  onHover,
}: {
  type: string;
  layout?: string;
  label: string;
  summary: string;
  selected: boolean;
  draggable?: boolean;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
}) {
  const { labels } = useEditorContext();
  return (
    <Row
      as="button"
      type="button"
      fillWidth
      minWidth={0}
      gap="12"
      padding="8"
      radius="m"
      vertical="center"
      cursor="interactive"
      aria-pressed={selected}
      background={selected ? "brand-alpha-weak" : "transparent"}
      border={selected ? "brand-alpha-strong" : "neutral-alpha-medium"}
      transition="micro-medium"
      onClick={onSelect}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
    >
      {draggable && <Icon name="grip" size="s" onBackground="neutral-weak" decorative />}
      <Row width={64} fitHeight>
        <SectionGlyph type={type} layout={layout} />
      </Row>
      <Column flex={1} gap="2" minWidth={0}>
        <Text variant="label-strong-xs" truncate>
          {label}
        </Text>
        <Text
          variant="label-default-xs"
          onBackground={summary ? "neutral-weak" : "neutral-medium"}
          truncate
        >
          {summary || labels.sectionEmpty}
        </Text>
      </Column>
    </Row>
  );
}

/**
 * The gap between two tiles, and the way a section gets in there. Collapsed it
 * is a little space; on hover or focus, or while its menu is open, it opens out
 * and a rule and a `+` fade in. The `+` opens the picker.
 */
function InsertGap({
  index,
  addable,
  onAdd,
}: {
  index: number;
  addable: SectionDefinition[];
  onAdd: (type: string, index: number) => void;
}) {
  const { labels } = useEditorContext();
  const [hovered, setHovered] = useState(false);
  const [open, setOpen] = useState(false);
  const shown = addable.length > 0 && (hovered || open);
  return (
    <Row
      fillWidth
      height={shown ? "32" : "8"}
      overflow="hidden"
      vertical="center"
      gap="8"
      opacity={shown ? 100 : 0}
      transition="micro-medium"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <Line background="neutral-alpha-medium" />
      <Dropdown
        placement="bottom"
        open={open}
        onOpenChange={setOpen}
        trigger={
          <IconButton
            icon="plus"
            size="s"
            variant="secondary"
            tooltip={labels.insertHere}
            tooltipPosition="top"
            disabled={addable.length === 0}
          />
        }
      >
        <SectionPicker
          addable={addable}
          onPick={(type) => {
            onAdd(type, index);
            setOpen(false);
          }}
        />
      </Dropdown>
      <Line background="neutral-alpha-medium" />
    </Row>
  );
}

export interface SectionListProps {
  sections: Section[];
  selectedId: string | null;
  /** Section types this page may still take. */
  addable: SectionDefinition[];
  /** Show the pinned header and footer tiles. */
  chrome?: { header?: boolean; footer?: boolean };
  readOnly?: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  /** `to` is the section's index once moved. */
  onMove: (id: string, to: number) => void;
  /** `index` is the position the new section takes. */
  onAdd: (type: string, index: number) => void;
}

/**
 * A page's sections: one list to drag into order (or move with Space and the
 * arrow keys), a place to add between any two, and a tile at the end for the
 * bottom, which is what a touch screen uses. The header and the footer are
 * pinned at the top and the foot, as they are on the page.
 */
export function SectionList({
  sections,
  selectedId,
  addable,
  chrome = {},
  readOnly = false,
  onSelect,
  onHover,
  onMove,
  onAdd,
}: SectionListProps) {
  const { labels, definitions } = useEditorContext();
  const [endOpen, setEndOpen] = useState(false);
  const hover = (id: string) => (hovered: boolean) => onHover(hovered ? id : null);
  const labelOf = (section: Section) => definitions[section.type]?.label ?? section.type;
  const layoutOf = (section: Section) =>
    typeof section.props.layout === "string" ? section.props.layout : undefined;

  return (
    <Column fillWidth>
      {chrome.header && (
        <SectionTile
          type="header"
          label={labels.header}
          summary={labels.pinnedHint}
          selected={selectedId === HEADER_ID}
          onSelect={() => onSelect(HEADER_ID)}
          onHover={hover(HEADER_ID)}
        />
      )}
      {readOnly && <Row height="8" />}
      <Sortable
        items={sections.map((section) => section.id)}
        disabled={readOnly}
        label={labels.sections}
        onReorder={(_items, move) => onMove(move.id, move.to)}
      >
        {sections.map((section, index) => (
          <Fragment key={section.id}>
            {!readOnly && <InsertGap index={index} addable={addable} onAdd={onAdd} />}
            <SortableItem id={section.id} label={labelOf(section)}>
              <SectionTile
                type={section.type}
                layout={layoutOf(section)}
                label={labelOf(section)}
                summary={summarize(section)}
                selected={section.id === selectedId}
                draggable={!readOnly}
                onSelect={() => onSelect(section.id)}
                onHover={hover(section.id)}
              />
            </SortableItem>
          </Fragment>
        ))}
      </Sortable>

      {sections.length === 0 && (
        <Row paddingY="12">
          <Text variant="body-default-s" onBackground="neutral-weak">
            {labels.noSections}
          </Text>
        </Row>
      )}

      {!readOnly && addable.length > 0 && (
        <Column fillWidth paddingTop="8">
          <Dropdown
            fillWidth
            placement="bottom"
            open={endOpen}
            onOpenChange={setEndOpen}
            // A plain row: the Dropdown's own wrapper is the button.
            trigger={
              <Row
                fillWidth
                gap="8"
                padding="12"
                radius="m"
                horizontal="center"
                vertical="center"
                cursor="interactive"
                background="transparent"
                border="neutral-alpha-medium"
                borderStyle="dashed"
              >
                <Icon name="plus" size="xs" onBackground="neutral-weak" decorative />
                <Text variant="label-default-s" onBackground="neutral-weak">
                  {labels.addSection}
                </Text>
              </Row>
            }
          >
            <SectionPicker
              addable={addable}
              onPick={(type) => {
                onAdd(type, sections.length);
                setEndOpen(false);
              }}
            />
          </Dropdown>
        </Column>
      )}

      {chrome.footer && (
        <Column fillWidth paddingTop="8">
          <SectionTile
            type="footer"
            label={labels.footer}
            summary={labels.pinnedHint}
            selected={selectedId === FOOTER_ID}
            onSelect={() => onSelect(FOOTER_ID)}
            onHover={hover(FOOTER_ID)}
          />
        </Column>
      )}
    </Column>
  );
}
