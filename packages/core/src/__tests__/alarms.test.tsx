import { act, fireEvent, render, renderHook, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AlarmList } from "../components/AlarmList";
import { AlarmMark } from "../components/AlarmMark";
import { Annunciator } from "../components/Annunciator";
import {
  type Alarm,
  alarmState,
  alarmsReducer,
  countAlarms,
  sortAlarms,
  useAlarms,
} from "../hooks/useAlarms";
import { expectNoAxeViolations } from "../test/axe";

/**
 * Alarms after ISA-18.2: a point is new until acknowledged, standing while
 * present and seen, returned when it cleared unseen, normal when clear and
 * seen. Every state and priority reads without colour.
 */
const point = (over: Partial<Alarm> & Pick<Alarm, "id">): Alarm => ({
  label: over.id,
  priority: "medium",
  active: false,
  acknowledged: true,
  ...over,
});

const points: Alarm[] = [
  point({ id: "a", label: "Pump A trip", priority: "critical" }),
  point({ id: "b", label: "Level low", priority: "medium", active: true }),
  point({ id: "c", label: "Flow low", priority: "high" }),
  point({ id: "d", label: "Vacuum low", priority: "low", shelved: true, active: true }),
];

describe("alarm model", () => {
  it("names the five states", () => {
    expect(alarmState(point({ id: "x" }))).toBe("normal");
    expect(alarmState(point({ id: "x", active: true, acknowledged: false }))).toBe(
      "unacknowledged",
    );
    expect(alarmState(point({ id: "x", active: true }))).toBe("acknowledged");
    expect(alarmState(point({ id: "x", acknowledged: false }))).toBe("returned");
    expect(alarmState(point({ id: "x", shelved: true, active: true }))).toBe("shelved");
  });

  it("raises as new, clears to returned unseen and to normal once acknowledged", () => {
    let set = alarmsReducer(points, { type: "raise", id: "a", at: 1 });
    expect(alarmState(set[0])).toBe("unacknowledged");
    expect(set[0].since).toBe(1);
    set = alarmsReducer(set, { type: "clear", id: "a", at: 2 });
    expect(alarmState(set[0])).toBe("returned");
    set = alarmsReducer(set, { type: "acknowledge", ids: ["a"] });
    expect(alarmState(set[0])).toBe("normal");
  });

  it("re-raises a standing alarm as new", () => {
    const set = alarmsReducer(points, { type: "raise", id: "b" });
    expect(alarmState(set[1])).toBe("unacknowledged");
  });

  it("returns the same array when nothing changes", () => {
    expect(alarmsReducer(points, { type: "acknowledge", ids: ["a"] })).toBe(points);
    expect(alarmsReducer(points, { type: "clear", id: "a" })).toBe(points);
    expect(alarmsReducer(points, { type: "raise", id: "nope" })).toBe(points);
  });

  it("leaves shelved alarms out of acknowledge all and the counts", () => {
    const raised = alarmsReducer(alarmsReducer(points, { type: "raise", id: "a" }), {
      type: "shelve",
      id: "d",
      shelved: true,
    });
    expect(countAlarms(raised)).toEqual({
      active: 2,
      unacknowledged: 1,
      shelved: 1,
      byPriority: { critical: 1, high: 0, medium: 1, low: 0 },
    });
    const acked = alarmsReducer(raised, { type: "acknowledgeAll" });
    expect(countAlarms(acked).unacknowledged).toBe(0);
  });

  it("sorts new first, then by priority, then newest", () => {
    const set: Alarm[] = [
      point({ id: "old-high", priority: "high", active: true, since: 1 }),
      point({ id: "new-low", priority: "low", active: true, acknowledged: false, since: 2 }),
      point({ id: "new-crit", priority: "critical", active: true, acknowledged: false, since: 1 }),
      point({ id: "newer-high", priority: "high", active: true, since: 5 }),
    ];
    expect(sortAlarms(set).map((a) => a.id)).toEqual([
      "new-crit",
      "new-low",
      "newer-high",
      "old-high",
    ]);
  });

  it("useAlarms keeps the set and tells onAlarmsChange", () => {
    const onAlarmsChange = vi.fn();
    const { result } = renderHook(() => useAlarms({ defaultAlarms: points, onAlarmsChange }));
    act(() => result.current.raise("c", { detail: "62 kg/s" }));
    expect(result.current.counts.unacknowledged).toBe(1);
    expect(result.current.alarms[2].detail).toBe("62 kg/s");
    act(() => result.current.acknowledge("c"));
    expect(result.current.counts.unacknowledged).toBe(0);
    expect(onAlarmsChange).toHaveBeenCalledTimes(2);
  });
});

