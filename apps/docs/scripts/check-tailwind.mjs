#!/usr/bin/env node
/**
 * Fails when Tailwind CSS changes how Once UI looks, or when the adapter's
 * Tailwind classes stop doing what the docs page says.
 *
 * Builds one page of Once UI utility classes (the ones components emit, such
 * as `padding-4` for `padding="4"`) next to Tailwind classes, with Tailwind
 * 4 compiled from `@once-ui-system/core/tailwind.css` + `tailwindcss`, as an
 * app's globals.css would. The page is opened in Chrome three ways: Once UI
 * alone, Tailwind's stylesheet before Once UI's, and after it (a bundler may
 * load them in either order). At 1280 and 390 wide, dark and light, every
 * Once UI element must compute the same styles in all three, and the
 * Tailwind elements must match the values below.
 *
 * It uses Tailwind's compiler rather than a Next build, so it runs in a few
 * seconds after `pnpm --filter @once-ui-system/core build`.
 *
 *   node scripts/check-tailwind.mjs
 *
 * CHROME_PATH picks the browser; without it the installed Google Chrome is
 * used, which GitHub's runners have.
 */
import { readdirSync, readFileSync } from "node:fs";
import { createRequire, register } from "node:module";
import { dirname, join } from "node:path";
import { chromium } from "playwright-core";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { compile } from "tailwindcss";

const require = createRequire(import.meta.url);
const CORE = dirname(require.resolve("@once-ui-system/core/package.json"));
const TW = dirname(require.resolve("tailwindcss/package.json"));
const read = (file) => readFileSync(file, "utf8");

register("./tailwind-smoke/css-modules.mjs", import.meta.url);
const ui = await import("@once-ui-system/core");
const { scopeModuleCss } = await import("./tailwind-smoke/css-modules.mjs");

// Once UI components, rendered on the server as an app's page would be, and
// a few Tailwind classes beside them. Every element under #oui is compared
// across the three builds; the #tw elements are checked against EXPECT.
const h = createElement;
const OUI = renderToStaticMarkup(
  h(
    ui.LayoutProvider,
    null,
    h(
      ui.IconProvider,
      null,
      h(
        ui.Column,
        { id: "oui", fillWidth: true, padding: "24", gap: "16", background: "surface" },
        h(
          ui.Row,
          {
            gap: "8",
            padding: "4",
            radius: "m",
            border: "neutral-medium",
            s: { direction: "column" },
          },
          h(ui.Text, { variant: "body-default-m", onBackground: "neutral-strong" }, "Once UI"),
          h(ui.Button, { variant: "primary", size: "m" }, "Primary"),
          h(ui.Button, { variant: "secondary", size: "s" }, "Secondary"),
          h(ui.IconButton, { icon: "close", variant: "tertiary", tooltip: undefined }),
        ),
        h(ui.Heading, { variant: "heading-strong-l" }, "Heading"),
        h(
          ui.Grid,
          { columns: "3", s: { columns: "1" }, gap: "4", marginTop: "8" },
          h(ui.Card, { padding: "16", radius: "l" }, "Card"),
          h(ui.Tag, { label: "Tag" }),
          h(ui.Kbd, null, "K"),
        ),
        h(ui.Input, { id: "i", label: "Email", placeholder: "you@site.com" }),
        h(ui.Textarea, { id: "t", label: "Message", lines: 3 }),
        h(ui.Checkbox, { label: "Remember me" }),
        h(ui.Switch, { checked: true, onCheckedChange: () => {} }),
        h(ui.Line, null),
        h(ui.Avatar, { value: "LT", size: "m" }),
      ),
    ),
  ),
);
const BODY = `${OUI}
<div id="tw">
  <div data-tw="p" class="p-4">tw</div>
  <div data-tw="over" class="padding-8 p-4">tw</div>
  <div data-tw="bg" class="bg-brand-strong">tw</div>
  <div data-tw="dark" class="bg-brand-strong dark:bg-surface">tw</div>
  <div data-tw="text" class="text-heading-m font-heading">tw</div>
  <div data-tw="rounded" class="rounded-m shadow-m">tw</div>
  <div data-tw="xs" class="rounded-xs">tw</div>
</div>`;

const PROPS = [
  "display",
  "flexDirection",
  "gridTemplateColumns",
  "gap",
  "padding",
  "margin",
  "top",
  "left",
  "position",
  "borderRadius",
  "borderWidth",
  "backgroundColor",
  "color",
  "fontFamily",
  "fontSize",
  "lineHeight",
  "width",
  "height",
  "resize",
  "cursor",
];

/** What the Tailwind elements compute; `var(--x)` is read from :root. */
const EXPECT = {
  p: { padding: "1rem" },
  // Tailwind's utilities layer sits above Once UI's, so a className wins.
  over: { padding: "1rem" },
  bg: { backgroundColor: "var(--brand-background-strong)" },
  dark: {
    backgroundColor: { dark: "var(--surface-background)", light: "var(--brand-background-strong)" },
  },
  text: { fontSize: "var(--font-size-heading-m)", fontFamily: "var(--font-heading)" },
  rounded: { borderRadius: "var(--radius-m)" },
  // Tailwind's own --radius-xs (2px) must not replace Once UI's (4px).
  xs: { borderRadius: "var(--radius-xs)" },
};

