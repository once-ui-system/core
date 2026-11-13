"use client";

import { useCallback, useMemo } from "react";
import { useControllableState } from "../internal/useControllableState.js";

/**
 * How urgent an alarm is. Each priority has its own shape and number as well
 * as its colour (critical an octagon with 1, high a triangle with 2, medium a
 * diamond with 3, low a circle with 4), so it reads in greyscale and to a
 * reader who cannot tell red from orange.
 */
export type AlarmPriority = "critical" | "high" | "medium" | "low";

/** The priorities from most to least urgent. */
export const ALARM_PRIORITIES: readonly AlarmPriority[] = ["critical", "high", "medium", "low"];

/**
 * One alarm point: a condition the plant watches, whether it is present, and
 * whether an operator has seen it. An annunciator keeps every point, normal
 * ones included; a list shows the ones that need someone.
 */
export interface Alarm {
  id: string;
  /** What is wrong, in a few words: `"Coolant pump B trip"`. */
  label: string;
  priority: AlarmPriority;
  /** The condition is present now. */
  active: boolean;
  /** An operator has acknowledged the alarm since it last came in or cleared. */
  acknowledged: boolean;
  /** A short tag for the point, shown on its tile: `"RCP-B"`. */
  tag?: string;
  /** When it last came in or cleared. */
  since?: Date | string | number;
  /** One more line: the reading, the limit, what to do. */
  detail?: string;
  /** Set aside by an operator (a known fault, maintenance): kept out of counts and announcements. */
  shelved?: boolean;
}

/**
 * Where an alarm stands, after ISA-18.2's states:
 *
 * - `unacknowledged`: the condition is present and nobody has seen it. It flashes.
 * - `acknowledged`: present, and seen.
 * - `returned`: cleared on its own before anyone saw it; acknowledge it to put it away.
 * - `normal`: clear and seen.
 * - `shelved`: set aside by an operator.
 */
export type AlarmState = "unacknowledged" | "acknowledged" | "returned" | "normal" | "shelved";

export function alarmState(alarm: Alarm): AlarmState {
  if (alarm.shelved) return "shelved";
  if (alarm.active) return alarm.acknowledged ? "acknowledged" : "unacknowledged";
  return alarm.acknowledged ? "normal" : "returned";
}

/** An alarm still waits for an operator: unacknowledged, or cleared without being seen. */
export function needsAcknowledge(alarm: Alarm): boolean {
  const state = alarmState(alarm);
  return state === "unacknowledged" || state === "returned";
}

const stateRank: Record<AlarmState, number> = {
  unacknowledged: 0,
  acknowledged: 1,
  returned: 2,
  normal: 3,
  shelved: 4,
};

const time = (v: Alarm["since"]) =>
  v === undefined ? 0 : v instanceof Date ? v.getTime() : new Date(v).getTime() || 0;

/**
 * Alarms in the order an operator works them: unacknowledged first, then
 * standing, then cleared; within each, the most urgent, then the newest.
 */
export function sortAlarms(alarms: readonly Alarm[]): Alarm[] {
  return [...alarms].sort(
    (a, b) =>
      stateRank[alarmState(a)] - stateRank[alarmState(b)] ||
      ALARM_PRIORITIES.indexOf(a.priority) - ALARM_PRIORITIES.indexOf(b.priority) ||
      time(b.since) - time(a.since),
  );
}

/** How many alarms stand at each priority, and how many wait for an operator. Shelved ones are left out. */
export interface AlarmCounts {
  /** Present now (acknowledged or not). */
  active: number;
  /** Waiting for an acknowledge: unacknowledged or returned. */
  unacknowledged: number;
  shelved: number;
  /** Present now, by priority. */
  byPriority: Record<AlarmPriority, number>;
}

export function countAlarms(alarms: readonly Alarm[]): AlarmCounts {
  const counts: AlarmCounts = {
    active: 0,
    unacknowledged: 0,
    shelved: 0,
    byPriority: { critical: 0, high: 0, medium: 0, low: 0 },
  };
  for (const alarm of alarms) {
    if (alarm.shelved) {
      counts.shelved++;
      continue;
    }
    if (alarm.active) {
      counts.active++;
      counts.byPriority[alarm.priority]++;
    }
    if (needsAcknowledge(alarm)) counts.unacknowledged++;
  }
  return counts;
}

