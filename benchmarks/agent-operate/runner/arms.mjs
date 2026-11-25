// The two ways to hand a model the same page.
//
// bridge:  core's agent bridge, the three tools `agentTools` describes
//          (snapshot, act, query), run on window.__agent.
// browser: browser tools on the accessibility tree, shaped like Playwright
//          MCP's: a snapshot with [ref=eN] marks, then click, type and press
//          by ref, each answered with a fresh snapshot.

const bridgeSchemas = [
  {
    name: "snapshot",
    description:
      "List the controls and page sections on screen: each one's ref, component, label, state (value, checked, open, theme) and the actions it takes now. An entry with confirm runs only after a person says yes; one with secret hides its values. Read it before acting.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "act",
    description:
      'Run steps in order, each calling one action of one control, such as setValue on "Project name" or setChecked on "Weekly digest". A step names its control by ref or label; a list\'s choice can be its label. Stops at the first step that fails; earlier steps stay applied.',
    input_schema: {
      type: "object",
      properties: {
        steps: {
          type: "array",
          items: {
            type: "object",
            properties: {
              ref: { type: "string", description: "A ref from snapshot, or the control's label." },
              action: { type: "string", description: "One of the control's actions." },
              args: { type: "array", description: "The action's arguments, such as the new value.", items: {} },
            },
            required: ["ref", "action"],
            additionalProperties: false,
          },
        },
      },
      required: ["steps"],
      additionalProperties: false,
    },
  },
  {
    name: "query",
    description:
      "Find things without listing the page: with within, the choices of one list (a Select, Tabs, a SegmentedControl) matching text; without it, the controls whose label or choices match text.",
    input_schema: {
      type: "object",
      properties: {
        text: { type: "string" },
        within: { type: "string", description: "A list's ref or label." },
        kind: { type: "string", description: "Keep one component kind, such as select." },
        from: { type: "number", description: "Skip this many choices, for the next 50." },
      },
      additionalProperties: false,
    },
  },
];

const refProps = {
  element: { type: "string", description: "Which element, in words, for the record." },
  ref: { type: "string", description: "The element's ref from the snapshot, such as e12." },
};

const browserSchemas = [
  {
    name: "browser_snapshot",
    description: "Read the page's accessibility tree. Elements carry [ref=eN]; act on them by ref.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "browser_click",
    description: "Click an element. Returns the page's snapshot afterwards.",
    input_schema: { type: "object", properties: refProps, required: ["ref"], additionalProperties: false },
  },
  {
    name: "browser_type",
    description: "Replace the text in an editable element. Returns the page's snapshot afterwards.",
    input_schema: {
      type: "object",
      properties: {
        ...refProps,
        text: { type: "string" },
        submit: { type: "boolean", description: "Press Enter afterwards." },
      },
      required: ["ref", "text"],
      additionalProperties: false,
    },
  },
  {
    name: "browser_press_key",
    description: "Press a key, such as ArrowDown, Enter or Escape. Returns the page's snapshot afterwards.",
    input_schema: {
      type: "object",
      properties: { key: { type: "string" } },
      required: ["key"],
      additionalProperties: false,
    },
  },
];

const ariaSnapshot = (page) => page.locator("body").ariaSnapshot({ mode: "ai" });

export const arms = {
  bridge: {
    tools: bridgeSchemas,
    async call(page, name, input) {
      return page.evaluate(
        ([tool, args]) => {
          const agent = window.__agent;
          if (tool === "snapshot") return agent.snapshot();
          if (tool === "query") return agent.query(args);
          return agent.act(args);
        },
        [name, input],
      );
    },
  },
  browser: {
    tools: browserSchemas,
    async call(page, name, input) {
      if (name === "browser_snapshot") return ariaSnapshot(page);
      const target = input.ref ? page.locator(`aria-ref=${input.ref}`) : null;
      if (name === "browser_click") await target.click({ timeout: 3000 });
      if (name === "browser_type") {
        await target.fill(input.text, { timeout: 3000 });
        if (input.submit) await target.press("Enter");
      }
      if (name === "browser_press_key") await page.keyboard.press(input.key);
      await page.waitForTimeout(150);
      return `Done.\n\n${await ariaSnapshot(page)}`;
    },
  },
};
