# Token export

`once-ui.tokens.json` is the Once UI token set as JSON, for platforms that
cannot load `tokens.css`: `@once-ui-system/native` reads it, and Figma, Swift or
Kotlin tooling can too. It is generated from `scss/tokens/` by
`scripts/export-tokens.mjs` — run `pnpm export:tokens` after changing a token;
`pnpm check:tokens` (and the test suite) fails while the file is stale.

Core ships the same file as `@once-ui-system/core/tokens.json`.

## Format

```jsonc
{
  "format": "once-ui-tokens",
  "version": 1,
  "breakpoints": { "xs": 480, "s": 768, "m": 1024, "l": 1440, "xl": 1441 },
  "layers": [
    { "when": {}, "tokens": { "scheme-blue-500": "#2d69fa", "function-info-500": "{scheme-gray-500}" } },
    { "when": { "brand": "blue" }, "tokens": { "function-brand-500": "{scheme-blue-500}" } },
    { "when": { "theme": "dark" }, "tokens": { "brand-background-strong": "{function-brand-300}" } },
    { "when": {}, "maxWidth": 768, "tokens": { "responsive-space-m": "{static-space-12}" } }
  ]
}
```

Each layer is one CSS rule from `scss/tokens/`:

- `when` — the `data-*` attributes its selector needs, camel-cased to match
  `ThemeProvider` props (`data-solid-style` → `solidStyle`). `{}` is `:root`.
- `maxWidth` — set when the rule sits in a breakpoint's `@media (max-width)`.
- `tokens` — the custom properties it sets, without the leading `--`.

To resolve a theme, take every layer whose `when` entries all equal your
settings (and whose `maxWidth`, if any, is at least your screen width), apply
them in order of how many conditions they have (`:root` counts as one), then
file order — the same order the CSS cascade uses — and follow `{name}`
references until you reach a value.

Values:

| Kind | Example | Notes |
| --- | --- | --- |
| Colour | `"#2d69fa"`, `"#0000001f"` | sRGB hex, converted from the OKLCH source; 8 digits when translucent. |
| Reference | `"{function-brand-300}"` | Another token. |
| Length | `"0.75rem"`, `"1px"` | rem follows the root font size: 16px, 15px on phones (`font-scaling-mobile`). |
| Number | `500`, `1.1` | Font weights, multipliers. |
| Shadow | `[{ "x": 0, "y": 1, "blur": 2, "spread": 0, "color": "#00000014" }]` | One entry per layer. |
| Other | `"ease-in-out"`, `"blur(1rem)"` | Kept as CSS text. |
