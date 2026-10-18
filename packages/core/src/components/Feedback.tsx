"use client";

import React, { ReactNode } from "react";
import type { IconName } from "../icons.js";
import type { Tone } from "../types.js";
import { Column } from "./Column.js";
import { Flex } from "./Flex.js";
import { Icon } from "./Icon.js";
import { IconButton } from "./IconButton.js";
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
      role="alert"
      aria-live="assertive"
      className={className}
      style={style}
      {...rest}
    >
      {showIcon && (
        <Flex paddingY="16" paddingLeft="16">
          <Icon
            padding="2"
            radius="m"
            onBackground={`${tone}-medium`}
            name={icon ?? toneIconMap[tone] ?? "info"}
            aria-hidden="true"
          />
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
