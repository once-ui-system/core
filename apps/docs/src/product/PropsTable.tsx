"use client";

import React, { ReactNode } from "react";
import { Column, InlineCode, Row, SmartLink, Table, Text } from "@once-ui-system/core";

type PropType = string | string[] | ReactNode;

/**
 * `[name, type, default?, description?]`.
 *
 * `name` may also be a spread token (`"...flex"`), which stands for every prop
 * the component inherits from another type. The registry below is the whole
 * vocabulary — an unknown token renders as a plain row so a typo is visible
 * rather than silently swallowed.
 */
type PropData = [string, PropType?, string?, ReactNode?];

interface PropsTableProps {
  content: PropData[];
  /** Column heading for the first column. Defaults to "Prop". */
  label?: string;
}

/**
 * Spread shorthands. `type` is what the cell prints; `href` links to the page
 * that documents those props, so "and everything else" stops being a dead end.
 * React's own attribute types have no page of their own and link out to MDN.
 */
const SPREADS: Record<string, { type: string; href?: string }> = {
  flex: { type: "FlexProps", href: "/once-ui/components/flex" },
  grid: { type: "GridProps", href: "/once-ui/components/grid" },
  text: { type: "TextProps", href: "/once-ui/components/text" },
  card: { type: "CardProps", href: "/once-ui/components/card" },
  scroller: { type: "ScrollerProps", href: "/once-ui/components/scroller" },
  animation: { type: "AnimationProps", href: "/once-ui/components/animation" },
  user: { type: "UserProps", href: "/once-ui/components/user" },
  dropdownWrapper: {
    type: "DropdownWrapperProps",
    href: "/once-ui/components/dropdownWrapper",
  },
  input: { type: "InputProps", href: "/once-ui/form-controls/input" },
  HTMLAttributes: {
    type: "React.HTMLAttributes",
    href: "https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes",
  },
  InputHTMLAttributes: {
    type: "React.InputHTMLAttributes",
    href: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attributes",
  },
  ButtonHTMLAttributes: {
    type: "React.ButtonHTMLAttributes",
    href: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attributes",
  },
  AnchorHTMLAttributes: {
    type: "React.AnchorHTMLAttributes",
    href: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attributes",
  },
  TextareaHTMLAttributes: {
    type: "React.TextareaHTMLAttributes",
    href: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#attributes",
  },
};

/** Props every component takes, so a page never has to spell them out. */
const IMPLICIT: Record<string, string> = {
  children: "React.ReactNode",
  style: "React.CSSProperties",
  className: "string",
};

function renderType(name: string, type: PropType): ReactNode {
  if (IMPLICIT[name]) return <InlineCode>{IMPLICIT[name]}</InlineCode>;

  if (Array.isArray(type)) {
    return (
      <Row gap="4" vertical="center" wrap>
        {type.map((value, index) => (
          <React.Fragment key={index}>
            <InlineCode>{value}</InlineCode>
            {index < type.length - 1 && (
              <Text onBackground="neutral-weak" aria-hidden="true">
                •
              </Text>
            )}
          </React.Fragment>
        ))}
      </Row>
    );
  }

  return type ? <InlineCode>{type}</InlineCode> : <Text onBackground="neutral-weak">—</Text>;
}

function PropsTable({ content, label = "Prop" }: PropsTableProps) {
  const data = {
    headers: [
      { content: label, key: "prop", sortable: true, width: "40%" },
      { content: "Type", key: "type", sortable: false, width: "40%" },
      { content: "Default", key: "default", sortable: false, width: "20%" },
    ],
    rows: content.map(([name, type, defaultValue, description]) => {
      const spread = name.startsWith("...") ? SPREADS[name.slice(3)] : undefined;

      if (spread) {
        // An inherited-props row is not a prop, so it does not get a name cell
        // pretending to be one — it reads as the sentence it actually is.
        return [
          <Text key="prop" onBackground="neutral-weak" variant="body-default-s">
            …and every{" "}
            {spread.href ? (
              <SmartLink href={spread.href}>{spread.type}</SmartLink>
            ) : (
              <InlineCode>{spread.type}</InlineCode>
            )}{" "}
            prop
          </Text>,
          <Text key="type" onBackground="neutral-weak">
            inherited
          </Text>,
          <Text key="default" onBackground="neutral-weak">
            —
          </Text>,
        ];
      }

      return [
        <Column key="prop" gap="4" paddingY="2">
          <Row>
            <InlineCode>{name}</InlineCode>
          </Row>
          {description && (
            <Text variant="body-default-xs" onBackground="neutral-weak" wrap="pretty">
              {description}
            </Text>
          )}
        </Column>,
        renderType(name, type),
        // Pages predate the optional fourth column and spell "no default" as
        // a literal dash, which must not render as a default of `-`.
        defaultValue && defaultValue !== "-" ? (
          <InlineCode key="default">{defaultValue}</InlineCode>
        ) : (
          <Text key="default" onBackground="neutral-weak">
            —
          </Text>
        ),
      ];
    }),
  };

  return <Table marginTop="16" marginBottom="24" data={data} />;
}

export { PropsTable };
