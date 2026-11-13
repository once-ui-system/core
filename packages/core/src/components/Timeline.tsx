import classNames from "clsx";
import type React from "react";
import type { Tone, TShirtSizes } from "../types.js";
import { Column } from "./Column.js";
import { Flex } from "./Flex.js";
import { Text } from "./Text.js";
import styles from "./Timeline.module.scss";

export interface TimelineItem {
  label?: React.ReactNode;
  description?: React.ReactNode;
  /**
   * A step reached, in its palette: a vivid dot off centre in the step's node
   * (or its marker in the tone) and, for `danger`, its text. `brand` is the
   * current step: its dot orbits the node (it stays put under reduced motion). Leave it out for a step not reached yet: an
   * empty node on a dashed rail. 2.x's `state: "active"` is `tone: "brand"`.
   */
  tone?: Tone;
  /** A number, letter or icon in the node instead of the dot. */
  marker?: React.ReactNode;
  children?: React.ReactNode;
}

interface TimelineProps extends Omit<React.ComponentProps<typeof Flex>, "children"> {
  items: TimelineItem[];
  alignment?: "left" | "right";
  size?: TShirtSizes;
}

const labelVariant = {
  xs: "label-default-s",
  s: "label-default-s",
  m: "label-default-m",
  l: "label-default-m",
  xl: "label-default-l",
} as const;

const descriptionVariant = {
  xs: "body-default-xs",
  s: "body-default-xs",
  m: "body-default-s",
  l: "body-default-s",
  xl: "body-default-m",
} as const;

const Timeline = ({
  ref,
  items,
  alignment = "left",
  size = "m",
  className,
  ...flex
}: TimelineProps) => {
  const isHorizontal = flex.direction === "row";
  const hasMarker = items.some((item) => item.marker !== undefined && item.marker !== null);
  // The rail is solid up to the last step reached and dashed after it.
  const lastReached = items.reduce((last, item, index) => (item.tone ? index : last), -1);

  const renderNode = (item: TimelineItem) => {
    const current = item.tone === "brand";
    return (
      <span
        className={classNames(
          styles.node,
          item.tone ? styles.reached : styles.upcoming,
          item.tone && styles[`tone-${item.tone}`],
          current && styles.current,
        )}
        data-tone={item.tone}
      >
        {hasMarker ? (
          item.marker !== undefined && item.marker !== null ? (
            <Text as="span" textVariant={labelVariant[size]} style={{ color: "inherit" }}>
              {item.marker}
            </Text>
          ) : null
        ) : (
          // The dot sits off centre on purpose, so a step never reads as a
          // radio button; on the current step it orbits the node.
          item.tone && (
            <span className={styles.orbit} aria-hidden>
              <span className={styles.dot} />
            </span>
          )
        )}
      </span>
    );
  };

  const rail = (reached: boolean, hidden = false) => (
    <span
      aria-hidden
      data-rail={hidden ? undefined : reached ? "reached" : "upcoming"}
      className={classNames(
        styles.rail,
        !reached && styles.railUpcoming,
        hidden && styles.railNone,
      )}
    />
  );

  const renderText = (item: TimelineItem, align?: "left" | "center" | "right") => {
    const danger = item.tone === "danger";
    return (
      <>
        {item.label && (
          <div className={styles.labelRow} style={{ justifyContent: flexAlign(align) }}>
            <Text
              textVariant={labelVariant[size]}
              onBackground={danger ? "danger-weak" : item.tone ? "neutral-strong" : undefined}
              className={item.tone ? undefined : styles.upcomingLabel}
            >
              {item.label}
            </Text>
          </div>
        )}
        {item.description && (
          <Text
            textVariant={descriptionVariant[size]}
            onBackground={danger ? "danger-weak" : "neutral-weak"}
          >
            {item.description}
          </Text>
        )}
        {item.children}
      </>
    );
  };

  return (
    // A list of steps: a screen reader says how many there are and which
    // one the reader is on. The `brand` step is the current one.
    <Column
      ref={ref}
      role="list"
      className={classNames(
        styles.timeline,
        size !== "m" && styles[`size-${size}`],
        hasMarker && styles.hasMarker,
        isHorizontal && styles.row,
        className,
      )}
      {...flex}
    >
      {items.map((item, index) => {
        const first = index === 0;
        const last = index === items.length - 1;
        // The rail into this step is reached when this step is; the rail out
        // of it when the next one is.
        const railIn = index <= lastReached;
        const railOut = index + 1 <= lastReached;

        if (isHorizontal) {
          const align = first ? "left" : last ? "right" : "center";
          return (
            <Flex
              // biome-ignore lint/suspicious/noArrayIndexKey: steps have no id; a step is its position in the list.
              key={index}
              direction="column"
              fillWidth
              role="listitem"
              aria-current={item.tone === "brand" ? "step" : undefined}
            >
              <div className={styles.track}>
                {rail(railIn, first)}
                <span className={styles.anchor}>{renderNode(item)}</span>
                {rail(railOut, last)}
              </div>
              <Column
                fillWidth
                className={styles.content}
                paddingTop="8"
                paddingBottom="16"
                paddingX="8"
                horizontal={first ? "start" : last ? "end" : "center"}
                align={align}
                gap="2"
              >
                {renderText(item, align)}
              </Column>
            </Flex>
          );
        }

        return (
          <Flex
            // biome-ignore lint/suspicious/noArrayIndexKey: steps have no id; a step is its position in the list.
            key={index}
            fillWidth
            direction={alignment === "right" ? "row-reverse" : undefined}
            role="listitem"
            aria-current={item.tone === "brand" ? "step" : undefined}
          >
            <div className={styles.track}>
              <span className={styles.anchor}>{renderNode(item)}</span>
              {!last && rail(railOut)}
            </div>
            <Column
              fillWidth
              className={styles.content}
              paddingX="12"
              paddingBottom={last ? undefined : "20"}
              gap="2"
              align={alignment === "right" ? "right" : undefined}
              horizontal={alignment === "right" ? "end" : undefined}
            >
              {renderText(item, alignment === "right" ? "right" : undefined)}
            </Column>
          </Flex>
        );
      })}
    </Column>
  );
};

const flexAlign = (align?: "left" | "center" | "right") =>
  align === "right" ? "flex-end" : align === "center" ? "center" : undefined;

Timeline.displayName = "Timeline";

export { Timeline };
