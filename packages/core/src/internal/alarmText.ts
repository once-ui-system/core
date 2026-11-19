import type { Alarm, AlarmPriority, AlarmState } from "../hooks/useAlarms.js";

/** The words Annunciator and AlarmList write, overridable through their `labels`. */
export interface AlarmLabels {
  priority: Record<AlarmPriority, string>;
  state: Record<AlarmState, string>;
  acknowledge: string;
  acknowledgeAll: string;
  /** What a screen reader hears when an alarm comes in. */
  announce: (alarm: Alarm, priority: string) => string;
  /** AlarmList with nothing to show. */
  empty: string;
  /** AlarmList's header: `"3 active, 2 unacknowledged"`. */
  counts: (active: number, unacknowledged: number) => string;
}

export const defaultAlarmLabels: AlarmLabels = {
  priority: { critical: "Critical", high: "High", medium: "Medium", low: "Low" },
  state: {
    unacknowledged: "New",
    acknowledged: "Standing",
    returned: "Cleared, not acknowledged",
    normal: "Normal",
    shelved: "Shelved",
  },
  acknowledge: "Acknowledge",
  acknowledgeAll: "Acknowledge all",
  announce: (alarm, priority) => `${priority} alarm: ${alarm.label}`,
  empty: "No alarms",
  counts: (active, unacknowledged) =>
    `${active} active${unacknowledged ? `, ${unacknowledged} unacknowledged` : ""}`,
};

/** An alarm's time as a clock reading, the same on the server and in the browser when `timeZone` is given. */
export function alarmTime(
  since: Alarm["since"],
  locale = "en-US",
  timeZone?: string,
): string | undefined {
  if (since === undefined) return undefined;
  const date = since instanceof Date ? since : new Date(since);
  if (Number.isNaN(date.getTime())) return undefined;
  try {
    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone,
    }).format(date);
  } catch {
    return date.toISOString().slice(11, 19);
  }
}
