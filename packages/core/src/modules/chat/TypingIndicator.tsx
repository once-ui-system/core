import classNames from "clsx";
import type React from "react";
import type { ReactNode } from "react";
import { Row } from "../../components/Row.js";
import { Text } from "../../components/Text.js";
import { VisuallyHidden } from "../../components/VisuallyHidden.js";
import styles from "./Chat.module.scss";

export interface TypingIndicatorProps
  extends Omit<React.ComponentProps<typeof Row>, "children" | "aria-label"> {
  /** Text next to the dots, such as "Ana is typing". */
  label?: ReactNode;
  /** What a screen reader announces when there is no `label`. Defaults to "Typing". */
  "aria-label"?: string;
  /** Draw the dots in a bubble, to stand in for the reply in a message list. */
  bubble?: boolean;
}

/**
 * Three pulsing dots that say someone is writing, or that a reply is being
 * generated. It is a `status` region, so its label is announced once.
 */
const TypingIndicator = ({
  ref,
  label,
  "aria-label": ariaLabel = "Typing",
  bubble = true,
  className,
  ...flex
}: TypingIndicatorProps) => {
  return (
    <Row
      ref={ref}
      gap="8"
      vertical="center"
      role="status"
      className={classNames(styles.typing, className)}
      {...flex}
    >
      <Row
        gap="4"
        vertical="center"
        paddingX={bubble ? "12" : undefined}
        paddingY={bubble ? "12" : undefined}
        radius={bubble ? "l" : undefined}
        background={bubble ? "neutral-alpha-weak" : undefined}
        border={bubble ? "neutral-alpha-weak" : undefined}
        aria-hidden="true"
      >
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </Row>
      {label ? (
        <Text textVariant="body-default-xs" onBackground="neutral-weak">
          {label}
        </Text>
      ) : (
        <VisuallyHidden>{ariaLabel}</VisuallyHidden>
      )}
    </Row>
  );
};

TypingIndicator.displayName = "TypingIndicator";

export { TypingIndicator };
