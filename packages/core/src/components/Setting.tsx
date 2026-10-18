"use client";

import React, { useId } from "react";
import type { CSSUnit } from "../types.js";
import { Column } from "./Column.js";
import { ControlLabelContext } from "./ControlLabelContext.js";
import { Flex } from "./Flex.js";
import { Row } from "./Row.js";
import { Text } from "./Text.js";
import { Tooltip } from "./Tooltip.js";

/**
 * The settings row that Aveiro, Frametic and Scenetic each grew their own copy
 * of: a label on the left, one control on the right, in a bordered row that
 * stacks into a panel. Aveiro's version took every control as a typed prop
 * (`switch`, `slider`, `dropdown`, …), which meant the component had to know
 * about every control that would ever sit in it. This one takes the control as
 * children instead, so it composes with anything — including controls that do
 * not exist yet.
 */

/** Renders a label that may be a plain string or arbitrary nodes. */
function renderLabel(label: React.ReactNode) {
  return typeof label === "string" || typeof label === "number" ? (
    <Text wrap="nowrap" textVariant="label-default-s">
      {label}
    </Text>
  ) : (
    label
  );
}

interface SettingRowProps extends React.ComponentProps<typeof Flex> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** Hover explainer behind an info icon beside the label. */
  info?: React.ReactNode;
  /**
   * Cap on the trailing control area, so long rows stay readable: a number is
   * px, a string a CSS length. Default `"14rem"` (a bare number was rem until 3.0).
   */
  controlWidth?: number | CSSUnit;
  /** The control. */
  children?: React.ReactNode;
}

const SettingRow = ({
  label,
  description,
  info,
  controlWidth = "14rem",
  children,
  ...flex
}: SettingRowProps) => {
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
            {label && <span id={labelId}>{renderLabel(label)}</span>}
            {info && <Tooltip content={info} />}
          </Row>
          {description && (
            <Text textVariant="label-default-xs" onBackground="neutral-weak">
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
 * `<Setting control open>`: a Setting whose sub-settings live *inside* its box rather than beside it, so
 * the relationship survives when the group is one of ten in a scrolling panel.
 */
const SettingGroup = ({
  label,
  description,
  info,
  control,
  open,
  children,
  ...flex
}: SettingGroupProps) => (
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
          {info && <Tooltip content={info} />}
        </Row>
        {description && (
          <Text textVariant="label-default-xs" onBackground="neutral-weak">
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

interface SettingAxesProps extends React.ComponentProps<typeof Flex> {
  label?: React.ReactNode;
  info?: React.ReactNode;
  /** One entry per axis: a short axis name and its control. */
  axes: { label: React.ReactNode; control: React.ReactNode }[];
  /**
   * Width each axis holds before the row wraps: a number is px, a string a
   * CSS length. Default `"13rem"` (a bare number was rem until 3.0).
   */
  axisWidth?: number | CSSUnit;
}

/**
 * `<Setting axes>`: one row carrying the axes of a single property — "Tilt" as X and Y side by
 * side, rather than two rows that read as unrelated settings. Each axis holds
 * `axisWidth` and the row wraps when the panel is narrower, so the controls
 * stay usable instead of collapsing to a few pixels.
 */
const SettingAxes = ({ label, info, axes, axisWidth = "13rem", ...flex }: SettingAxesProps) => {
  const labelId = useId();
  return (
    <Column fillWidth padding="8" gap="8" radius="l" border {...flex}>
      <Row vertical="center" gap="8" paddingLeft="8" paddingTop="4">
        {label && <span id={labelId}>{renderLabel(label)}</span>}
        {info && <Tooltip content={info} />}
      </Row>
      <Row fillWidth gap="12" wrap>
        {axes.map((axis, index) => (
          <Row key={index} flex={1} minWidth={axisWidth} vertical="center" gap="8" paddingLeft="8">
            <Text
              id={`${labelId}-${index}`}
              wrap="nowrap"
              textVariant="label-default-xs"
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

/**
 * One settings row, in three shapes:
 *
 * - a label and one control, the control as `children` (the default);
 * - with `axes`, one row carrying the axes of a single property (2.x's
 *   SettingAxes): "Tilt" as X and Y side by side;
 * - with `control` (and `open`), a group (2.x's SettingGroup): the header
 *   control gates the sub-settings, which are the `children`, shown inside
 *   the same box while `open`.
 */
type SettingProps =
  | (SettingRowProps & { axes?: undefined; control?: undefined; open?: undefined })
  | (SettingAxesProps & { control?: undefined; open?: undefined; children?: undefined })
  | (SettingGroupProps & { axes?: undefined; control: React.ReactNode })
  | (SettingGroupProps & { axes?: undefined; open: boolean });

const Setting = (props: SettingProps) => {
  if (props.axes !== undefined) return <SettingAxes {...(props as SettingAxesProps)} />;
  if (props.control !== undefined || props.open !== undefined)
    return <SettingGroup {...(props as SettingGroupProps)} />;
  return <SettingRow {...(props as SettingRowProps)} />;
};

Setting.displayName = "Setting";

export type { SettingProps };
export { Setting };
