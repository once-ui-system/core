"use client";

import React, { ReactNode } from "react";
import type { IconName } from "../icons.js";
import type { Tone } from "../types.js";
import { Column } from "./Column.js";
import { Flex } from "./Flex.js";
import { Icon } from "./Icon.js";
import { IconButton } from "./IconButton.js";
import { Row } from "./Row.js";
import { Text } from "./Text.js";

interface FeedbackProps extends Omit<React.ComponentProps<typeof Flex>, "title"> {
  /** The palette, and the icon that goes with it. Defaults to `info`. */
  tone?: Tone;
  showIcon?: boolean;
  /** Overrides the tone's icon. Custom names work once registered through
   *  the `IconLibraryOverrides` interface, which is what widens `IconName`. */
  icon?: IconName;
  title?: string;
  description?: string;
  showCloseButton?: boolean;
  onClose?: () => void;
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
}

const toneIconMap: Partial<Record<Tone, IconName>> = {
  info: "info",
  danger: "danger",
  warning: "warning",
  success: "check",
};

const Feedback = ({
  ref,
  tone = "info",
  showIcon = true,
  icon,
  title,
  description,
  showCloseButton = false,
  onClose,
  className,
  style,
  children,
  ...rest
}: FeedbackProps) => {
  return (
    <Flex
      fillWidth
      radius="l"
      ref={ref}
      border={`${tone}-medium`}
      background={`${tone}-medium`}
      vertical={title || children ? "start" : "center"}
      // Only a problem interrupts: danger and warning are alerts, the other
      // tones a polite status. Every docs callout used to be read out as an
      // alert. `role` and `aria-live` can still be set through the rest.
      role={tone === "danger" || tone === "warning" ? "alert" : "status"}
      aria-live={tone === "danger" || tone === "warning" ? "assertive" : "polite"}
      className={className}
      style={style}
      {...rest}
    >
      {showIcon && (
        <Flex paddingY="16" paddingLeft="16">
          <Row padding="2">
            <Icon
              onBackground={`${tone}-medium`}
              name={icon ?? toneIconMap[tone] ?? "info"}
              aria-hidden="true"
            />
          </Row>
        </Flex>
      )}
      <Column fillWidth padding="16" gap="24" vertical="center">
        {(title || description) && (
          <Column fillWidth gap="2">
            {title && (
              <Flex fillWidth gap="16">
                <Flex fillWidth paddingY="4">
                  <Text
                    textVariant="heading-strong-xs"
                    onBackground={`${tone}-medium`}
                    role="heading"
                    aria-level={2}
                  >
                    {title}
                  </Text>
                </Flex>
                {showCloseButton && (
                  <IconButton
                    type="button"
                    onClick={onClose}
                    icon="close"
                    size="m"
                    tooltip="Hide"
                    tooltipPosition="top"
                    variant="ghost"
                    aria-label="Close alert"
                  />
                )}
              </Flex>
            )}
            {description && (
              <Text marginBottom="2" textVariant="body-default-s" onBackground={`${tone}-strong`}>
                {description}
              </Text>
            )}
          </Column>
        )}
        {children}
      </Column>
    </Flex>
  );
};

Feedback.displayName = "Feedback";

export { Feedback };