async function tailwindCss() {
  const load = async (id, base) => {
    const file =
      id === "tailwindcss"
        ? join(TW, "index.css")
        : id.startsWith("tailwindcss/")
          ? join(TW, id.slice("tailwindcss/".length))
          : join(base, id);
    return { path: file, base: dirname(file), content: read(file) };
  };
  const compiler = await compile(
    `@import "@once-ui-system/core/tailwind.css";\n@import "tailwindcss";\n`,
    {
      base: CORE,
      loadStylesheet: (id, base) =>
        id === "@once-ui-system/core/tailwind.css"
          ? load(join(CORE, "dist/css/tailwind.css"), "/")
          : load(id, base),
    },
  );
  // Every word of the page is a candidate, as Tailwind's scanner would find.
  return compiler.build([...new Set(BODY.match(/[\w:-]+/g))]);
}

const modules = readdirSync(join(CORE, "dist"), { recursive: true })
  .filter((f) => f.endsWith(".module.css"))
  .sort()
  .map((f) => scopeModuleCss(join(CORE, "dist", f)));
const once = [
  read(join(CORE, "dist/css/tokens.css")),
  read(join(CORE, "dist/css/styles.css")),
  ...modules,
].join("\n");
const tw = await tailwindCss();
const BUILDS = {
  "Once UI alone": [once],
  "Tailwind first": [tw, once],
  "Once UI first": [once, tw],
};

// What an app's layout sets around Once UI: fonts from next/font, and
// `<Column as="body" margin="0">`.
const APP =
  ":root{--font-heading:Arial;--font-body:Arial;--font-label:Arial;--font-code:monospace}body{margin:0}";

// The attributes ThemeProvider puts on <html>, at their defaults.
const HTML_ATTRS = Object.entries(ui.defaultStyleOptions)
  .filter(([key]) => key !== "theme")
  .map(([key, value]) => `data-${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}="${value}"`)
  .join(" ");

const page = (theme, sheets) =>
  `<!doctype html><html ${HTML_ATTRS} data-theme="${theme}"><head><meta charset="utf-8">${sheets
    .map((s) => `<style>${s}</style>`)
    .join("")}<style>${APP}</style></head><body>${BODY}</body></html>`;

const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" },
);
const problems = [];

function measure([props, expect]) {
  const root = getComputedStyle(document.documentElement);
  // Each wanted value is computed on a probe, so `1rem`, `oklch(…)` and `#…`
  // compare as the browser resolves them.
  const probe = document.createElement("div");
  document.body.append(probe);
  const resolve = (prop, value) => {
    const m = /^var\((--[\w-]+)\)$/.exec(value);
    probe.style[prop] = m ? root.getPropertyValue(m[1]).trim() : value;
    return getComputedStyle(probe)[prop];
  };
  const theme = document.documentElement.dataset.theme;
  const oui = {};
  for (const [i, el] of [...document.querySelectorAll("#oui, #oui *")].entries()) {
    const style = getComputedStyle(el);
    // A native input drawn over by Once UI's own control is never seen.
    if (style.opacity === "0") continue;
    const name = `${el.tagName.toLowerCase()}#${i}.${[...el.classList].slice(0, 3).join(".")}`;
    oui[name] = Object.fromEntries(props.map((p) => [p, style[p]]));
  }
  const tw = [];
  for (const [name, wants] of Object.entries(expect)) {
    const style = getComputedStyle(document.querySelector(`[data-tw="${name}"]`));
    for (const [prop, want] of Object.entries(wants)) {
      const value = typeof want === "string" ? want : want[theme];
      const expected = resolve(prop, value);
      if (style[prop] !== expected)
        tw.push(`${name} ${prop}: ${style[prop]}, wanted ${expected} (${value})`);
    }
  }
  probe.remove();
  return { oui, tw };
}

for (const width of [1280, 390]) {
  for (const theme of ["dark", "light"]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const tab = await context.newPage();
    const results = {};
    for (const [name, sheets] of Object.entries(BUILDS)) {
      await tab.setContent(page(theme, sheets));
      results[name] = await tab.evaluate(measure, [PROPS, name === "Once UI alone" ? {} : EXPECT]);
    }
    await context.close();
    const where = `${width}px ${theme}`;
    const base = results["Once UI alone"].oui;
    for (const [name, { oui, tw: twProblems }] of Object.entries(results)) {
      for (const p of twProblems) problems.push(`${where}, ${name}: ${p}`);
      if (name === "Once UI alone") continue;
      for (const [el, style] of Object.entries(base)) {
        for (const prop of PROPS) {
          if (oui[el][prop] !== style[prop]) {
            problems.push(
              `${where}, ${name}: ${el} ${prop} is ${oui[el][prop]}, ${style[prop]} without Tailwind`,
            );
          }
        }
      }
    }
  }
}
await browser.close();

if (problems.length) {
  console.error(`check-tailwind: ${problems.length} problem(s)\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log(
  `check-tailwind: Once UI looks the same with Tailwind in ${Object.keys(BUILDS).length - 1} stylesheet orders, at 2 widths and 2 themes; adapter classes match`,
);
