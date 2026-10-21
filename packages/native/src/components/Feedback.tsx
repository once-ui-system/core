import type { ReactNode } from "react";
import type { ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import type { Tone } from "../types";
import { Column, Row } from "./Flex";
import { type IconName, type IconSlot, renderIcon } from "./Icon";
import { IconButton } from "./IconButton";
import { Text } from "./Text";

export interface FeedbackProps {
  /** The palette, and the icon that goes with it. Defaults to `info`. 2.x called it `variant`. */
  tone?: Tone;
  /** Shows the tone's icon (or `icon`) before the text. On by default, as in core. */
  showIcon?: boolean;
  /** Overrides the tone's icon: an icon name as in core, or any element. */
  icon?: IconSlot;
  title?: string;
  description?: string;
  showCloseButton?: boolean;
  onClose?: () => void;
  children?: ReactNode;
  style?: ViewStyle;
}

const TONE_ICONS: Partial<Record<Tone, IconName>> = {
  info: "info",
  danger: "danger",
  warning: "warning",
  success: "check",
};

/** Core's `Feedback`: an inline alert tinted by its tone, announced when it appears. */
export function Feedback({
  tone = "info",
  showIcon = true,
  icon,
  title,
  description,
  showCloseButton = false,
  onClose,
  children,
  style,
}: FeedbackProps) {
  const theme = useTheme();
  return (
    <Row
      fillWidth
      radius="l"
      border={`${tone}-medium`}
      background={`${tone}-medium`}
      vertical={title || children ? "start" : "center"}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      style={style}
    >
      {showIcon && (
        <Row paddingY="16" paddingLeft="16">
          <Row padding="2" importantForAccessibility="no-hide-descendants">
            {renderIcon(
              icon ?? TONE_ICONS[tone] ?? "info",
              "m",
              theme.onBackground(`${tone}-medium`),
            )}
          </Row>
        </Row>
      )}
      <Column flex={1} padding="16" gap="24" vertical="center">
        {(title || description) && (
          <Column fillWidth gap="2">
            {title && (
              <Row fillWidth gap="16" vertical="center">
                <Text
                  paddingY="4"
                  style={{ flex: 1 }}
                  textVariant="heading-strong-xs"
                  onBackground={`${tone}-medium`}
                  accessibilityRole="header"
                >
                  {title}
                </Text>
                {showCloseButton && (
                  <IconButton
                    icon="close"
                    size="m"
                    variant="ghost"
                    tooltip="Hide"
                    aria-label="Close alert"
                    onPress={onClose}
                  />
                )}
              </Row>
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
    </Row>
  );
}
