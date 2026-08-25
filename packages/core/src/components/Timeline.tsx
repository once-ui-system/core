import { cva } from "class-variance-authority";
import type { ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "../classes/utils";
import type { SpacingToken, TShirtSizes } from "../types";
import { Column } from "./Column";
import { Flex, type FlexComponentProps } from "./Flex";
import { Line } from "./Line";
import { Text } from "./Text";

export const timelineVariants = cva("");

export interface TimelineItem {
  label?: ReactNode;
  description?: ReactNode;
  state?: "default" | "active" | "success" | "danger" | "completed" | "error";
  marker?: ReactNode;
  children?: ReactNode;
}

export interface TimelineProps extends Omit<FlexComponentProps, "children"> {
  items: TimelineItem[];
  alignment?: "left" | "right";
  size?: TShirtSizes;
}

const normalizeState = (state?: string): "default" | "active" | "success" | "danger" => {
  if (state === "completed") return "success";
  if (state === "error") return "danger";
  if (state === "active" || state === "success" || state === "danger") return state;
  return "default";
};

const getStateColor = (state: "default" | "active" | "success" | "danger") => {
  switch (state) {
    case "active":
      return "var(--brand-solid-strong)";
    case "success":
      return "var(--success-solid-strong)";
    case "danger":
      return "var(--danger-solid-strong)";
    default:
      return "var(--neutral-solid-strong)";
  }
};

const getDotSize = (size: TShirtSizes = "m"): SpacingToken => {
  switch (size) {
    case "xs":
      return "8";
    case "s":
      return "24";
    case "m":
      return "32";
    case "l":
      return "40";
    case "xl":
      return "48";
    default:
      return "32";
  }
};

const renderDot = (
  item: TimelineItem,
  state: "default" | "active" | "success" | "danger",
  dotSize: SpacingToken,
) => (
  <Flex
    center
    radius="full"
    solid={
      state === "active"
        ? "brand-strong"
        : state === "success"
          ? "success-strong"
          : state === "danger"
            ? "danger-strong"
            : undefined
    }
    background={state === "default" ? "neutral-weak" : undefined}
    border={
      state === "success"
        ? "success-strong"
        : state === "danger"
          ? "danger-strong"
          : state === "active"
            ? "brand-strong"
            : "neutral-strong"
    }
    minHeight={dotSize}
    maxHeight={dotSize}
    minWidth={dotSize}
    maxWidth={dotSize}
  >
    {item.marker && (
      <Flex
        center
        onSolid={
          state === "active"
            ? "brand-strong"
            : state === "success"
              ? "success-strong"
              : state === "danger"
                ? "danger-strong"
                : undefined
        }
        onBackground={state === "default" ? "neutral-weak" : undefined}
        textVariant="label-default-m"
      >
        {item.marker}
      </Flex>
    )}
  </Flex>
);

const Timeline = forwardRef<HTMLDivElement, TimelineProps>(
  ({ items = [], alignment = "left", size = "m", className, style, ...flex }, ref) => {
    const dotSize = getDotSize(size);
    const isHorizontal = flex.direction === "row";
    const markerWidth = isHorizontal ? undefined : dotSize;

    return (
      <Column ref={ref} className={cn(timelineVariants(), className)} style={style} {...flex}>
        {items.map((item, index) => {
          const state = normalizeState(item.state);
          const nextRawState = index < items.length - 1 ? items[index + 1].state : undefined;
          const nextState = nextRawState ? normalizeState(nextRawState) : state;

          const currentColor = getStateColor(state);
          const nextColor = getStateColor(nextState);

          const gradientToNext = isHorizontal
            ? `linear-gradient(to right, ${currentColor}, ${nextColor})`
            : `linear-gradient(to bottom, ${currentColor}, ${nextColor})`;

          if (isHorizontal) {
            return (
              <Flex
                // biome-ignore lint/suspicious/noArrayIndexKey: timeline items may not have unique identifiers
                key={index}
                direction="column"
                fillWidth
              >
                <Column fillWidth horizontal="center" vertical="center" direction="row">
                  {index !== 0 && (
                    <Line
                      background={undefined}
                      solid={
                        state === "active"
                          ? "brand-strong"
                          : state === "success"
                            ? "success-strong"
                            : state === "danger"
                              ? "danger-strong"
                              : "neutral-strong"
                      }
                    />
                  )}
                  {renderDot(item, state, dotSize)}
                  {index !== items.length - 1 && (
                    <Line background={undefined} style={{ background: gradientToNext }} />
                  )}
                </Column>
                <Column
                  fillWidth
                  paddingX="20"
                  paddingTop="12"
                  paddingBottom="24"
                  horizontal={index === 0 ? "start" : index === items.length - 1 ? "end" : "center"}
                  align={index === 0 ? "left" : index === items.length - 1 ? "right" : "center"}
                  gap="2"
                >
                  {item.label && (
                    <Text
                      variant="label-default-m"
                      onBackground={state === "danger" ? "danger-weak" : undefined}
                    >
                      {item.label}
                    </Text>
                  )}
                  {item.description && (
                    <Text
                      variant="body-default-s"
                      onBackground={state === "danger" ? "danger-weak" : "neutral-weak"}
                    >
                      {item.description}
                    </Text>
                  )}
                  {item.children}
                </Column>
              </Flex>
            );
          }

          const rowDirection = alignment === "right" ? "row-reverse" : undefined;

          return (
            <Flex
              // biome-ignore lint/suspicious/noArrayIndexKey: timeline items may not have unique identifiers
              key={index}
              fillWidth
              direction={rowDirection}
            >
              <Column horizontal="center" minWidth={markerWidth} maxWidth={markerWidth}>
                {index !== 0 && (
                  <Line
                    vert
                    fillHeight
                    background={undefined}
                    solid={
                      state === "active"
                        ? "brand-strong"
                        : state === "success"
                          ? "success-strong"
                          : state === "danger"
                            ? "danger-strong"
                            : "neutral-strong"
                    }
                    minHeight="8"
                  />
                )}
                {renderDot(item, state, dotSize)}
                {index !== items.length - 1 && (
                  <Line
                    vert
                    fillHeight
                    background={undefined}
                    style={{ background: gradientToNext }}
                    minHeight="8"
                  />
                )}
              </Column>
              <Column
                fillWidth
                paddingX="20"
                paddingBottom={index !== items.length - 1 ? "24" : undefined}
                vertical="center"
                gap="2"
                align={alignment === "right" ? "right" : undefined}
              >
                {item.label && (
                  <Text
                    variant="label-default-m"
                    onBackground={state === "danger" ? "danger-weak" : undefined}
                  >
                    {item.label}
                  </Text>
                )}
                {item.description && (
                  <Text
                    variant="body-default-s"
                    onBackground={state === "danger" ? "danger-weak" : "neutral-weak"}
                  >
                    {item.description}
                  </Text>
                )}
                {item.children}
              </Column>
            </Flex>
          );
        })}
      </Column>
    );
  },
);

Timeline.displayName = "Timeline";

export { Timeline };
