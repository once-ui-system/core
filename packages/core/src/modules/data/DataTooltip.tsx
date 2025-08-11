"use client";

import React from "react";
import { formatDate } from "./utils/formatDate";
import { Column, Text, Row, CountFx } from "../../components";
import { Swatch } from "./Swatch";
import { ChartVariant, DateConfig } from "./interfaces";

interface DataTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  dataKey?: string;
  DataTooltip?: React.ReactNode;
  date?: DateConfig;
  colors?: boolean;
  variant?: ChartVariant;
}

const DataTooltip: React.FC<DataTooltipProps> = ({
  active,
  payload,
  label,
  dataKey = "name",
  DataTooltip,
  date = { format: "MMM d" },
  colors = true,
  variant = "gradient",
}) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const dataPoint = payload[0].payload;
  const displayLabel = label || dataPoint?.[dataKey];

  const formattedLabel =
    formatDate(displayLabel, date, dataPoint) || displayLabel || dataPoint?.endDate;

  return (
    <Column
      minWidth={8}
      gap="8"
      paddingY="8"
      background="surface"
      radius="m"
      border="neutral-alpha-medium"
    >
      {label && (
        <Row fillWidth paddingX="12">
          <Text variant="label-default-s" onBackground="neutral-strong">
            {formattedLabel}
          </Text>
        </Row>
      )}
      <Column fillWidth horizontal="between" paddingX="12" gap="4">
        {payload.map((entry: any, index: number) => (
          <Row key={index} horizontal="between" fillWidth gap="16">
            <Row vertical="center" gap="8">
              {colors && <Swatch color={entry.stroke || entry.color} size="s" variant={variant} />}
              <Text onBackground="neutral-weak" variant="label-default-s">
                {DataTooltip && index === 0 ? DataTooltip : entry.name}
              </Text>
            </Row>
            <Text onBackground="neutral-strong" variant="label-default-s">
              {typeof entry.value === "number" ? (
                <CountFx value={entry.value} separator="," speed={500} easing="ease-in-out" />
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

export { DataTooltip };
export type { DataTooltipProps };
