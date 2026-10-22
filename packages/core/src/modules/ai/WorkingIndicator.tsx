"use client";

import classNames from "clsx";
import type React from "react";
import { Fragment, forwardRef, type ReactNode, useEffect, useState } from "react";
import { LogoSpinner } from "../../components/LogoSpinner";
import { Row } from "../../components/Row";
import { Text } from "../../components/Text";
import { VisuallyHidden } from "../../components/VisuallyHidden";
import styles from "./Ai.module.scss";
import { workingVerbs } from "./workingVerbs";

export interface WorkingIndicatorProps extends Omit<React.ComponentProps<typeof Row>, "children"> {
  /** The words to cycle through. Defaults to `workingVerbs`. */
  verbs?: readonly string[];
  /** A fixed line instead of the cycling verbs, such as "Searching the docs". */
  label?: ReactNode;
  /** Milliseconds each verb stays. */
  interval?: number;
  /** Visit the verbs in a random order (never the same one twice in a row). Off walks the list in order. */
  shuffle?: boolean;
  /** A light sweep across the words, as on a loading line. Off under reduced motion. */
  shimmer?: boolean;
  /** Show seconds since `startedAt`, or since the indicator appeared. */
  showElapsed?: boolean;
  /** When the work began, so the count survives a remount. A `Date` or epoch milliseconds. */
  startedAt?: Date | number;
  /** Quiet text after the verb, such as "esc to stop". */
  detail?: ReactNode;
  /** The loader before the words. `LogoSpinner` by default; `false` for none. */
  loader?: ReactNode | false;
  size?: "s" | "m" | "l";
  /** What screen readers announce once. The cycling words are not read out. */
  ariaLabel?: string;
}

const TEXT_VARIANT = {
  s: "body-default-xs",
  m: "body-default-s",
  l: "body-default-m",
} as const;

const LOADER_SIZE = { s: "xs", m: "s", l: "m" } as const;

/** Seconds as "8s" or "1m 05s". */
const formatElapsed = (seconds: number) =>
  seconds < 60
    ? `${seconds}s`
    : `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, "0")}s`;

/**
 * Says an assistant is working, with a moving mark and a playful verb that
 * changes every few seconds: "Imagining…", "Noodling…", "Kerning…".
 *
 * The first render shows the first verb, so the server and the client agree;
 * shuffling starts after mount. It is one `status` region with a fixed label,
 * so a screen reader hears "Working" once instead of every new verb.
 */
const WorkingIndicator = forwardRef<HTMLDivElement, WorkingIndicatorProps>(
  (
    {
      verbs = workingVerbs,
      label,
      interval = 2800,
      shuffle = true,
      shimmer = true,
      showElapsed = false,
      startedAt,
      detail,
      loader,
      size = "m",
      ariaLabel = "Working",
      className,
      ...flex
    },
    ref,
  ) => {
    const [index, setIndex] = useState(0);
    const [elapsed, setElapsed] = useState(0);
    const cycling = label === undefined && verbs.length > 1;

    useEffect(() => {
      if (!cycling) return;
      const next = (current: number) => {
        if (!shuffle) return (current + 1) % verbs.length;
        // Any index but the current one, uniformly.
        const step = 1 + Math.floor(Math.random() * (verbs.length - 1));
        return (current + step) % verbs.length;
      };
      if (shuffle) setIndex((current) => next(current));
      const id = window.setInterval(() => setIndex(next), interval);
      return () => window.clearInterval(id);
    }, [cycling, interval, shuffle, verbs.length]);

    const start = startedAt === undefined ? undefined : new Date(startedAt).getTime();

    useEffect(() => {
      if (!showElapsed) return;
      const from = start ?? Date.now();
      const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - from) / 1000)));
      tick();
      const id = window.setInterval(tick, 1000);
      return () => window.clearInterval(id);
    }, [showElapsed, start]);

    const verb = verbs[index % Math.max(verbs.length, 1)] ?? "";
    const line = label ?? (verb ? `${verb}…` : null);
    const quiet = [showElapsed ? formatElapsed(elapsed) : null, detail].filter(
      (part) => part !== null && part !== undefined && part !== false,
    );

    return (
      <Row
        ref={ref}
        gap="8"
        vertical="center"
        role="status"
        className={classNames(styles.working, className)}
        {...flex}
      >
        {loader === undefined ? (
          <LogoSpinner size={LOADER_SIZE[size]} aria-hidden="true" role="presentation" />
        ) : (
          loader || null
        )}
        <Row gap="8" vertical="center" aria-hidden="true" minWidth={0}>
          <Text
            key={cycling ? index : undefined}
            variant={TEXT_VARIANT[size]}
            onBackground="neutral-medium"
            className={classNames(
              styles.verb,
              cycling && styles.verbEnter,
              shimmer && styles.shimmer,
            )}
          >
            {line}
          </Text>
          {quiet.length > 0 && (
            <Text variant={TEXT_VARIANT[size]} onBackground="neutral-weak" wrap="nowrap">
              {quiet.map((part, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: at most two fixed slots
                <Fragment key={i}>
                  {i > 0 && <span className={styles.separator}>·</span>}
                  <span>{part}</span>
                </Fragment>
              ))}
            </Text>
          )}
        </Row>
        <VisuallyHidden>{ariaLabel}</VisuallyHidden>
      </Row>
    );
  },
);

WorkingIndicator.displayName = "WorkingIndicator";

export { WorkingIndicator };
