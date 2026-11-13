import { forwardRef, type ReactNode } from "react";
import { type FlexProps, Row } from "./Flex";
import { Icon, type IconName } from "./Icon";
import type { RefComponent, ViewRef } from "./refs";
import { Text } from "./Text";

export interface TooltipProps extends FlexProps {
  label: ReactNode;
  prefixIcon?: IconName;
  suffixIcon?: IconName;
}

/**
 * Core's `Tooltip`: the small surface bubble a hint is drawn in. Like core's,
 * it only draws the bubble; `InfoTip` shows a tip on press.
 */
export const Tooltip: RefComponent<TooltipProps, ViewRef> = forwardRef<ViewRef, TooltipProps>(
  function Tooltip({ label, prefixIcon, suffixIcon, ...flex }, ref) {
    return (
      <Row
        ref={ref}
        vertical="center"
        gap="4"
        zIndex={1}
        background="surface"
        paddingY="4"
        paddingX="8"
        radius="s"
        border="neutral-medium"
        style={{ alignSelf: "flex-start" }}
        {...flex}
      >
        {prefixIcon && <Icon name={prefixIcon} size="xs" />}
        <Row paddingX="2" vertical="center">
          {typeof label === "string" || typeof label === "number" ? (
            <Text textVariant="body-default-xs" onBackground="neutral-strong" numberOfLines={1}>
              {label}
            </Text>
          ) : (
            label
          )}
        </Row>
        {suffixIcon && <Icon name={suffixIcon} size="xs" />}
      </Row>
    );
  },
);
