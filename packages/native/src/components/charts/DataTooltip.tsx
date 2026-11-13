import { Column, type FlexProps, Row } from "../Flex";
import { Text } from "../Text";
import type { ChartVariant } from "./interfaces";
import { Swatch } from "./Swatch";
import { formatNumber } from "./scale";

export interface DataTooltipProps extends FlexProps {
  /** The tapped row's x label. */
  label?: string;
  /** One entry per series: its name, colour and value in that row. */
  payload?: readonly { name: string; color: string; value?: string | number | Date }[];
  showSwatches?: boolean;
  variant?: ChartVariant;
}

/** Core's `DataTooltip`: the label of a tapped row and each series' value in it. */
export function DataTooltip({
  label,
  payload,
  showSwatches = true,
  variant = "gradient",
  ...flex
}: DataTooltipProps) {
  if (!payload || payload.length === 0) return null;
  return (
    <Column
      gap="8"
      paddingY="8"
      background="surface"
      radius="m"
      border="neutral-alpha-medium"
      shadow="m"
      pointerEvents="none"
      {...flex}
    >
      {label ? (
        <Row paddingX="12">
          <Text textVariant="label-default-s" onBackground="neutral-strong">
            {label}
          </Text>
        </Row>
      ) : null}
      <Column paddingX="12" gap="4">
        {payload.map((entry) => (
          <Row key={entry.name} horizontal="between" vertical="center" gap="16">
            <Row vertical="center" gap="8">
              {showSwatches && <Swatch color={entry.color} size="s" variant={variant} />}
              <Text textVariant="label-default-s" onBackground="neutral-weak">
                {entry.name}
              </Text>
            </Row>
            <Text textVariant="label-default-s" onBackground="neutral-strong">
              {typeof entry.value === "number"
                ? formatNumber(entry.value)
                : entry.value instanceof Date
                  ? entry.value.toDateString()
                  : (entry.value ?? "–")}
            </Text>
          </Row>
        ))}
      </Column>
    </Column>
  );
}
