import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "../components/Checkbox";
import { Input } from "../components/Input";
import { SegmentedControl } from "../components/SegmentedControl";
import { Switch } from "../components/Switch";
import { Tab, TabList, TabPanel, Tabs } from "../components/Tabs";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { type ChangeDetails, withChangeSource } from "../utils";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/**
 * Every `onXChange` passes `ChangeDetails` beside the value, so an app can
 * tell an agent's edit from a person's (`source`) and refuse one
 * (`cancel()`). The agent bridge builds on this.
 */
describe("change details", () => {
  it("reports a click as pointer and Space as keyboard", async () => {
    const user = userEvent.setup();
    const sources: string[] = [];
    render(
      <Switch
        label="Wi-Fi"
        onCheckedChange={(_, details) => sources.push(details?.source ?? "none")}
      />,
      { wrapper: wrap },
    );
    const control = screen.getByRole("switch", { name: "Wi-Fi" });
    await user.click(control);
    control.focus();
    await user.keyboard(" ");
    expect(sources).toEqual(["pointer", "keyboard"]);
  });

  it("keeps an uncontrolled switch as it was when the change is canceled", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn((_: boolean, details?: ChangeDetails) => details?.cancel());
    render(<Switch label="Wi-Fi" onCheckedChange={onCheckedChange} />, { wrapper: wrap });
    const control = screen.getByRole("switch", { name: "Wi-Fi" });
    await user.click(control);
    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.objectContaining({ canceled: true }));
    expect(control).toHaveAttribute("aria-checked", "false");
  });

  it("reports a change inside withChangeSource as the agent's", () => {
    const sources: string[] = [];
    render(
      <Checkbox
        label="Weekly digest"
        onCheckedChange={(_, details) => sources.push(details?.source ?? "none")}
      />,
      { wrapper: wrap },
    );
    const box = screen.getByRole("checkbox", { name: "Weekly digest" });
    act(() => withChangeSource("agent", () => box.click()));
    expect(sources).toEqual(["agent"]);
  });

  it("puts back an uncontrolled field's text when a change is canceled", async () => {
    const user = userEvent.setup();
    render(
      <Input
        id="project-name"
        label="Project name"
        defaultValue="Apollo"
        onValueChange={(next, details) => {
          if (details?.source === "agent" || next.includes("!")) details?.cancel();
        }}
      />,
      { wrapper: wrap },
    );
    const field = screen.getByLabelText<HTMLInputElement>("Project name");
    await user.type(field, "s");
    expect(field.value).toBe("Apollos");
    await user.type(field, "!");
    expect(field.value).toBe("Apollos");
    act(() =>
      withChangeSource("agent", () => fireEvent.change(field, { target: { value: "Atlas" } })),
    );
    expect(field.value).toBe("Apollos");
  });

  it("refuses a tab change in uncontrolled Tabs", async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="one" onValueChange={(_, details) => details?.cancel()}>
        <TabList aria-label="Sections">
          <Tab value="one">One</Tab>
          <Tab value="two">Two</Tab>
        </TabList>
        <TabPanel value="one">First</TabPanel>
        <TabPanel value="two">Second</TabPanel>
      </Tabs>,
      { wrapper: wrap },
    );
    await user.click(screen.getByRole("tab", { name: "Two" }));
    expect(screen.getByRole("tab", { name: "One" })).toHaveAttribute("aria-selected", "true");
  });

  it("passes details to SegmentedControl after its event", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <SegmentedControl
        aria-label="View"
        buttons={[
          { value: "list", label: "List" },
          { value: "grid", label: "Grid" },
        ]}
        onValueChange={onValueChange}
      />,
      { wrapper: wrap },
    );
    await user.click(screen.getByRole("tab", { name: "Grid" }));
    const [value, event, details] = onValueChange.mock.calls[0];
    expect(value).toBe("grid");
    expect(event).toBeDefined();
    expect(details.source).toBe("pointer");
  });
});
