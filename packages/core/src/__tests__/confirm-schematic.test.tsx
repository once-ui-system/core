import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConfirmButton } from "../components/ConfirmButton";
import { Schematic, type SchematicLink, type SchematicNode } from "../components/Schematic";
import { expectNoAxeViolations } from "../test/axe";

describe("ConfirmButton", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("arms on the first press and acts on a second one", () => {
    const onConfirm = vi.fn();
    render(<ConfirmButton label="Trip" onConfirm={onConfirm} />);
    fireEvent.click(screen.getByRole("button", { name: "Trip" }));
    expect(onConfirm).not.toHaveBeenCalled();
    const armed = screen.getByRole("button", { name: "Press again to confirm" });
    expect(screen.getByRole("status").textContent).toBe(
      "Press again to confirm, or Escape to cancel.",
    );
    act(() => vi.advanceTimersByTime(500));
    fireEvent.click(armed);
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Trip" })).toBeTruthy();
  });

  it("ignores a double click's second press", () => {
    const onConfirm = vi.fn();
    render(<ConfirmButton label="Trip" onConfirm={onConfirm} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    fireEvent.click(button);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("disarms on Escape, on blur and when the time runs out", () => {
    const onArmedChange = vi.fn();
    render(<ConfirmButton label="Trip" onConfirm={() => {}} onArmedChange={onArmedChange} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    fireEvent.keyDown(button, { key: "Escape" });
    expect(onArmedChange.mock.calls.map((c) => c[0])).toEqual([true, false]);
    fireEvent.click(button);
    fireEvent.blur(button);
    expect(onArmedChange).toHaveBeenLastCalledWith(false);
    fireEvent.click(button);
    act(() => vi.advanceTimersByTime(4000));
    expect(onArmedChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole("button", { name: "Trip" })).toBeTruthy();
  });

  it("acts only when held to the end in hold mode", () => {
    const onConfirm = vi.fn();
    render(<ConfirmButton mode="hold" label="Silence" holdDuration={1000} onConfirm={onConfirm} />);
    const button = screen.getByRole("button");
    fireEvent.pointerDown(button, { button: 0 });
    act(() => vi.advanceTimersByTime(600));
    fireEvent.pointerUp(button);
    act(() => vi.advanceTimersByTime(1000));
    expect(onConfirm).not.toHaveBeenCalled();
    fireEvent.keyDown(button, { key: " " });
    expect(screen.getByRole("button", { name: "Keep holding…" })).toBeTruthy();
    act(() => vi.advanceTimersByTime(1000));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});

const nodes: SchematicNode[] = [
  { id: "core", kind: "vessel", x: 80, y: 120, label: "Reactor", value: "312 °C", state: "alarm" },
  { id: "pump", kind: "pump", x: 260, y: 120, label: "Pump B", running: false },
  { id: "valve", kind: "valve", x: 400, y: 120, label: "Steam valve", open: false },
];
const links: SchematicLink[] = [
  { from: "core", to: "pump", flow: 1, label: "Hot leg" },
  { from: "pump", to: "valve", flow: -0.5 },
  {
    from: "valve",
    to: "core",
    via: [
      [400, 20],
      [80, 20],
    ],
  },
];

describe("Schematic", () => {
  it("names each part with its reading and state, and says the flows", async () => {
    const { container } = render(<Schematic nodes={nodes} links={links} aria-label="Loop" />);
    expect(screen.getByRole("group", { name: "Loop" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Reactor, 312 °C, Alarm" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Pump B, Stopped" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Steam valve, Closed" })).toBeTruthy();
    const flows = screen.getAllByRole("listitem").map((li) => li.textContent);
    expect(flows).toEqual([
      "Hot leg: Reactor to Pump B",
      "Steam valve to Pump B",
      "Steam valve to Reactor, no flow",
    ]);
    // A flowing line draws its moving dashes and an arrow; a still one neither.
    expect(container.querySelectorAll("[data-flowing]")).toHaveLength(2);
    await expectNoAxeViolations(container);
  });

  it("makes parts buttons with onNodeSelect", async () => {
    const onNodeSelect = vi.fn();
    const { container } = render(
      <Schematic nodes={nodes} aria-label="Loop" selected="pump" onNodeSelect={onNodeSelect} />,
    );
    const pump = screen.getByRole("button", { name: "Pump B, Stopped" });
    expect(pump.getAttribute("aria-pressed")).toBe("true");
    fireEvent.keyDown(screen.getByRole("button", { name: /Reactor/ }), { key: "Enter" });
    expect(onNodeSelect).toHaveBeenCalledWith("core");
    fireEvent.click(pump);
    expect(onNodeSelect).toHaveBeenLastCalledWith("pump");
    await expectNoAxeViolations(container);
  });
});
