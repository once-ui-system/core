import { act, render, screen } from "@testing-library/react";
import type React from "react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { Switch } from "../components/Switch";
import { Tab, TabList, TabPanel, Tabs } from "../components/Tabs";
import { LayoutProvider } from "../contexts/LayoutProvider";
import type { ChangeDetails } from "../internal/changeDetails";
import { type AgentActResult, agentTools, createAgent } from "../modules/agent";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const Settings = ({
  onName,
  onSave,
}: {
  onName?: (value: string, details?: ChangeDetails) => void;
  onSave?: () => void;
}) => {
  const [visibility, setVisibility] = useState("private");
  return (
    <section>
      <h2>Project settings</h2>
      <Input id="name" label="Project name" defaultValue="Apollo" onValueChange={onName} />
      <Select
        id="visibility"
        label="Visibility"
        value={visibility}
        onValueChange={(next) => setVisibility(next as string)}
        options={[
          { value: "private", label: "Private" },
          { value: "internal", label: "Internal" },
          { value: "public", label: "Public" },
        ]}
      />
      <Switch label="Weekly digest" />
      <Tabs defaultValue="general">
        <TabList aria-label="Sections">
          <Tab value="general">General</Tab>
          <Tab value="billing">Billing</Tab>
        </TabList>
        <TabPanel value="general">General settings</TabPanel>
        <TabPanel value="billing">Billing settings</TabPanel>
      </Tabs>
      <Button onClick={onSave}>Save</Button>
    </section>
  );
};

const run = async (
  agent: ReturnType<typeof createAgent>,
  steps: Parameters<typeof agent.act>[0]["steps"],
) => {
  let result: AgentActResult | undefined;
  await act(async () => {
    result = await agent.act({ steps });
  });
  return result as AgentActResult;
};

