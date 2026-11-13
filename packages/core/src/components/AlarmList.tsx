"use client";

import classNames from "clsx";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  type Alarm,
  alarmState,
  countAlarms,
  needsAcknowledge,
  sortAlarms,
} from "../hooks/useAlarms.js";
import { alarmTime, defaultAlarmLabels } from "../internal/alarmText.js";
import { mergeLabels } from "../internal/labels.js";
import styles from "./Alarm.module.scss";
import { AlarmMark } from "./AlarmMark.js";
import type { AnnunciatorLabels } from "./Annunciator.js";
import { Button } from "./Button.js";

interface AlarmListProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "title"> {
  alarms: readonly Alarm[];
  /** Called with the ids an operator acknowledges: one row's, or every waiting one's. */
  onAcknowledge?: (ids: string[]) => void;
  /** Rows that are clear and seen stay out of the list unless this is set. */
  showNormal?: boolean;
  /** Shelved alarms stay out of the list unless this is set. */
  showShelved?: boolean;
  /** The header over the rows: a title, or `false` for none. Defaults to the counts and Acknowledge all. */
  header?: React.ReactNode | false;
  /**
   * Announce each alarm that comes in to screen readers, politely, critical
   * ones assertively. Defaults to `true`.
   */
  announce?: boolean;
  /** The locale times are written in. Defaults to `"en-US"`, 24-hour. */
  locale?: string;
  /** The time zone times are written in; give it to render the same on the server and in the browser. */
  timeZone?: string;
  labels?: AnnunciatorLabels;
  ref?: React.Ref<HTMLDivElement>;
}

/**
 * The alarms an operator works through, in the order to work them: new first,
 * then standing, then cleared unseen; within each the most urgent, then the
 * newest. Every row says its priority as a numbered shape and in words, its
 * state in words, and when it came in. A waiting row has an Acknowledge
 * button; the header acknowledges them all.
 *
 * Alarms that come in are announced to screen readers. Pair it with
 * `Annunciator` for the panel view of the same `useAlarms` set.
 */
const AlarmList = ({
  alarms = [],
  onAcknowledge,
  showNormal = false,
  showShelved = false,
  header,
  announce = true,
  locale,
  timeZone,
  labels: labelsProp,
  className,
  ref,
  ...rest
}: AlarmListProps) => {
  const labels = useMemo(() => mergeLabels(defaultAlarmLabels, labelsProp), [labelsProp]);
  const rows = useMemo(
    () =>
      sortAlarms(alarms).filter((a) => {
        const state = alarmState(a);
        if (state === "normal") return showNormal;
        if (state === "shelved") return showShelved;
        return true;
      }),
    [alarms, showNormal, showShelved],
  );
  const counts = useMemo(() => countAlarms(alarms), [alarms]);
  const waiting = alarms.filter(needsAcknowledge).map((a) => a.id);

  // Announce what came in since the last render: alarms that turned new.
  const seen = useRef<Set<string> | null>(null);
  const [message, setMessage] = useState<{ text: string; urgent: boolean }>({
    text: "",
    urgent: false,
  });
  useEffect(() => {
    const fresh = alarms.filter((a) => alarmState(a) === "unacknowledged");
    const before = seen.current;
    seen.current = new Set(fresh.map((a) => a.id));
    // The first render is the state the page opened in, not news.
    if (!before || !announce) return;
    const incoming = sortAlarms(fresh.filter((a) => !before.has(a.id)));
    if (incoming.length === 0) return;
    setMessage({
      text: incoming.map((a) => labels.announce(a, labels.priority[a.priority])).join(". "),
      urgent: incoming.some((a) => a.priority === "critical"),
    });
  }, [alarms, announce, labels]);

  return (
    <div ref={ref} className={classNames(styles.list, className)} {...rest}>
      {header !== false && (
        <div className={styles.listHeader}>
          {header ?? (
            <span className={styles.listCounts}>
              {labels.counts(counts.active, counts.unacknowledged)}
            </span>
          )}
          {onAcknowledge && waiting.length > 0 && (
            <Button
              size="s"
              variant="secondary"
              weight="default"
              label={labels.acknowledgeAll}
              onClick={() => onAcknowledge(waiting)}
            />
          )}
        </div>
      )}
      {rows.length === 0 ? (
        <p className={styles.listEmpty}>{labels.empty}</p>
      ) : (
        <ul className={styles.rows}>
          {rows.map((alarm) => {
            const state = alarmState(alarm);
            const time = alarmTime(alarm.since, locale, timeZone);
            return (
              <li
                key={alarm.id}
                className={styles.row}
                data-state={state}
                data-priority={alarm.priority}
              >
                <AlarmMark priority={alarm.priority} label="" />
                <span className={styles.rowText}>
                  <span className={styles.rowLabel}>
                    {alarm.tag && <span className={styles.rowTag}>{alarm.tag}</span>}
                    {alarm.label}
                  </span>
                  <span className={styles.rowMeta}>
                    <span className={styles.rowState}>
                      {labels.priority[alarm.priority]} · {labels.state[state]}
                    </span>
                    {time && (
                      <time
                        className={styles.rowTime}
                        dateTime={new Date(alarm.since as string).toISOString()}
                      >
                        {time}
                      </time>
                    )}
                    {alarm.detail && <span>{alarm.detail}</span>}
                  </span>
                </span>
                {onAcknowledge && needsAcknowledge(alarm) ? (
                  <span className={styles.rowAction}>
                    <Button
                      size="s"
                      variant="secondary"
                      weight="default"
                      label={labels.acknowledge}
                      aria-label={`${labels.acknowledge}: ${alarm.label}`}
                      onClick={() => onAcknowledge([alarm.id])}
                    />
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
      {announce && (
        <>
          <div className={styles.live} aria-live="polite" role="status">
            {message.urgent ? "" : message.text}
          </div>
          <div className={styles.live} aria-live="assertive" role="alert">
            {message.urgent ? message.text : ""}
          </div>
        </>
      )}
    </div>
  );
};

AlarmList.displayName = "AlarmList";

export type { AlarmListProps };
export { AlarmList };
