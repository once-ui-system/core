import type { ReactNode } from "react";
import { Column } from "./Flex";
import { Text } from "./Text";

export interface InteractiveDetailsProps {
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

/** The label and description beside a `Switch` or `Checkbox`, as in core. */
export function InteractiveDetails({ label, description, disabled }: InteractiveDetailsProps) {
  if (!label && !description) return null;
  return (
    <Column flex={1} gap="2">
      {label && (
        <Text variant="label-default-m" onBackground={disabled ? "neutral-weak" : "neutral-strong"}>
          {label}
        </Text>
      )}
      {description && (
        <Text variant="body-default-s" onBackground="neutral-weak">
          {description}
        </Text>
      )}
    </Column>
  );
}
