// @vitest-environment node
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const SERVER = path.join(__dirname, "..", "..", "scripts", "mcp.cjs");
const { handle } = require(SERVER);

type Response = {
  id: number | null;
  result?: { content?: { text: string }[]; isError?: boolean; [key: string]: unknown };
  error?: { code: number; message: string };
};

let next = 1;
const call = (name: string, args: Record<string, unknown> = {}) => {
  const response: Response = handle({
    jsonrpc: "2.0",
    id: next++,
    method: "tools/call",
    params: { name, arguments: args },
  });
  return {
    text: response.result?.content?.[0]?.text ?? "",
    isError: response.result?.isError ?? false,
  };
};

describe("once-ui-mcp", () => {
  it("speaks MCP over stdio: initialize, tools/list, then a call", async () => {
    const child = spawn(process.execPath, [SERVER], { stdio: ["pipe", "pipe", "inherit"] });
    const lines: Response[] = [];
    let buffer = "";
    const done = new Promise<void>((resolve) => {
      child.stdout.on("data", (chunk: Buffer) => {
        buffer += chunk.toString("utf8");
        let newline = buffer.indexOf("\n");
        while (newline !== -1) {
          lines.push(JSON.parse(buffer.slice(0, newline)));
          buffer = buffer.slice(newline + 1);
          newline = buffer.indexOf("\n");
        }
        if (lines.length === 3) resolve();
      });
    });
    const send = (message: unknown) => child.stdin.write(`${JSON.stringify(message)}\n`);
    send({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-06-18",
        capabilities: {},
        clientInfo: { name: "test", version: "0" },
      },
    });
    send({ jsonrpc: "2.0", method: "notifications/initialized" });
    send({ jsonrpc: "2.0", id: 2, method: "tools/list" });
    send({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: { name: "get_component", arguments: { name: "Button" } },
    });
    await done;
    child.kill();

    // The notification gets no response, so ids 1, 2, 3 in order.
    expect(lines.map((l) => l.id)).toEqual([1, 2, 3]);
    expect(lines[0].result).toMatchObject({
      protocolVersion: "2025-06-18",
      capabilities: { tools: {} },
      serverInfo: { name: "once-ui" },
    });
    const tools = ((lines[1].result?.tools ?? []) as { name: string }[]).map((t) => t.name);
    expect(tools).toEqual([
      "search_components",
      "get_component",
      "get_type",
      "get_task",
      "get_rules",
      "validate_code",
    ]);
    expect(lines[2].result?.content?.[0].text).toContain(
      'import { Button } from "@once-ui-system/core";',
    );
  });

  it("answers an unknown protocol version with its own, and an unknown method with an error", () => {
    expect(
      handle({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: { protocolVersion: "1999-01-01" },
      }),
    ).toMatchObject({ result: { protocolVersion: "2025-06-18" } });
    expect(handle({ jsonrpc: "2.0", id: 2, method: "resources/list" })).toMatchObject({
      error: { code: -32601 },
    });
    expect(handle({ jsonrpc: "2.0", method: "notifications/cancelled" })).toBeNull();
  });

  it("finds components by purpose, with the entry point to import from", () => {
    const { text } = call("search_components", { query: "line chart" });
    expect(text.split("\n")[0]).toMatch(/^LineChart \(@once-ui-system\/core\/data\)/);
  });

  it("describes a component: import, props, inherited groups, gotchas", () => {
    const { text } = call("get_component", { name: "dialog" });
    expect(text).toContain("# Dialog");
    expect(text).toContain("## Props");
    expect(text).toContain("- open: !boolean");
  });

  it("suggests the closest names for a component that doesn't exist", () => {
    const { text, isError } = call("get_component", { name: "Buton" });
    expect(isError).toBe(true);
    expect(text).toContain("Closest: Button");
  });

  it("resolves a type to what it allows, one alias down", () => {
    const { text } = call("get_type", { name: "TShirtSizes" });
    expect(text).toContain('"xs"');
    expect(text).toContain('CondensedTShirtSizes: "s"');
    expect(call("get_type", { name: "IconName" }).text).toContain("chevronDown");
    expect(call("get_type", { name: "SpacingProps" }).text).toContain("- padding:");
  });

  it("lists the tasks, and returns a task's bundle", () => {
    expect(call("get_task").text).toContain("- pricing: Pricing page");
    expect(call("get_task", { task: "pricing" }).text.length).toBeGreaterThan(500);
  });

  it("returns the compact rules by default and the full ones on request", () => {
    const compact = call("get_rules").text;
    const full = call("get_rules", { full: true }).text;
    expect(full.length).toBeGreaterThan(compact.length);
  });

  it("validates code with the same checks as once-ui-validate-ai-code", () => {
    const bad = call("validate_code", {
      code: 'import { Button } from "@once-ui-system/core";\nexport const A = () => <Button variant="danger">Delete</Button>;',
    }).text;
    expect(bad).toContain("[api.renamed]");
    const good = call("validate_code", {
      code: 'import { Button } from "@once-ui-system/core";\nexport const A = () => <Button tone="danger">Delete</Button>;',
    }).text;
    expect(good).toBe("No mechanical issues found.");
    expect(call("validate_code", { code: "" }).isError).toBe(true);
  });
});