describe("AlarmMark", () => {
  it("is a named image with the priority's number", () => {
    render(<AlarmMark priority="high" />);
    const mark = screen.getByRole("img", { name: "High" });
    expect(mark.textContent).toBe("2");
  });

  it("is hidden when given an empty label", () => {
    const { container } = render(<AlarmMark priority="low" label="" />);
    expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("Annunciator", () => {
  const lit = alarmsReducer(points, { type: "raise", id: "a" });

  it("writes each tile's priority and state, and makes waiting tiles buttons", async () => {
    const onAcknowledge = vi.fn();
    const { container } = render(<Annunciator alarms={lit} onAcknowledge={onAcknowledge} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(4);
    expect(items[0].textContent).toContain("Critical · New");
    expect(items[1].textContent).toContain("Medium · Standing");
    expect(items[3].textContent).toContain("Shelved");
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(1);
    fireEvent.click(buttons[0]);
    expect(onAcknowledge).toHaveBeenCalledWith(["a"]);
    await expectNoAxeViolations(container);
  });

  it("has no buttons without onAcknowledge", () => {
    render(<Annunciator alarms={lit} />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });
});

describe("AlarmList", () => {
  it("lists what needs someone, in working order, with an acknowledge per waiting row", async () => {
    const set = alarmsReducer(
      alarmsReducer(points, { type: "raise", id: "c", at: "2026-11-08T14:18:00Z" }),
      { type: "raise", id: "a", at: "2026-11-08T14:14:00Z" },
    );
    const onAcknowledge = vi.fn();
    const { container } = render(
      <AlarmList alarms={set} onAcknowledge={onAcknowledge} timeZone="UTC" />,
    );
    const rows = within(container.querySelector("ul") as HTMLElement).getAllByRole("listitem");
    expect(rows.map((r) => r.querySelector("[class*='rowLabel']")?.textContent)).toEqual([
      "Pump A trip",
      "Flow low",
      "Level low",
    ]);
    expect(rows[0].textContent).toContain("14:14:00");
    expect(screen.getByText("3 active, 2 unacknowledged")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Acknowledge: Pump A trip" }));
    expect(onAcknowledge).toHaveBeenLastCalledWith(["a"]);
    fireEvent.click(screen.getByRole("button", { name: "Acknowledge all" }));
    expect(onAcknowledge).toHaveBeenLastCalledWith(["a", "c"]);
    await expectNoAxeViolations(container);
  });

  it("announces an alarm that comes in, critical ones as an alert", () => {
    const { rerender } = render(<AlarmList alarms={points} />);
    expect(screen.getByRole("status").textContent).toBe("");
    rerender(<AlarmList alarms={alarmsReducer(points, { type: "raise", id: "c" })} />);
    expect(screen.getByRole("status").textContent).toBe("High alarm: Flow low");
    rerender(
      <AlarmList
        alarms={alarmsReducer(alarmsReducer(points, { type: "raise", id: "c" }), {
          type: "raise",
          id: "a",
        })}
      />,
    );
    expect(screen.getByRole("alert").textContent).toBe("Critical alarm: Pump A trip");
  });

  it("says when there is nothing to show", () => {
    render(<AlarmList alarms={[point({ id: "x" })]} />);
    expect(screen.getByText("No alarms")).toBeTruthy();
  });
});
