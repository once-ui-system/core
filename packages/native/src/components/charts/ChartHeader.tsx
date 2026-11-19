import type { ReactNode } from "react";
import { Column, type FlexProps } from "../Flex";
import { Text } from "../Text";

export interface ChartHeaderProps extends FlexProps {
  title?: ReactNode;
  description?: ReactNode;
}

const textOrNode = (node: ReactNode, text: (children: ReactNode) => ReactNode) =>
  typeof node === "string" || typeof node === "number" ? text(node) : node;

/**
 * Core's `ChartHeader`: the chart's title and description. Nothing when both
 * are empty. There is no date range picker on native.
 */
export function ChartHeader({ title, description, ...flex }: ChartHeaderProps) {
  if (!title && !description) return null;
  return (
    <Column fillWidth paddingX="20" paddingY="12" gap="4" {...flex}>
      {title &&
        textOrNode(title, (children) => (
          <Text textVariant="heading-strong-xs" accessibilityRole="header">
            {children}
          </Text>
        ))}
      {description &&
        textOrNode(description, (children) => (
          <Text textVariant="label-default-s" onBackground="neutral-weak">
            {children}
          </Text>
        ))}
    </Column>
  );
}
