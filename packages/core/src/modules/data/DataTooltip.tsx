"use client";

import React from "react";
import { Column } from "../../components/Column.js";
import { Row } from "../../components/Row.js";
import { Text } from "../../components/Text.js";
import { CountUp } from "../../internal/CountUp.js";
import { ChartVariant, DateConfig } from "./interfaces.js";
import { Swatch } from "./Swatch.js";
import { formatDate } from "./utils/formatDate.js";

interface DataTooltipProps {
  active?: boolean;
  payload?: readonly Record<string, any>[];
  label?: string | number;
  dataKey?: string;
  DataTooltip?: React.ReactNode;
  date?: DateConfig;
  showSwatches?: boolean;
  variant?: ChartVariant;
  /**
   * Writes a value: the series' `format`, else the chart's `valueFormat`, in
   * its `locale`. Without it, values count up with comma-grouped digits.
   */
  formatValue?: (value: number, dataKey?: string) => string;
}

const DataTooltip = ({
  active,
  payload,
  label,
  dataKey = "name",
  DataTooltip,
  date = { format: "MMM d" },
  showSwatches = true,
  variant = "gradient",
  formatValue,
}: DataTooltipProps) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const dataPoint = payload[0].payload;
  // 0 is a label (a numeric x axis starts there): `label && …` rendered a stray
  // "0" in its place and no header.
  const hasLabel = label !== undefined && label !== null && label !== "";
  const displayLabel = hasLabel ? label : dataPoint?.[dataKey];

  const formattedLabel =
    formatDate(displayLabel, date, dataPoint) ?? displayLabel ?? dataPoint?.endDate;

  return (
    <Column
      minWidth="8rem"
      gap="8"
      paddingY="8"
      background="surface"
      radius="m"
      border="neutral-alpha-medium"
    >
      {hasLabel && (
        <Row fillWidth paddingX="12">
          <Text textVariant="label-default-s" onBackground="neutral-strong">
            {formattedLabel}
          </Text>
        </Row>
      )}
      <Column fillWidth horizontal="between" paddingX="12" gap="4">
        {payload.map((entry: Record<string, any>, index: number) => (
          <Row key={index} horizontal="between" fillWidth gap="16">
            <Row vertical="center" gap="8">
              {showSwatches && (
                <Swatch color={entry.stroke || entry.color} size="s" variant={variant} />
              )}
              <Text onBackground="neutral-weak" textVariant="label-default-s">
                {DataTooltip && index === 0 ? DataTooltip : entry.name}
              </Text>
            </Row>
            <Text onBackground="neutral-strong" textVariant="label-default-s">
              {typeof entry.value === "number" && formatValue ? (
                formatValue(entry.value, entry.dataKey)
              ) : typeof entry.value === "number" ? (
                <CountUp value={entry.value} separator="," duration={500} easing="ease-in-out" />
              ) : (
                entry.value
              )}
            </Text>
          </Row>
        ))}
      </Column>
    </Column>
  );
};

export type { DataTooltipProps };
export { DataTooltip };