describe("agent bridge", () => {
  it("lists every control with its name, state and actions, and the page's sections", () => {
    const agent = createAgent();
    render(<Settings />, { wrapper: wrap });
    const entries = agent.snapshot();
    const byLabel = (label: string) => entries.find((entry) => entry.label === label);

    expect(byLabel("Project name")).toMatchObject({
      component: "input",
      value: "Apollo",
      actions: ["setValue", "clear"],
    });
    expect(byLabel("Visibility")).toMatchObject({ component: "select", value: "private" });
    expect(byLabel("Weekly digest")).toMatchObject({ component: "switch", checked: false });
    expect(byLabel("Sections")).toMatchObject({ component: "tabs", value: "general" });
    expect(byLabel("Save")).toMatchObject({ component: "button", actions: ["press"] });
    expect(byLabel("Project settings")).toMatchObject({
      component: "section",
      index: 1,
      total: 1,
    });
    for (const entry of entries) expect(entry.label, `${entry.ref} has no name`).toBeTruthy();
  });

  it("changes every setting in one call, through the controls' own callbacks", async () => {
    const onName = vi.fn();
    const onSave = vi.fn();
    const agent = createAgent();
    render(<Settings onName={onName} onSave={onSave} />, { wrapper: wrap });

    const result = await run(agent, [
      { ref: "Project name", action: "setValue", args: ["Atlas"] },
      { ref: "visibility", action: "setValue", args: ["Internal"] },
      { ref: "Weekly digest", action: "setChecked", args: [true] },
      { ref: "Sections", action: "setValue", args: ["Billing"] },
      { ref: "Save", action: "press" },
    ]);

    expect(result.error?.message).toBeUndefined();
    expect(result.ok).toBe(true);
    expect(screen.getByLabelText<HTMLInputElement>("Project name").value).toBe("Atlas");
    expect(onName).toHaveBeenLastCalledWith("Atlas", expect.objectContaining({ source: "agent" }));
    expect(result.steps[1].changed.value).toEqual({ from: "private", to: "internal" });
    expect(screen.getByRole("switch", { name: "Weekly digest" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("tab", { name: "Billing" })).toHaveAttribute("aria-selected", "true");
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("reports a change the app canceled, and stops there", async () => {
    const agent = createAgent();
    render(
      <Settings
        onName={(_, details) => {
          if (details?.source === "agent") details.cancel();
        }}
      />,
      { wrapper: wrap },
    );
    const result = await run(agent, [
      { ref: "Project name", action: "setValue", args: ["Atlas"] },
      { ref: "Weekly digest", action: "setChecked", args: [true] },
    ]);
    expect(result.ok).toBe(false);
    expect(result.error).toMatchObject({ step: 0 });
    expect(result.error?.message).toMatch(/declined/);
    expect(screen.getByLabelText<HTMLInputElement>("Project name").value).toBe("Apollo");
    expect(screen.getByRole("switch", { name: "Weekly digest" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("asks allow before a step, and names what a control takes", async () => {
    const onSave = vi.fn();
    const agent = createAgent({ allow: ({ action }) => action !== "press" });
    render(<Settings onSave={onSave} />, { wrapper: wrap });

    const refused = await run(agent, [{ ref: "Save", action: "press" }]);
    expect(refused.error?.message).toMatch(/refused press/);
    expect(onSave).not.toHaveBeenCalled();

    const wrong = await run(agent, [{ ref: "Weekly digest", action: "setValue", args: ["x"] }]);
    expect(wrong.error?.message).toMatch(/takes no setValue now\. It takes: setChecked, toggle\./);

    const missing = await run(agent, [{ ref: "Region", action: "setValue", args: ["EU"] }]);
    expect(missing.error?.message).toMatch(/Nothing on the page is named "Region"/);
  });

  it("finds a list's choices with query", () => {
    const agent = createAgent();
    render(<Settings />, { wrapper: wrap });
    const found = agent.query({ within: "Visibility", text: "Public" });
    expect(found).toEqual([
      expect.objectContaining({ items: [{ value: "public", label: "Public" }], more: 0 }),
    ]);
    expect(agent.query({ within: "Region" })).toEqual({ error: expect.stringMatching(/Region/) });
    expect(agent.query({ text: "Billing" })).toEqual([
      expect.objectContaining({ component: "tabs", label: "Sections" }),
    ]);
  });

  it("describes its tools as JSON Schema", () => {
    expect(agentTools.map((tool) => tool.name)).toEqual(["snapshot", "act", "query"]);
    for (const tool of agentTools) expect(tool.inputSchema.type).toBe("object");
  });
});

describe("agent marks", () => {
  const Danger = ({ onDelete }: { onDelete?: () => void }) => (
    <section>
      <h2>Danger zone</h2>
      <Input id="token" label="API token" defaultValue="sk-live-123" data-agent-secret="" />
      <div data-agent-hidden="">
        <Switch label="Internal flag" />
      </div>
      <Button onClick={onDelete} data-agent-confirm="Deletes the project for everyone">
        Delete project
      </Button>
    </section>
  );

  it("leaves hidden controls out and redacts secret ones", () => {
    const agent = createAgent();
    render(<Danger />, { wrapper: wrap });
    const entries = agent.snapshot();
    expect(entries.find((e) => e.label === "Internal flag")).toBeUndefined();
    expect(entries.find((e) => e.label === "API token")).toMatchObject({
      value: "[redacted]",
      secret: true,
    });
    expect(JSON.stringify(entries)).not.toContain("sk-live-123");
  });

  it("writes a secret field without reading it back", async () => {
    const agent = createAgent();
    render(<Danger />, { wrapper: wrap });
    const result = await run(agent, [{ ref: "API token", action: "setValue", args: ["sk-new"] }]);
    expect(result.ok).toBe(true);
    expect(JSON.stringify(result)).not.toMatch(/sk-live-123|sk-new/);
    expect(screen.getByLabelText<HTMLInputElement>("API token").value).toBe("sk-new");
  });

  it("asks allow with the confirm text, and refuses without allow", async () => {
    const onDelete = vi.fn();
    const plain = createAgent();
    render(<Danger onDelete={onDelete} />, { wrapper: wrap });
    expect(plain.snapshot().find((e) => e.label === "Delete project")).toMatchObject({
      confirm: "Deletes the project for everyone",
    });

    const refused = await run(plain, [{ ref: "Delete project", action: "press" }]);
    expect(refused.error?.message).toMatch(/needs a person's yes/);
    expect(onDelete).not.toHaveBeenCalled();

    const allow = vi.fn(() => true);
    const asked = createAgent({ allow });
    const done = await run(asked, [{ ref: "Delete project", action: "press" }]);
    expect(done.ok).toBe(true);
    expect(allow).toHaveBeenCalledWith(
      expect.objectContaining({ action: "press", confirm: "Deletes the project for everyone" }),
    );
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