/** A change to a set of alarms. */
export type AlarmAction =
  /** The condition came in: the alarm is active and unacknowledged, even if it was seen before. */
  | { type: "raise"; id: string; at?: Alarm["since"]; detail?: string }
  /** The condition cleared. Seen before, it is normal; unseen, it is returned until acknowledged. */
  | { type: "clear"; id: string; at?: Alarm["since"] }
  | { type: "acknowledge"; ids: readonly string[] }
  | { type: "acknowledgeAll" }
  | { type: "shelve"; id: string; shelved: boolean };

/**
 * The alarm rules as a pure function, for a reducer, a server or a test:
 * `alarmsReducer(alarms, { type: "acknowledge", ids: ["rcp-b"] })`. An
 * action on an id the set does not hold changes nothing.
 */
export function alarmsReducer(alarms: readonly Alarm[], action: AlarmAction): Alarm[] {
  const update = (match: (a: Alarm) => boolean, change: (a: Alarm) => Alarm) => {
    let changed = false;
    const next = alarms.map((a) => {
      if (!match(a)) return a;
      const b = change(a);
      if (
        b.active !== a.active ||
        b.acknowledged !== a.acknowledged ||
        b.shelved !== a.shelved ||
        b.since !== a.since ||
        b.detail !== a.detail
      ) {
        changed = true;
      }
      return b;
    });
    return changed ? next : (alarms as Alarm[]);
  };
  switch (action.type) {
    case "raise":
      return update(
        (a) => a.id === action.id,
        (a) =>
          a.active && !a.acknowledged && action.detail === undefined
            ? a
            : {
                ...a,
                active: true,
                acknowledged: false,
                since: action.at ?? (a.active ? a.since : new Date()),
                detail: action.detail ?? a.detail,
              },
      );
    case "clear":
      return update(
        (a) => a.id === action.id && a.active,
        (a) => ({ ...a, active: false, since: action.at ?? new Date() }),
      );
    case "acknowledge":
      return update(
        (a) => action.ids.includes(a.id) && !a.shelved,
        (a) => ({ ...a, acknowledged: true }),
      );
    case "acknowledgeAll":
      return update(
        (a) => !a.shelved,
        (a) => ({ ...a, acknowledged: true }),
      );
    case "shelve":
      return update(
        (a) => a.id === action.id,
        (a) => ({ ...a, shelved: action.shelved }),
      );
  }
}

export interface UseAlarmsOptions {
  /** The alarms, controlled. Leave it out to let the hook keep them. */
  alarms?: readonly Alarm[];
  /** The alarms to start from, uncontrolled. */
  defaultAlarms?: readonly Alarm[];
  /** Hears every change the hook makes, with the whole new set. */
  onAlarmsChange?: (alarms: Alarm[]) => void;
}

/**
 * A set of alarms and the actions an operator and the plant take on them.
 * Feed `raise` and `clear` from your telemetry; hand `alarms` and
 * `acknowledge` to `<Annunciator>` and `<AlarmList>`.
 *
 * ```tsx
 * const plant = useAlarms({ defaultAlarms: points });
 * <AlarmList alarms={plant.alarms} onAcknowledge={plant.acknowledge} />
 * ```
 */
export function useAlarms({ alarms, defaultAlarms = [], onAlarmsChange }: UseAlarmsOptions = {}) {
  const [current, setAlarms] = useControllableState<readonly Alarm[]>({
    value: alarms,
    defaultValue: defaultAlarms,
    onChange: onAlarmsChange as ((next: readonly Alarm[]) => void) | undefined,
  });
  const dispatch = useCallback(
    (action: AlarmAction) => setAlarms((prev) => alarmsReducer(prev, action)),
    [setAlarms],
  );
  const raise = useCallback(
    (id: string, options: { at?: Alarm["since"]; detail?: string } = {}) =>
      dispatch({ type: "raise", id, ...options }),
    [dispatch],
  );
  const clear = useCallback(
    (id: string, at?: Alarm["since"]) => dispatch({ type: "clear", id, at }),
    [dispatch],
  );
  const acknowledge = useCallback(
    (ids: string | readonly string[]) =>
      dispatch({ type: "acknowledge", ids: typeof ids === "string" ? [ids] : ids }),
    [dispatch],
  );
  const acknowledgeAll = useCallback(() => dispatch({ type: "acknowledgeAll" }), [dispatch]);
  const shelve = useCallback(
    (id: string, shelved = true) => dispatch({ type: "shelve", id, shelved }),
    [dispatch],
  );
  const counts = useMemo(() => countAlarms(current), [current]);
  return {
    alarms: current as Alarm[],
    counts,
    dispatch,
    raise,
    clear,
    acknowledge,
    acknowledgeAll,
    shelve,
  };
}
