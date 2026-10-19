import { Column, Row } from "../Flex";
import { Text } from "../Text";
import type { ChartVariant, LegendConfig } from "./interfaces";
import { Swatch } from "./Swatch";

export interface LegendProps {
  /** One entry per series: its name and resolved colour. */
  payload?: readonly { value: string; color: string }[];
  direction?: LegendConfig["direction"];
  position?: LegendConfig["position"];
  variant?: ChartVariant;
}

/**
 * Core's `Legend`: a swatch and a name per series. It sits in the flow above
 * the plot (`top-*`) or below it (`bottom-*`), aligned by the position's side,
 * instead of floating over the plot as on the web.
 */
export function Legend({
  payload,
  direction = "row",
  position = "top-left",
  variant = "gradient",
}: LegendProps) {
  if (!payload || payload.length === 0) return null;
  const side = position.split("-")[1];
  const align = side === "left" ? "start" : side === "right" ? "end" : "center";
  const items = payload.map((entry) => (
    <Row key={entry.value} vertical="center" gap="8">
      <Swatch color={entry.color} size="m" variant={variant} />
      <Text variant="label-default-s" numberOfLines={1}>
        {entry.value}
      </Text>
    </Row>
  ));
  return direction === "column" ? (
    <Column fillWidth gap="8" horizontal={align} paddingX="20" paddingY="12">
      {items}
    </Column>
  ) : (
    <Row fillWidth wrap gap="16" horizontal={align} vertical="center" paddingX="20" paddingY="12">
      {items}
    </Row>
  );
}
