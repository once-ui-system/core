import type { ReactNode } from "react";
import type { TShirtSizes } from "../types";
import { Column } from "./Flex";
import { Text } from "./Text";

/** The three sizes a checkbox, radio or switch is drawn at; `xs` and `xl` draw as `s` and `l`. */
export type ControlSize = "s" | "m" | "l";

/**
 * Core 3.0's `ControlChromeProps`, shared by Checkbox, RadioButton, Switch and
 * RadioGroup: their `size`, and `error` / `errorMessage` as on Input.
 */
export interface ControlChromeProps {
  size?: TShirtSizes;
  /** Marks the control invalid: a danger border (React Native has no `aria-invalid`). */
  error?: boolean;
  /** The message under the control. It marks the control invalid too. */
  errorMessage?: ReactNode;
}

const shows = (node: ReactNode) =>
  node !== undefined && node !== null && node !== false && node !== "";

/** The resolved size and invalid state of one control, as core's `useControlChrome`. */
export function controlChrome({ size = "m", error, errorMessage }: ControlChromeProps) {
  const showsError = shows(errorMessage);
  return {
    size: (size === "xs" ? "s" : size === "xl" ? "l" : size) as ControlSize,
    invalid: Boolean(error) || showsError,
    showsError,
  };
}

/** Core's label, description and error presets per control size. */
export const CONTROL_TEXT = {
  s: { label: "label-default-s", body: "body-default-xs" },
  m: { label: "label-default-m", body: "body-default-s" },
  l: { label: "label-default-l", body: "body-default-m" },
} as const;

export interface InteractiveDetailsProps {
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: ReactNode;
  disabled?: boolean;
  size?: ControlSize;
}

/** The label, description and error beside a `Switch`, `Checkbox` or `RadioButton`, as in core. */
export function InteractiveDetails({
  label,
  description,
  errorMessage,
  disabled,
  size = "m",
}: InteractiveDetailsProps) {
  const error = shows(errorMessage);
  if (!label && !description && !error) return null;
  const text = CONTROL_TEXT[size];
  return (
    <Column flex={1} gap="2">
      {label && (
        <Text textVariant={text.label} onBackground={disabled ? "neutral-weak" : "neutral-strong"}>
          {label}
        </Text>
      )}
      {description && (
        <Text textVariant={text.body} onBackground="neutral-weak">
          {description}
        </Text>
      )}
      {error && (
        <Text textVariant={text.body} onBackground="danger-weak" accessibilityLiveRegion="polite">
          {errorMessage}
        </Text>
      )}
    </Column>
  );
}
