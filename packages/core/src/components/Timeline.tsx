"use client";

import React from "react";
import { Column, Flex, Line, Text } from ".";
import { TShirtSizes } from "@/types";

export interface TimelineItem {
  label?: React.ReactNode;
  description?: React.ReactNode;
  state?: "default" | "active" | "success" | "danger";
  marker?: React.ReactNode;
  children?: React.ReactNode;
}

interface TimelineProps extends Omit<React.ComponentProps<typeof Flex>, 'children'> {
  items: TimelineItem[];
  alignment?: "left" | "right";
  size?: TShirtSizes;
}

const Timeline: React.FC<TimelineProps> = ({
  items,
  alignment = "left",
  size = "m",
  ...flex
}) => {
  // Helper to get color variable for state
  const getStateColor = (state: string) => {
    switch (state) {
      case "active": return "var(--brand-solid-strong)";
      case "success": return "var(--success-solid-strong)";
      case "danger": return "var(--danger-solid-strong)";
      default: return "var(--neutral-solid-strong)";
    }
  };

  const dotSize = size === "xs" ? "8" : size === "s" ? "24" : size === "m" ? "32" : size === "l" ? "40" : "48";
  const isHorizontal = flex.direction === "row";

  const renderDot = (item: TimelineItem, state: string) => (
    <Flex
      center
      radius="full"
      solid={state === "active" ? "brand-strong" : state === "success" ? "success-strong" : state === "danger" ? "danger-strong" : undefined}
      background={state === "default" ? "neutral-weak" : undefined}
      border={state === "success" ? "success-strong" : state === "danger" ? "danger-strong" : state === "active" ? "brand-strong" : "neutral-strong"}
      minHeight={dotSize}
      maxHeight={dotSize}
      minWidth={dotSize}
      maxWidth={dotSize}
    >
      {item.marker && (
        <Flex
          center
          onSolid={state === "active" ? "brand-strong" : state === "success" ? "success-strong" : state === "danger" ? "danger-strong" : undefined}
          onBackground={state === "default" ? "neutral-weak" : undefined}
          textVariant="label-default-m"
        >
          {item.marker}
        </Flex>
      )}
    </Flex>
  );

  const markerWidth = isHorizontal ? undefined : dotSize;

  return (
    <Column {...flex}>
      {items.map((item, index) => {
        const state = item.state || "default";
        const nextState = index < items.length - 1 ? (items[index + 1].state || "default") : state;

        const currentColor = getStateColor(state);
        const nextColor = getStateColor(nextState);

        const gradientToNext = isHorizontal
          ? `linear-gradient(to right, ${currentColor}, ${nextColor})`
          : `linear-gradient(to bottom, ${currentColor}, ${nextColor})`;

        if (isHorizontal) {
          return (
            <Flex key={index} direction="column" fillWidth>
              <Column
                fillWidth
                horizontal="center"
                vertical="center"
                direction="row"
              >
                {index !== 0 && (
                  <Line
                    background={undefined}
                    solid={state === "active" ? "brand-strong" : state === "success" ? "success-strong" : state === "danger" ? "danger-strong" : "neutral-strong"}
                  />
                )}
                {renderDot(item, state)}
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
                  <Text variant="label-default-m" onBackground={state === "danger" ? "danger-weak" : undefined}>{item.label}</Text>
                )}
                {item.description && (
                  <Text variant="body-default-s" onBackground={state === "danger" ? "danger-weak" : "neutral-weak"}>{item.description}</Text>
                )}
                {item.children}
              </Column>
            </Flex>
          );
        }

        const rowDirection = alignment === "right" ? "row-reverse" : undefined;
        const hasContent = item.description || item.children;

        return (
          <Flex key={index} fillWidth direction={rowDirection}>
            <Column horizontal="center" minWidth={markerWidth} maxWidth={markerWidth}>
              {index !== 0 && (
                <Line
                  vert
                  fillHeight
                  background={undefined}
                  solid={state === "active" ? "brand-strong" : state === "success" ? "success-strong" : state === "danger" ? "danger-strong" : "neutral-strong"}
                  minHeight="8"
                />
              )}
              {renderDot(item, state)}
              {index !== items.length - 1 && (
                <Line vert fillHeight background={undefined} style={{ background: gradientToNext }} minHeight="8" />
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
                <Text variant="label-default-m" onBackground={state === "danger" ? "danger-weak" : undefined}>{item.label}</Text>
              )}
              {item.description && (
                <Text variant="body-default-s" onBackground={state === "danger" ? "danger-weak" : "neutral-weak"}>{item.description}</Text>
              )}
              {item.children}
            </Column>
          </Flex>
        );
      })}
    </Column>
  );
};

Timeline.displayName = "Timeline";

export { Timeline };
