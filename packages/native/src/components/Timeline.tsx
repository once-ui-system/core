import { type ReactNode, useId } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { useTheme } from "../theme/ThemeProvider";
import type { TShirtSizes } from "../types";
import { Column, Flex, type FlexProps, Row } from "./Flex";
import { Text } from "./Text";

export interface TimelineItem {
  label?: ReactNode;
  description?: ReactNode;
  state?: "default" | "active" | "success" | "danger";
  /** Drawn inside the dot, such as a step number or an icon. */
  marker?: ReactNode;
  children?: ReactNode;
}

export interface TimelineProps extends Omit<FlexProps, "children"> {
  items: TimelineItem[];
  /** Which side the dots are on, for a vertical timeline. */
  alignment?: "left" | "right";
  size?: TShirtSizes;
}

type State = NonNullable<TimelineItem["state"]>;

const SCHEME = {
  default: "neutral",
  active: "brand",
  success: "success",
  danger: "danger",
} as const;
const DOT = { xs: "8", s: "24", m: "32", l: "40", xl: "48" } as const;

/** The 1pt line from one step to the next, fading from its colour to the next one's. */
function Connector({ from, to, vertical }: { from: string; to: string; vertical: boolean }) {
  const theme = useTheme();
  const id = `timeline${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const shape = vertical
    ? { width: 1, flex: 1, minHeight: theme.space("8") }
    : { height: 1, flex: 1 };
  if (from === to) return <View style={[shape, { backgroundColor: from }]} />;
  return (
    <View style={shape}>
      {/* Absolute, so the SVG's own default height can't stretch the step. */}
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2={vertical ? "0" : "1"} y2={vertical ? "1" : "0"}>
            <Stop offset="0" stopColor={from} />
            <Stop offset="1" stopColor={to} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

/**
 * Core's `Timeline`: steps joined by a line, each with a dot coloured by its
 * state. Vertical by default; `direction="row"` lays the steps side by side.
 */
export function Timeline({ items, alignment = "left", size = "m", ...flex }: TimelineProps) {
  const theme = useTheme();
  const isHorizontal = flex.direction === "row";
  const dot = theme.space(DOT[size]);
  const color = (state: State) => theme.color(`${SCHEME[state]}-solid-strong`);

  const renderDot = (item: TimelineItem, state: State) => (
    <View
      style={{
        width: dot,
        height: dot,
        borderRadius: 9999,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        borderColor: theme.border(`${SCHEME[state]}-strong`),
        backgroundColor: state === "default" ? theme.background("neutral-weak") : color(state),
      }}
    >
      {typeof item.marker === "string" || typeof item.marker === "number" ? (
        <Text
          textVariant="label-default-m"
          {...(state === "default"
            ? { onBackground: "neutral-weak" }
            : { onSolid: `${SCHEME[state]}-strong` })}
        >
          {item.marker}
        </Text>
      ) : (
        item.marker
      )}
    </View>
  );

  const renderText = (item: TimelineItem, state: State, align?: "left" | "center" | "right") => (
    <>
      {item.label && (
        <Text
          textVariant="label-default-m"
          align={align}
          onBackground={state === "danger" ? "danger-weak" : undefined}
        >
          {item.label}
        </Text>
      )}
      {item.description && (
        <Text
          textVariant="body-default-s"
          align={align}
          onBackground={state === "danger" ? "danger-weak" : "neutral-weak"}
        >
          {item.description}
        </Text>
      )}
      {item.children}
    </>
  );

  return (
    // A list of steps: a screen reader says how many there are. The active one is selected.
    <Flex direction="column" role="list" {...flex}>
      {items.map((item, index) => {
        const state = item.state || "default";
        const last = index === items.length - 1;
        const next = last ? state : items[index + 1].state || "default";

        if (isHorizontal) {
          const align = index === 0 ? "left" : last ? "right" : "center";
          return (
            <Column
              // biome-ignore lint/suspicious/noArrayIndexKey: steps are positional
              key={index}
              flex={1}
              role="listitem"
              accessibilityState={{ selected: state === "active" }}
            >
              <Row fillWidth vertical="center">
                {/* The first dot sits at the start and the last at the end, as in core. */}
                {index !== 0 && (
                  <View style={{ height: 1, flex: 1, backgroundColor: color(state) }} />
                )}
                {renderDot(item, state)}
                {!last && <Connector from={color(state)} to={color(next)} vertical={false} />}
              </Row>
              <Column
                paddingX="20"
                paddingTop="12"
                paddingBottom="24"
                gap="2"
                horizontal={index === 0 ? "start" : last ? "end" : "center"}
              >
                {renderText(item, state, align)}
              </Column>
            </Column>
          );
        }

        return (
          <Row
            // biome-ignore lint/suspicious/noArrayIndexKey: steps are positional
            key={index}
            fillWidth
            direction={alignment === "right" ? "row-reverse" : "row"}
            role="listitem"
            accessibilityState={{ selected: state === "active" }}
          >
            <Column horizontal="center" style={{ width: dot }}>
              {index !== 0 && (
                <View
                  style={{
                    width: 1,
                    flex: 1,
                    minHeight: theme.space("8"),
                    backgroundColor: color(state),
                  }}
                />
              )}
              {renderDot(item, state)}
              {!last && <Connector from={color(state)} to={color(next)} vertical />}
            </Column>
            <Column
              flex={1}
              paddingX="20"
              paddingBottom={last ? undefined : "24"}
              vertical="center"
              gap="2"
            >
              {renderText(item, state, alignment === "right" ? "right" : undefined)}
            </Column>
          </Row>
        );
      })}
    </Flex>
  );
}
