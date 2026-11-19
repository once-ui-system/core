"use client";

import classNames from "clsx";
import type React from "react";
import { useMemo } from "react";
import { type Alarm, alarmState, needsAcknowledge } from "../hooks/useAlarms.js";
import { type AlarmLabels, defaultAlarmLabels } from "../internal/alarmText.js";
import { mergeLabels } from "../internal/labels.js";
import styles from "./Alarm.module.scss";
import { AlarmMark } from "./AlarmMark.js";

type AnnunciatorLabels = Partial<Omit<AlarmLabels, "priority" | "state">> & {
  priority?: Partial<AlarmLabels["priority"]>;
  state?: Partial<AlarmLabels["state"]>;
};

interface AnnunciatorProps extends Omit<React.HTMLAttributes<HTMLUListElement>, "children"> {
  /** Every alarm point the panel watches, normal ones included, in panel order. */
  alarms: readonly Alarm[];
  /**
   * Called with a tile's id when an operator presses a tile that waits for
   * them (new, or cleared unseen). Without it the tiles only show.
   */
  onAcknowledge?: (ids: string[]) => void;
  /**
   * At most this many tiles per row; fewer where a tile would be narrower
   * than 140px (a phone). Left out, as many 160px tiles as fit.
   */
  columns?: number;
  /**
   * New alarms flash, as on a lightbox panel, at under one flash a second.
   * With reduced motion asked for they hold a heavy double outline instead.
   * `false` never flashes.
   */
  flash?: boolean;
  /** The words the panel writes, for another language. */
  labels?: AnnunciatorLabels;
  ref?: React.Ref<HTMLUListElement>;
}

/**
 * A lightbox annunciator: one tile per alarm point, lit by its state. A tile
 * reads without colour: the priority is a numbered shape, the state is
 * written on it ("New", "Standing", "Cleared, not acknowledged"), a new alarm
 * flashes, a cleared unseen one has a dashed edge, and a shelved one is
 * hatched. Press a waiting tile to acknowledge it.
 *
 * Keep the points in a fixed order, as a panel does: an operator learns where
 * a tile is. Feed it from `useAlarms`; `AlarmList` is the same alarms sorted
 * for working through.
 */
const Annunciator = ({
  alarms = [],
  onAcknowledge,
  columns,
  flash = true,
  labels: labelsProp,
  className,
  style,
  ref,
  ...rest
}: AnnunciatorProps) => {
  const labels = useMemo(() => mergeLabels(defaultAlarmLabels, labelsProp), [labelsProp]);
  return (
    <ul
      ref={ref}
      className={classNames(styles.annunciator, className)}
      style={
        {
          ...(columns
            ? {
                "--annunciator-columns": `repeat(auto-fill, minmax(max(var(--annunciator-min, 140px), calc((100% - ${columns - 1} * var(--annunciator-gap)) / ${columns})), 1fr))`,
              }
            : {}),
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    >
      {alarms.map((alarm) => {
        const state = alarmState(alarm);
        const waiting = needsAcknowledge(alarm) && !!onAcknowledge;
        const body = (
          <>
            <span className={styles.tileHead}>
              <AlarmMark priority={alarm.priority} label="" />
              {alarm.tag && <span className={styles.tileTag}>{alarm.tag}</span>}
            </span>
            <span className={styles.tileLabel}>{alarm.label}</span>
            <span className={styles.tileState}>
              {labels.priority[alarm.priority]} · {labels.state[state]}
            </span>
          </>
        );
        const tile = {
          className: classNames(styles.tile, flash && styles.flash),
          "data-state": state,
          "data-priority": alarm.priority,
        };
        return (
          <li key={alarm.id} className={styles.tileItem}>
            {waiting ? (
              <button type="button" {...tile} onClick={() => onAcknowledge?.([alarm.id])}>
                {body}
                <span className={styles.live}>{labels.acknowledge}</span>
              </button>
            ) : (
              <div {...tile}>{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

Annunciator.displayName = "Annunciator";

export type { AnnunciatorLabels, AnnunciatorProps };
export { Annunciator };
