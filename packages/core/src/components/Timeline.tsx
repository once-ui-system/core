import React from "react";
import { Tone, TShirtSizes } from "../types.js";
import { Column } from "./Column.js";
import { Flex } from "./Flex.js";
import { Line } from "./Line.js";
import { Text } from "./Text.js";

export interface TimelineItem {
  label?: React.ReactNode;
  description?: React.ReactNode;
  /**
   * The step's palette: its dot, the line into it and, for `danger`, its
   * text. Leave it out for a step not reached yet. 2.x's `state: "active"`
   * is `tone: "brand"`.
   */
  tone?: Tone;
  marker?: React.ReactNode;
  children?: React.ReactNode;
}

interface TimelineProps extends Omit<React.ComponentProps<typeof Flex>, "children"> {
  items: TimelineItem[];
  alignment?: "left" | "right";
  size?: TShirtSizes;
}

const Timeline = ({ ref, items, alignment = "left", size = "m", ...flex }: TimelineProps) => {
  // The line between two steps fades from one's colour to the next.
  const toneColor = (tone?: Tone) =>
    tone ? `var(--${tone}-solid-strong)` : "var(--neutral-solid-strong)";

  const dotSize =
    size === "xs" ? "8" : size === "s" ? "24" : size === "m" ? "32" : size === "l" ? "40" : "48";
  const isHorizontal = flex.direction === "row";

  const renderDot = (item: TimelineItem, tone?: Tone) => (
    <Flex
      center
      radius="full"
      solid={tone ? `${tone}-strong` : undefined}
      background={tone ? undefined : "neutral-weak"}
      border={tone ? `${tone}-strong` : "neutral-strong"}
      minHeight={dotSize}
      maxHeight={dotSize}
      minWidth={dotSize}
      maxWidth={dotSize}
    >
      {item.marker && (
        <Flex
          center
          onSolid={tone ? `${tone}-strong` : undefined}
          onBackground={tone ? undefined : "neutral-weak"}
          textVariant="label-default-m"
        >
          {item.marker}
        </Flex>
      )}
    </Flex>
  );

  const markerWidth = isHorizontal ? undefined : dotSize;

  return (
    // A list of steps: a screen reader says how many there are and which
    // one the reader is on. The `brand` step is the current one.
    <Column role="list" {...flex}>
      {items.map((item, index) => {
        const tone = item.tone;
        const nextTone = index < items.length - 1 ? items[index + 1].tone : tone;

        const currentColor = toneColor(tone);
        const nextColor = toneColor(nextTone);

        const gradientToNext = isHorizontal
          ? `linear-gradient(to right, ${currentColor}, ${nextColor})`
          : `linear-gradient(to bottom, ${currentColor}, ${nextColor})`;

        if (isHorizontal) {
          return (
            <Flex
              key={index}
              direction="column"
              fillWidth
              role="listitem"
              aria-current={tone === "brand" ? "step" : undefined}
            >
              <Column fillWidth horizontal="center" vertical="center" direction="row">
                {index !== 0 && (
                  <Line background={undefined} solid={tone ? `${tone}-strong` : "neutral-strong"} />
                )}
                {renderDot(item, tone)}
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
                    textVariant="label-default-m"
                    onBackground={tone === "danger" ? "danger-weak" : undefined}
                  >
                    {item.label}
                  </Text>
                )}
                {item.description && (
                  <Text
                    textVariant="body-default-s"
                    onBackground={tone === "danger" ? "danger-weak" : "neutral-weak"}
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
        const hasContent = item.description || item.children;

        return (
          <Flex
            key={index}
            fillWidth
            direction={rowDirection}
            role="listitem"
            aria-current={tone === "brand" ? "step" : undefined}
          >
            <Column horizontal="center" minWidth={markerWidth} maxWidth={markerWidth}>
              {index !== 0 && (
                <Line
                  vert
                  fillHeight
                  background={undefined}
                  solid={tone ? `${tone}-strong` : "neutral-strong"}
                  minHeight="8"
                />
              )}
              {renderDot(item, tone)}
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
                  textVariant="label-default-m"
                  onBackground={tone === "danger" ? "danger-weak" : undefined}
                >
                  {item.label}
                </Text>
              )}
              {item.description && (
                <Text
                  textVariant="body-default-s"
                  onBackground={tone === "danger" ? "danger-weak" : "neutral-weak"}
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
};

Timeline.displayName = "Timeline";

export { Timeline };
