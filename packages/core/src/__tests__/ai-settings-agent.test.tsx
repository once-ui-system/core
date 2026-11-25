// The example as an app imports it: from the built package, beside the
// bridge from the same build, so both read one registry.
import { LayoutProvider, ThemeProvider, ToastProvider } from "@once-ui-system/core";
import { type AgentEntry, createAgent } from "@once-ui-system/core/agent";
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SettingsExample } from "../../ai/examples/settings";

/**
 * The settings bundle's promise: an agent can change every setting the gold
 * example shows, by name, through the controls' own paths. A control that
 * loses its name, or one the bridge cannot drive, fails here before an agent
 * that built a page from the bundle finds out.
 */
const page = () =>
  render(
    <ThemeProvider>
      <LayoutProvider>
        <ToastProvider>
          <SettingsExample />
        </ToastProvider>
      </LayoutProvider>
    </ThemeProvider>,
  );

const run = async (
  agent: ReturnType<typeof createAgent>,
  steps: Parameters<typeof agent.act>[0]["steps"],
) => {
  let result: Awaited<ReturnType<typeof agent.act>> | undefined;
  await act(async () => {
    result = await agent.act({ steps });
  });
  return result as NonNullable<typeof result>;
};

/** One step that changes `entry` to something it does not hold now. */
function changeOf(entry: AgentEntry, choices: { value: string }[]) {
  if (entry.actions.includes("setChecked")) {
    return { ref: entry.ref, action: "setChecked", args: [!entry.checked] };
  }
  if (choices.length) {
    const other = choices.find((choice) => choice.value !== entry.value);
    return { ref: entry.ref, action: "setValue", args: [other?.value] };
  }
  if (entry.component === "slider") {
    return { ref: entry.ref, action: "setValue", args: [Number(entry.value) + 1] };
  }
  if (entry.actions.includes("setValue")) {
    const now = String(entry.value ?? "");
    return {
      ref: entry.ref,
      action: "setValue",
      args: [/^\d+$/.test(now) ? String(Number(now) + 1) : `${now}x`],
    };
  }
  return null;
}

describe("settings bundle: an agent can change every setting", () => {
  it("names every control, and one act call per section changes each value", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    const agent = createAgent();
    page();

    const sections = agent.snapshot().find((entry) => entry.label === "Settings sections");
    expect(sections).toMatchObject({ component: "tabs" });
    const tabs = (
      agent.query({ within: "Settings sections" }) as { items: { label: string }[] }[]
    )[0].items;
    expect(tabs.map((tab) => tab.label)).toEqual(["Profile", "Notifications", "Workspace"]);

    let changed = 0;
    for (const tab of tabs) {
      expect(
        (await run(agent, [{ ref: "Settings sections", action: "setValue", args: [tab.label] }]))
          .ok,
      ).toBe(true);
      const entries = agent.snapshot();
      for (const entry of entries)
        expect(entry.label, `${entry.component} ${entry.ref} has no name`).toBeTruthy();

      const steps = entries
        .filter((entry) => entry.component !== "tabs" && entry.component !== "theme")
        .map((entry) => {
          const list = agent.query({ within: entry.ref });
          return changeOf(entry, Array.isArray(list) ? list[0].items : []);
        })
        .filter((step) => step !== null)
        // A switch can close the settings it opens (the digest hour), so values go first.
        .sort((a, b) => Number(a.action === "setChecked") - Number(b.action === "setChecked"));
      if (!steps.length) continue;

      const result = await run(agent, steps);
      expect(result.error?.message).toBeUndefined();
      for (const step of result.steps) {
        expect(Object.keys(step.changed), `${step.label} did not change`).not.toHaveLength(0);
      }
      changed += steps.length;
    }
    // Display name, email, timezone; send at, product updates, weekly digest.
    expect(changed).toBe(6);
  });

  it("asks a person before the danger zone's delete", async () => {
    const agent = createAgent();
    page();
    await run(agent, [{ ref: "Settings sections", action: "setValue", args: ["Workspace"] }]);
    expect(agent.snapshot().find((entry) => entry.label === "Delete workspace")).toMatchObject({
      confirm: "Deletes the workspace and all its data",
    });
    const result = await run(agent, [{ ref: "Delete workspace", action: "press" }]);
    expect(result.error?.message).toMatch(/needs a person's yes/);
    expect(screen.getByText("Delete workspace")).toBeTruthy();
  });
});
