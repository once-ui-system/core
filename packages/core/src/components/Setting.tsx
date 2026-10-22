"use client";

import React, { useId } from "react";
import { Column } from "./Column";
import { ControlLabelContext } from "./ControlLabelContext";
import { Flex } from "./Flex";
import { InfoTip } from "./InfoTip";
import { Row } from "./Row";
import { Text } from "./Text";

/**
 * The settings row that Aveiro, Frametic and Scenetic each grew their own copy
 * of: a label on the left, one control on the right, in a bordered row that
 * stacks into a panel. Aveiro's version took every control as a typed prop
 * (`switch`, `slider`, `dropdown`, …), which meant the component had to know
 * about every control that would ever sit in it. This one takes the control as
 * children instead, so it composes with anything — including controls that do
 * not exist yet.
 */

/**
 * Renders a label that may be a plain string or arbitrary nodes. With an `id`
 * (the target of the control's `aria-labelledby`), a string label carries it
 * on its own Text, so the label adds no box of its own; a node label is
 * wrapped in a `display: contents` span, which names it without taking part
 * in the row's layout.
 */
function renderLabel(label: React.ReactNode, id?: string) {
  if (typeof label === "string" || typeof label === "number") {
    return (
      <Text id={id} wrap="nowrap" variant="label-default-s">
        {label}
      </Text>
    );
  }
  return id ? (
    <span id={id} style={{ display: "contents" }}>
      {label}
    </span>
  ) : (
    label
  );
}

interface SettingProps extends React.ComponentProps<typeof Flex> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** Hover explainer behind an info icon beside the label. */
  info?: React.ReactNode;
  /** Cap (rem) on the trailing control area, so long rows stay readable. */
  controlWidth?: number;
  /** The control. */
  children?: React.ReactNode;
}

const Setting: React.FC<SettingProps> = ({
  label,
  description,
  info,
  controlWidth = 14,
  children,
  ...flex
}) => {
  const hasLabel = Boolean(label || description);
  const labelId = useId();
  return (
    <Row
      fillWidth
      padding="8"
      gap="12"
      vertical="center"
      horizontal="between"
      radius="l"
      border
      wrap
      {...flex}
    >
      {hasLabel && (
        <Column gap="4" paddingLeft="8" paddingRight="4" paddingY="4">
          <Row vertical="center" gap="8">
            {label && renderLabel(label, labelId)}
            {info && <InfoTip>{info}</InfoTip>}
          </Row>
          {description && (
            <Text variant="label-default-xs" onBackground="neutral-weak">
              {description}
            </Text>
          )}
        </Column>
      )}
      <Row
        // With no label the control owns the row; with one it is capped so the
        // label keeps its space instead of being squeezed to nothing.
        fillWidth={!hasLabel}
        maxWidth={hasLabel ? controlWidth : undefined}
        horizontal="end"
        vertical="center"
        gap="8"
      >
        <ControlLabelContext.Provider value={label ? labelId : undefined}>
          {children}
        </ControlLabelContext.Provider>
      </Row>
    </Row>
  );
};

Setting.displayName = "Setting";

interface SettingGroupProps extends React.ComponentProps<typeof Flex> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  info?: React.ReactNode;
  /** The header control — usually the switch or select that gates the body. */
  control?: React.ReactNode;
  /** Show the nested body. */
  open?: boolean;
  /** The sub-settings, revealed when `open`. */
  children?: React.ReactNode;
}

/**
 * A Setting whose sub-settings live *inside* its box rather than beside it, so
 * the relationship survives when the group is one of ten in a scrolling panel.
 */
const SettingGroup: React.FC<SettingGroupProps> = ({
  label,
  description,
  info,
  control,
  open,
  children,
  ...flex
}) => (
  <Column
    fillWidth
    radius="l"
    // The group is one surface: the header and the body it reveals share a
    // background, so opening it grows the panel rather than stacking a second
    // one inside the first. An alpha border sits on whatever is behind it,
    // which is what a group nested in a panel needs.
    background="surface"
    border
    overflow="hidden"
    {...flex}
  >
    <Row fillWidth padding="8" gap="12" vertical="center" horizontal="between" wrap>
      <Column gap="4" paddingLeft="8" paddingY="4">
        <Row vertical="center" gap="8">
          {renderLabel(label)}
          {info && <InfoTip>{info}</InfoTip>}
        </Row>
        {description && (
          <Text variant="label-default-xs" onBackground="neutral-weak">
            {description}
          </Text>
        )}
      </Column>
      {control && (
        <Row horizontal="end" vertical="center" gap="8">
          {control}
        </Row>
      )}
    </Row>
    {open && children && (
      <Column fillWidth gap="8" padding="8" borderTop>
        {children}
      </Column>
    )}
  </Column>
);

SettingGroup.displayName = "SettingGroup";

interface SettingAxesProps extends React.ComponentProps<typeof Flex> {
  label?: React.ReactNode;
  info?: React.ReactNode;
  /** One entry per axis: a short axis name and its control. */
  axes: { label: React.ReactNode; control: React.ReactNode }[];
  /** Width (rem) each axis holds before the row wraps. */
  axisWidth?: number;
}

/**
 * One row carrying the axes of a single property — "Tilt" as X and Y side by
 * side, rather than two rows that read as unrelated settings. Each axis holds
 * `axisWidth` and the row wraps when the panel is narrower, so the controls
 * stay usable instead of collapsing to a few pixels.
 */
const SettingAxes: React.FC<SettingAxesProps> = ({
  label,
  info,
  axes,
  axisWidth = 13,
  ...flex
}) => {
  const labelId = useId();
  return (
    <Column fillWidth padding="8" gap="8" radius="l" border {...flex}>
      <Row vertical="center" gap="8" paddingLeft="8" paddingTop="4">
        {label && renderLabel(label, labelId)}
        {info && <InfoTip>{info}</InfoTip>}
      </Row>
      <Row fillWidth gap="12" wrap>
        {axes.map((axis, index) => (
          <Row key={index} flex={1} minWidth={axisWidth} vertical="center" gap="8" paddingLeft="8">
            <Text
              id={`${labelId}-${index}`}
              wrap="nowrap"
              variant="label-default-xs"
              onBackground="neutral-weak"
            >
              {axis.label}
            </Text>
            <ControlLabelContext.Provider
              value={label ? `${labelId} ${labelId}-${index}` : `${labelId}-${index}`}
            >
              {axis.control}
            </ControlLabelContext.Provider>
          </Row>
        ))}
      </Row>
    </Column>
  );
};

SettingAxes.displayName = "SettingAxes";

export type { SettingAxesProps, SettingGroupProps, SettingProps };
export { Setting, SettingAxes, SettingGroup };
