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

interface TimelineProps extends Omit<React.ComponentProps<typeof Flex>, "children"> {
  items: TimelineItem[];
  alignment?: "left" | "right";
  size?: TShirtSizes;
}

const Timeline: React.FC<TimelineProps> = ({ items, alignment = "left", size = "m", ...flex }) => {
  // Helper to get color variable for state
  const getStateColor = (state: string) => {
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

  const dimensionSize =
    size === "xs" ? "8" : size === "s" ? "24" : size === "m" ? "32" : size === "l" ? "40" : "48";
  const topOffset =
    size === "xs" ? "20" : size === "s" ? "12" : size === "m" ? "8" : size === "l" ? "4" : "0";

  return (
    <Column {...flex}>
      {items.map((item, index) => {
        const state = item.state || "default";
        const nextState = index < items.length - 1 ? items[index + 1].state || "default" : state;

        const currentColor = getStateColor(state);
        const nextColor = getStateColor(nextState);

        const isHorizontal = flex.direction === "row";
        const gradientToNext = isHorizontal
          ? `linear-gradient(to right, ${currentColor}, ${nextColor})`
          : `linear-gradient(to bottom, ${currentColor}, ${nextColor})`;

        return (
          <Flex
            key={index}
            direction={isHorizontal ? "column" : alignment === "right" ? "row-reverse" : undefined}
            fillWidth
          >
            {/* Marker */}
            <Column
              fillWidth
              horizontal="center"
              marginTop={isHorizontal ? undefined : index === 0 ? topOffset : undefined}
              paddingLeft={isHorizontal && index === 0 ? "20" : undefined}
              paddingRight={isHorizontal && index === items.length - 1 ? "20" : undefined}
              vertical={isHorizontal ? "center" : undefined}
              direction={isHorizontal ? "row" : "column"}
              minWidth={!isHorizontal ? dimensionSize : undefined}
              maxWidth={!isHorizontal ? dimensionSize : undefined}
            >
              {index !== 0 && (
                <Line
                  vert={!isHorizontal}
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
                  minHeight={isHorizontal ? undefined : topOffset}
                  maxHeight={isHorizontal ? undefined : topOffset}
                />
              )}
              <Flex
                fillWidth
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
                minHeight={dimensionSize}
                maxHeight={dimensionSize}
                minWidth={dimensionSize}
                maxWidth={dimensionSize}
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
              {index !== items.length - 1 && (
                <Line
                  vert={!isHorizontal}
                  background={undefined}
                  style={{ background: gradientToNext }}
                />
              )}
            </Column>

            {/* Content */}
            <Column
              fillWidth
              paddingX="20"
              paddingTop="12"
              paddingBottom="24"
              horizontal={
                isHorizontal && index === 0
                  ? "start"
                  : isHorizontal && index === items.length - 1
                    ? "end"
                    : isHorizontal
                      ? "center"
                      : undefined
              }
              align={
                isHorizontal && index === 0
                  ? "left"
                  : isHorizontal && index === items.length - 1
                    ? "right"
                    : isHorizontal
                      ? "center"
                      : alignment === "right"
                        ? "right"
                        : undefined
              }
              gap="2"
            >
              <>
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
              </>
            </Column>
          </Flex>
        );
      })}
    </Column>
  );
};

Timeline.displayName = "Timeline";

export { Timeline };
