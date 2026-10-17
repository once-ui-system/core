import type { ReactNode } from "react";
import type { ViewStyle } from "react-native";
import { Button } from "./Button";
import { Column, Row } from "./Flex";
import { Text } from "./Text";

export interface FeedbackProps {
  variant?: "info" | "danger" | "warning" | "success";
  title?: string;
  description?: string;
  /** An element before the text. Core takes an icon name; the preview has no icon set yet. */
  icon?: ReactNode;
  showCloseButton?: boolean;
  onClose?: () => void;
  children?: ReactNode;
  style?: ViewStyle;
}

/** Core's `Feedback`: an inline alert tinted by its variant, announced when it appears. */
export function Feedback({
  variant = "info",
  title,
  description,
  icon,
  showCloseButton = false,
  onClose,
  children,
  style,
}: FeedbackProps) {
  return (
    <Row
      fillWidth
      radius="l"
      border={`${variant}-medium`}
      background={`${variant}-medium`}
      vertical={title || children ? "start" : "center"}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      style={style}
    >
      {icon && (
        <Row paddingY="16" paddingLeft="16">
          {icon}
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
                  variant="heading-strong-xs"
                  onBackground={`${variant}-medium`}
                  accessibilityRole="header"
                >
                  {title}
                </Text>
                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="s"
                    label="Hide"
                    onPress={onClose}
                    accessibilityLabel="Close alert"
                  />
                )}
              </Row>
            )}
            {description && (
              <Text marginBottom="2" variant="body-default-s" onBackground={`${variant}-strong`}>
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
